'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PRODUCTS } from '@/data/products';
import { Product, CartItem, CompletedOrder, ChemistryBranch } from '@/types';
import { testFirestoreConnection, db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ProductCategories } from '@/components/ProductCategories';
import { BookCatalog } from '@/components/BookCatalog';
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
import { FloatingSupport } from '@/components/FloatingSupport';
import { Check, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [activeCategory, setActiveCategory] = useState<'all' | 'printed' | 'pdf' | 'combo'>('all');
  const [selectedBranch, setSelectedBranch] = useState<ChemistryBranch>('all');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sampleProduct, setSampleProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isMyPdfsOpen, setIsMyPdfsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<CompletedOrder[]>([]);

  const handleOpenProduct = (product: Product) => {
    router.push(`/products/${product.id}`);
  };

  const handleOpenProductById = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  const handleOpenSampleModal = (product: Product) => {
    setSampleProduct(product);
  };

  const handleOpenSampleModalById = (productId: string) => {
    const found = products.find((p) => p.id === productId);
    if (found) {
      setSampleProduct(found);
    }
  };

  // Test Firestore connection on boot and sync products if any customized in Firestore
  useEffect(() => {
    testFirestoreConnection();

    // Listen to customized products from Firestore
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
              }
            });
            if (remoteProducts.length > 0) {
              setProducts((prev) => {
                const updated = [...prev];
                remoteProducts.forEach((rp) => {
                  const idx = updated.findIndex((u) => u.id === rp.id);
                  if (idx !== -1) {
                    updated[idx] = rp;
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

    // Hydrate wishlist from localStorage asynchronously
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem('dishari_wishlist_ids');
        if (stored) {
          setWishlistIds(JSON.parse(stored));
        }
      } catch (e) {
        console.warn('LocalStorage wishlist load error:', e);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleToggleWishlist = (product: Product) => {
    setWishlistIds((prev) => {
      let updated: string[];
      if (prev.includes(product.id)) {
        updated = prev.filter((id) => id !== product.id);
        showToast(`"${product.titleBn}" উইশলিস্ট থেকে সরানো হয়েছে।`);
      } else {
        updated = [...prev, product.id];
        showToast(`"${product.titleBn}" উইশলিস্টে যুক্ত করা হয়েছে! ❤️`);
      }
      try {
        localStorage.setItem('dishari_wishlist_ids', JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
      return updated;
    });
  };

  const handleRemoveFromWishlist = (productId: string) => {
    setWishlistIds((prev) => {
      const updated = prev.filter((id) => id !== productId);
      try {
        localStorage.setItem('dishari_wishlist_ids', JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
      return updated;
    });
    showToast('বইটি উইশলিস্ট থেকে সরানো হয়েছে।');
  };

  const handleMoveWishlistToCart = (product: Product) => {
    handleAddToCart(product);
  };

  const handleAddAllWishlistToCart = () => {
    const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));
    if (wishlistedProducts.length === 0) return;
    setCartItems((prev) => {
      const updated = [...prev];
      wishlistedProducts.forEach((p) => {
        const existing = updated.find((item) => item.product.id === p.id);
        if (existing) {
          existing.quantity += 1;
        } else {
          updated.push({ product: p, quantity: 1 });
        }
      });
      return updated;
    });
    showToast(`${wishlistedProducts.length}টি বই ব্যাগে যোগ করা হয়েছে!`);
    setIsWishlistOpen(false);
    setIsCartOpen(true);
  };

  const handleClearWishlist = () => {
    setWishlistIds([]);
    try {
      localStorage.removeItem('dishari_wishlist_ids');
    } catch (e) {
      console.warn('LocalStorage clear error:', e);
    }
    showToast('উইশলিস্ট খালি করা হয়েছে।');
  };

  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`"${product.titleBn}" ব্যাগে যুক্ত করা হয়েছে!`);
  };

  const handleDirectOrder = (product: Product) => {
    // Add to cart if not present, then open checkout directly
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev;
      }
      return [{ product, quantity: 1 }];
    });
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleOrderSuccess = (order: CompletedOrder) => {
    setRecentOrders((prev) => [order, ...prev]);
    setCartItems([]);
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

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm animate-in slide-in-from-top-2 duration-200 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar
        cartCount={totalCartCount}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenTracking={() => setIsTrackingOpen(true)}
        onOpenMyPdfs={() => setIsMyPdfsOpen(true)}
        onOpenAdminManager={() => setIsAdminOpen(true)}
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

            {/* Product Categories: Organic, Inorganic, Physical Chemistry */}
            <ProductCategories
              selectedBranch={selectedBranch}
              onSelectBranch={setSelectedBranch}
            />

            {/* Book Catalog Section with Filter, Branch Filter, and Search */}
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
        onOpenAdminManager={() => setIsAdminOpen(true)}
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
          setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
          if (selectedProduct && selectedProduct.id === updated.id) {
            setSelectedProduct(updated);
          }
          showToast(`"${updated.titleBn}" ডাটা সফলভাবে আপডেট হয়েছে!`);
        }}
      />

      {/* Floating WhatsApp Action */}
      <FloatingSupport />

    </div>
  );
}
