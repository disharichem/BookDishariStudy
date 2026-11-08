'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { INITIAL_PRODUCTS as PRODUCTS } from '@/data/products';
import { AdminProductManagerModal } from '@/components/AdminProductManagerModal';
import { db, testFirestoreConnection } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

function getInitialAdminProducts(): Product[] {
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
    console.warn('Admin page local custom products initial load notice:', e);
  }
  return PRODUCTS;
}

export default function AdminStandalonePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(getInitialAdminProducts);

  // Sync real-time updates from Firestore products collection
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
          console.warn('Admin page Firestore products listener notice:', error.message);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Admin page Firestore sync notice:', e);
    }
  }, []);

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === updated.id);
      if (exists) {
        return prev.map((p) => (p.id === updated.id ? updated : p));
      }
      return [updated, ...prev];
    });
    try {
      const raw = localStorage.getItem('dishari_custom_products') || '{}';
      const customMap = JSON.parse(raw);
      customMap[updated.id] = updated;
      localStorage.setItem('dishari_custom_products', JSON.stringify(customMap));
    } catch (e) {
      console.warn('Admin page local cache update notice:', e);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100">
      <AdminProductManagerModal
        isOpen={true}
        standalone={true}
        products={products}
        onUpdateProduct={handleUpdateProduct}
        onClose={() => router.push('/')}
      />
    </main>
  );
}
