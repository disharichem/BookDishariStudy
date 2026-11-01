'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PRODUCTS } from '@/data/products';
import { Product, CartItem, CompletedOrder } from '@/types';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Navbar } from '@/components/Navbar';
import { ProductDetailPageView } from '@/components/ProductDetailPageView';
import { SampleReaderModal } from '@/components/SampleReaderModal';
import { WishlistDrawer } from '@/components/WishlistDrawer';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { OrderTrackingModal } from '@/components/OrderTrackingModal';
import { MyPurchasedPdfsModal } from '@/components/MyPurchasedPdfsModal';
import { AdminProductManagerModal } from '@/components/AdminProductManagerModal';
import { Footer } from '@/components/Footer';
import { FloatingSupport } from '@/components/FloatingSupport';
import { CheckCircle2, ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id;
  const productId = Array.isArray(rawId) ? rawId[0] : rawId;

  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [sampleProduct, setSampleProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isMyPdfsOpen, setIsMyPdfsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<CompletedOrder[]>([]);

  // Sync custom products from Firestore if edited
  useEffect(() => {
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
          console.warn('Firestore products listener:', error.message);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Firestore fallback:', e);
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

  const currentProduct = products.find((p) => p.id === productId) || null;

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

  const handleRemoveFromWishlist = (id: string) => {
    setWishlistIds((prev) => {
      const updated = prev.filter((item) => item !== id);
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
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev;
      }
      return [{ product, quantity: 1 }];
    });
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === id ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== id));
  };

  const handleOrderSuccess = (order: CompletedOrder) => {
    setRecentOrders((prev) => [order, ...prev]);
    setCartItems([]);
    showToast(`অর্ডার সফল! অর্ডার কোড: ${order.orderId}`);
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
        onFilterChange={() => {
          router.push('/#catalog');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentProduct ? (
          <ProductDetailPageView
            product={currentProduct}
            allProducts={products}
            isWishlisted={wishlistIds.includes(currentProduct.id)}
            onToggleWishlist={handleToggleWishlist}
            onBack={() => {
              router.push('/#catalog');
            }}
            onDirectOrder={handleDirectOrder}
            onAddToCart={handleAddToCart}
            onOpenSampleModal={(p) => setSampleProduct(p)}
            onSelectRelated={(p) => {
              router.push(`/products/${p.id}`);
            }}
          />
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8 text-cyan-700" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              বই বা হ্যান্ডনোটটি খুঁজে পাওয়া যায়নি
            </h1>
            <p className="text-sm text-slate-600">
              আপনি যে লিঙ্কটি অনুসরণ করেছেন তা পরিবর্তিত হয়ে থাকতে পারে বা বইটি সরিয়ে নেওয়া হয়েছে।
            </p>
            <div className="pt-2">
              <Link
                href="/#catalog"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>সকল বই ও নোট ক্যাটালগে ফিরে যান</span>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenTracking={() => setIsTrackingOpen(true)}
        onOpenMyPdfs={() => setIsMyPdfsOpen(true)}
        onOpenAdminManager={() => setIsAdminOpen(true)}
        onFilterChange={() => {
          router.push('/#catalog');
        }}
      />

      {/* Dedicated Sample Reader Popup for Reading Book/PDF Excerpts */}
      <SampleReaderModal
        product={sampleProduct}
        onClose={() => setSampleProduct(null)}
        onDirectOrder={handleDirectOrder}
        onAddToCart={handleAddToCart}
        onViewFullDetails={(p) => {
          setSampleProduct(null);
          router.push(`/products/${p.id}`);
        }}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        items={products.filter((p) => wishlistIds.includes(p.id))}
        onRemoveFromWishlist={handleRemoveFromWishlist}
        onMoveToCart={handleMoveWishlistToCart}
        onAddAllToCart={handleAddAllWishlistToCart}
        onClearWishlist={handleClearWishlist}
        onViewProduct={(id) => {
          setIsWishlistOpen(false);
          router.push(`/products/${id}`);
        }}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        onOrderSuccess={handleOrderSuccess}
        onOpenMyPdfs={() => setIsMyPdfsOpen(true)}
      />

      {/* Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        recentOrders={recentOrders}
      />

      {/* My Purchased PDFs Modal */}
      <MyPurchasedPdfsModal
        isOpen={isMyPdfsOpen}
        onClose={() => setIsMyPdfsOpen(false)}
        recentOrders={recentOrders}
      />

      {/* Admin Manager Modal */}
      <AdminProductManagerModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onUpdateProduct={(updated) => {
          setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
          showToast(`"${updated.titleBn}" ডাটা সফলভাবে আপডেট হয়েছে!`);
        }}
      />

      {/* Floating Support */}
      <FloatingSupport />

    </div>
  );
}
