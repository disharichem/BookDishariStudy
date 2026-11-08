'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PRODUCTS } from '@/data/products';
import { Product, CartItem, CompletedOrder, ChemistryBranch } from '@/types';
import { testFirestoreConnection, db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ProductDetailPageView } from '@/components/ProductDetailPageView';
import { SampleReaderModal } from '@/components/SampleReaderModal';
import { WishlistDrawer } from '@/components/WishlistDrawer';
import { AdminProductManagerModal } from '@/components/AdminProductManagerModal';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { OrderTrackingModal } from '@/components/OrderTrackingModal';
import { MyPurchasedPdfsModal } from '@/components/MyPurchasedPdfsModal';
import { OrderInstructions } from '@/components/OrderInstructions';
import { AboutUs } from '@/components/AboutUs';
import { FAQSection } from '@/components/FAQSection';
import { ContactUs } from '@/components/ContactUs';
import { StudentReviews } from '@/components/StudentReviews';
import { Footer } from '@/components/Footer';
import { BestSellers } from '@/components/BestSellers';
import { BookCatalog } from '@/components/BookCatalog';
import { PriceAlertToast } from '@/components/PriceAlertToast';
import { RecentlyViewed } from '@/components/RecentlyViewed';
import { addRecentlyViewed } from '@/lib/recentlyViewed';
import { useCart } from '@/lib/cartStore';
import { useWishlist } from '@/lib/wishlistStore';
import { useRecentOrders } from '@/lib/recentOrders';
import { Check, CheckCircle2 } from 'lucide-react';

function getInitialProducts(): Product[] {
  if (typeof window === 'undefined') return PRODUCTS;
  try {
    const raw = localStorage.getItem('dishari_custom_products');
    if (raw) {
      const customMap = JSON.parse(raw) as Record<string, Product>;
      const customList = Object.values(customMap);
      if (customList.length > 0) {
        const copy = [...PRODUCTS];
        customList.forEach((cp) => {
          const idx = copy.findIndex((p) => p.id === cp.id);
          if (idx !== -1) {
            copy[idx] = { ...copy[idx], ...cp };
          } else {
            copy.push(cp);
          }
        });
        return copy;
      }
    }
  } catch (e) {
    console.warn('Local custom products initial load notice:', e);
  }
  return PRODUCTS;
}

export default function HomePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(getInitialProducts);
  const [activeCategory, setActiveCategory] = useState<'all' | 'printed' | 'pdf' | 'combo'>('all');
  const [selectedBranch, setSelectedBranch] = useState<ChemistryBranch>('all');
  
  // Persistent shopping cart & wishlist stores (synced across tabs & pages via localStorage)
  const {
    cartItems,
    totalCartCount,
    addToCart,
    directOrder,
    updateQuantity,
    removeFromCart,
    clearCart,
    addAllFromWishlist,
  } = useCart(products);

  const {
    wishlistIds,
    wishlistedProducts,
    toggleWishlist,
    removeFromWishlist,
    clearWishlist,
  } = useWishlist(products);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sampleProduct, setSampleProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isMyPdfsOpen, setIsMyPdfsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { recentOrders, addRecentOrder } = useRecentOrders();

  const handleOpenProduct = (product: Product) => {
    addRecentlyViewed(product.id);
    router.push(`/products/${product.id}`);
  };

  const handleOpenProductById = (productId: string) => {
    addRecentlyViewed(productId);
    router.push(`/products/${productId}`);
  };

  const handleOpenSampleModal = (product: Product) => {
    addRecentlyViewed(product.id);
    setSampleProduct(product);
  };

  const handleOpenSampleModalById = (productId: string) => {
    addRecentlyViewed(productId);
    const found = products.find((p) => p.id === productId);
    if (found) {
      setSampleProduct(found);
    }
  };

  // Test Firestore connection on boot and listen to real-time updates from Firestore
  useEffect(() => {
    testFirestoreConnection();

    try {
      const unsub = onSnapshot(
        collection(db, 'products'),
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteProducts: Product[] = [];
            snapshot.forEach((d) => {
              const data = d.data() as Partial<Product>;
              const existing = PRODUCTS.find((p) => p.id === d.id);
              if (existing) {
                remoteProducts.push({
                  ...existing,
                  ...data,
                  id: d.id,
                } as Product);
              } else {
                remoteProducts.push({
                  id: d.id,
                  sku: data.sku || `DC-PROD-${d.id}`,
                  titleBn: data.titleBn || 'নতুন বই / নোট',
                  titleEn: data.titleEn || 'New Book/Note',
                  subtitleBn: data.subtitleBn || '',
                  format: data.format || 'printed',
                  price: data.price || 0,
                  originalPrice: data.originalPrice,
                  isSamplePrice: Boolean(data.isSamplePrice),
                  availabilityStatus: data.availabilityStatus || 'in_stock',
                  stockQuantity: data.stockQuantity ?? 50,
                  inventoryTracking: data.format !== 'pdf',
                  coverImage: data.coverImage || '/images/book_ssc_chemistry_guide_1793290222060.jpg',
                  description: data.description || '',
                  highlights: ['এসএসসি প্রস্তুতি সহায়ক', 'অধ্যায়ভিত্তিক সারসংক্ষেপ ও প্রশ্নাবলি'],
                  chapters: [],
                  samplePages: [],
                  isPublished: data.isPublished !== false,
                  hasSecurePdf: Boolean(data.hasSecurePdf),
                  pdfFileRef: data.pdfFileRef,
                  pdfFileName: data.pdfFileName,
                  pdfFileSizeMb: data.pdfFileSizeMb,
                  ...data,
                } as Product);
              }
            });
            if (remoteProducts.length > 0) {
              setProducts((prev) => {
                const updated = [...prev];
                remoteProducts.forEach((rp) => {
                  const idx = updated.findIndex((u) => u.id === rp.id);
                  if (idx !== -1) {
                    updated[idx] = { ...updated[idx], ...rp };
                  } else {
                    updated.push(rp);
                  }
                });
                return updated;
              });
            }
          }
        },
        (error) => {
          console.warn('Firestore products listener info:', error.message);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Firestore products listener fallback:', e);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleToggleWishlist = (product: Product) => {
    const isAdded = toggleWishlist(product);
    if (isAdded) {
      showToast(`"${product.titleBn}" উইশলিস্টে যুক্ত করা হয়েছে! ❤️`);
    } else {
      showToast(`"${product.titleBn}" উইশলিস্ট থেকে সরানো হয়েছে।`);
    }
  };

  const handleRemoveFromWishlist = (productId: string) => {
    removeFromWishlist(productId);
    showToast('বইটি উইশলিস্ট থেকে সরানো হয়েছে।');
  };

  const handleMoveWishlistToCart = (product: Product) => {
    addToCart(product);
    showToast(`"${product.titleBn}" ব্যাগে যুক্ত করা হয়েছে!`);
  };

  const handleAddAllWishlistToCart = () => {
    if (wishlistedProducts.length === 0) return;
    addAllFromWishlist(wishlistedProducts);
    showToast(`${wishlistedProducts.length}টি বই ব্যাগে যোগ করা হয়েছে!`);
    setIsWishlistOpen(false);
    setIsCartOpen(true);
  };

  const handleClearWishlist = () => {
    clearWishlist();
    showToast('উইশলিস্ট খালি করা হয়েছে।');
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    showToast(`"${product.titleBn}" ব্যাগে যুক্ত করা হয়েছে!`);
  };

  const handleDirectOrder = (product: Product) => {
    directOrder(product);
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    updateQuantity(productId, quantity);
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
  };

  const handleOrderSuccess = (order: CompletedOrder) => {
    addRecentOrder(order);
    clearCart();
    showToast(`অর্ডার সফল! অর্ডার কোড: ${order.orderId}`);
  };

  const handleHeroBuyBooks = () => {
    setActiveCategory('printed');
    const el = document.getElementById('catalog');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleHeroBuyPdf = () => {
    setActiveCategory('pdf');
    const el = document.getElementById('catalog');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm animate-in slide-in-from-top-2 duration-200 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Reactive Price Change & Discount Toast Notification */}
      <PriceAlertToast products={products} onOpenProduct={handleOpenProduct} />

      {/* Main Top Navigation */}
      <Navbar
        cartCount={totalCartCount}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenTracking={() => setIsTrackingOpen(true)}
        onOpenMyPdfs={() => setIsMyPdfsOpen(true)}
        onOpenAdminManager={() => router.push('/admin')}
        onFilterChange={(cat) => {
          setSelectedProduct(null);
          setActiveCategory(cat);
          setTimeout(() => {
            const el = document.getElementById('catalog');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }}
      />

      {/* Main Page Area: Full Page Product Detail OR Homepage Sections */}
      <main className="flex-1">
        {selectedProduct ? (
          <ProductDetailPageView
            product={selectedProduct}
            allProducts={products}
            isWishlisted={wishlistIds.includes(selectedProduct.id)}
            onToggleWishlist={handleToggleWishlist}
            onBack={() => {
              setSelectedProduct(null);
              setTimeout(() => {
                const el = document.getElementById('catalog');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }}
            onDirectOrder={handleDirectOrder}
            onAddToCart={handleAddToCart}
            onOpenSampleModal={handleOpenSampleModal}
            onSelectRelated={(p) => handleOpenProduct(p)}
          />
        ) : (
          <>
            <Hero
              onBuyBooks={handleHeroBuyBooks}
              onBuyPdf={handleHeroBuyPdf}
              onViewDetails={handleOpenProductById}
              onOpenSample={handleOpenSampleModalById}
            />

            {/* Recently Viewed Books Section (tracks last 5 books stored in localStorage) */}
            <RecentlyViewed
              products={products}
              onOpenProduct={handleOpenProduct}
              onDirectOrder={handleDirectOrder}
              onOpenSampleModal={handleOpenSampleModal}
            />

            {/* Best Sellers Section (সর্বাধিক বিক্রিত বই ও হ্যান্ডনোট) */}
            <BestSellers
              products={products}
              wishlistIds={wishlistIds}
              onToggleWishlist={handleToggleWishlist}
              onOpenProduct={handleOpenProduct}
              onDirectOrder={handleDirectOrder}
              onAddToCart={handleAddToCart}
              onOpenSampleModal={handleOpenSampleModal}
            />

            {/* SSC Chemistry Books & Notes Catalog (এসএসসি রসায়ন বই ও ডিজিটাল নোটস) */}
            <BookCatalog
              products={products}
              wishlistIds={wishlistIds}
              onToggleWishlist={handleToggleWishlist}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              selectedBranch={selectedBranch}
              onSelectBranch={setSelectedBranch}
              onOpenSample={handleOpenSampleModal}
              onViewDetails={handleOpenProduct}
              onDirectOrder={handleDirectOrder}
              onAddToCart={handleAddToCart}
            />

            {/* 3 Step Ordering Guide */}
            <OrderInstructions />

            {/* Student Reviews & Social Proof */}
            <StudentReviews />

            {/* About Dishari Chemistry */}
            <AboutUs />

            {/* FAQ Section */}
            <FAQSection />

            {/* Contact Section */}
            <ContactUs />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenTracking={() => setIsTrackingOpen(true)}
        onOpenMyPdfs={() => setIsMyPdfsOpen(true)}
        onOpenAdminManager={() => router.push('/admin')}
        onFilterChange={(cat) => {
          setSelectedProduct(null);
          setActiveCategory(cat);
          setTimeout(() => {
            const el = document.getElementById('catalog');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }}
      />

      {/* Modals & Drawers */}
      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        items={products.filter((p) => wishlistIds.includes(p.id))}
        onRemoveFromWishlist={handleRemoveFromWishlist}
        onMoveToCart={handleMoveWishlistToCart}
        onAddAllToCart={handleAddAllWishlistToCart}
        onClearWishlist={handleClearWishlist}
        onViewProduct={(id) => handleOpenProductById(id)}
      />

      {/* 1. Dedicated Sample Reader Popup for Reading Book/PDF Excerpts */}
      <SampleReaderModal
        product={sampleProduct}
        onClose={() => setSampleProduct(null)}
        onDirectOrder={handleDirectOrder}
        onAddToCart={handleAddToCart}
        onViewFullDetails={(product) => {
          setSelectedProduct(product);
          if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        onOrderSuccess={handleOrderSuccess}
        onOpenMyPdfs={() => setIsMyPdfsOpen(true)}
      />

      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        recentOrders={recentOrders}
      />

      <MyPurchasedPdfsModal
        isOpen={isMyPdfsOpen}
        onClose={() => setIsMyPdfsOpen(false)}
        recentOrders={recentOrders}
      />

      {/* Admin Product Manager Modal */}
      <AdminProductManagerModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onUpdateProduct={(updated) => {
          setProducts((prev) => {
            const exists = prev.some((p) => p.id === updated.id);
            if (exists) {
              return prev.map((p) => (p.id === updated.id ? updated : p));
            }
            return [updated, ...prev];
          });
          if (selectedProduct && selectedProduct.id === updated.id) {
            setSelectedProduct(updated);
          }
          showToast(`"${updated.titleBn}" ডাটা সফলভাবে সংরক্ষিত হয়েছে!`);
        }}
      />

    </div>
  );
}
