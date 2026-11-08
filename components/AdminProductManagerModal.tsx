'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product, FirestoreOrderRecord } from '@/types';
import {
  auth,
  db,
  storage,
  signInWithGoogle,
  logOut,
  onAuthUserChanged,
  handleFirestoreError,
  OperationType,
} from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  setDoc,
  getDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import { User } from 'firebase/auth';
import {
  X,
  Database,
  Edit3,
  Check,
  Save,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  LogIn,
  LogOut as LogOutIcon,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  UserCheck,
  Truck,
  Eye,
  Plus,
  Upload,
  Download,
  FolderLock,
  Lock,
  Unlock,
  FileCheck,
  CreditCard,
  Search,
  Copy,
  Filter,
  BellRing,
  Tag,
  Percent,
  EyeOff,
  KeyRound,
  ArrowLeft,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { AdminUploadPDF } from './AdminUploadPDF';
import { broadcastPriceAlert } from './PriceAlertToast';

export { AdminUploadPDF };

interface AdminProductManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdateProduct: (updated: Product) => void;
  standalone?: boolean;
}

const AUTHORIZED_ADMIN_EMAIL = 'disharichem@gmail.com';
const ADMIN_MASTER_PASSWORD = 'SHSaydi@25';
const FIREBASE_CONSOLE_URL =
  'https://console.firebase.google.com/project/gen-lang-client-0258057042/firestore/databases/ai-studio-disharichemistry-7064b0d9-ac52-43fd-9efe-478877a36913/data';

export const PRESET_COVERS = [
  {
    label: 'এসএসসি রসায়ন সহায়িকা',
    url: '/images/book_ssc_chemistry_guide_1793290222060.jpg',
    tag: 'মুদ্রিত বই',
  },
  {
    label: 'জৈব রসায়ন স্পেশাল হ্যান্ডনোট',
    url: '/images/book_organic_chemistry_notes_1793290222839.jpg',
    tag: 'ডিজিটাল PDF',
  },
  {
    label: 'CQ ও MCQ টেস্টপেপার প্রশ্নব্যাংক',
    url: '/images/book_cq_mcq_testpaper_1793290223329.jpg',
    tag: 'প্রশ্নব্যাংক',
  },
  {
    label: 'ব্যবহারিক রসায়ন ও ভাইভা নোট',
    url: '/images/book_practical_exam_notes_1793290222546.jpg',
    tag: 'ব্যবহারিক',
  },
];

function generateProductId(format: string): { id: string; sku: string } {
  const timestamp = Date.now().toString(36);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  const num = Math.floor(100 + Math.random() * 900);
  return {
    id: `dc-${format}-${timestamp}_${randomSuffix}`,
    sku: `DC-${format === 'pdf' ? 'PDF' : format === 'combo' ? 'CMB' : 'BK'}-${num}`,
  };
}

function generateDemoOrderIdentifiers(): { demoId: string; demoTxn: string } {
  const idNum = Math.floor(100000 + Math.random() * 900000);
  const txnNum = Math.floor(10000000 + Math.random() * 90000000);
  return {
    demoId: `DC-TEST-${idNum}`,
    demoTxn: `TXN${txnNum}B`,
  };
}

export const AdminProductManagerModal: React.FC<AdminProductManagerModalProps> = ({
  isOpen,
  onClose,
  products,
  onUpdateProduct,
  standalone = false,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('dishari_admin_auth_unlocked') === 'true';
    }
    return false;
  });
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'pdf_vault' | 'payment_verification'>('orders');
  const [paymentTabFilter, setPaymentTabFilter] = useState<'pending' | 'verified' | 'all'>('pending');
  const [paymentSearchQuery, setPaymentSearchQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Admin Password Gate State
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isPasswordUnlocked, setIsPasswordUnlocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('dishari_admin_auth_unlocked') === 'true';
    }
    return false;
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === ADMIN_MASTER_PASSWORD) {
      setIsPasswordUnlocked(true);
      setIsAuthorizedAdmin(true);
      setPasswordError(null);
      setPasswordInput('');
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('dishari_admin_auth_unlocked', 'true');
      }
      setSavedNotice('অ্যাডমিন ও প্রোডাক্ট ডাটা প্যানেল সফলভাবে আনলক হয়েছে!');
      setTimeout(() => setSavedNotice(null), 3500);
    } else {
      setPasswordError('ভুল পাসওয়ার্ড! অনুগ্রহ করে সঠিক পাসওয়ার্ড প্রদান করুন।');
    }
  };

  const handleLockPanel = () => {
    setIsPasswordUnlocked(false);
    setIsAuthorizedAdmin(false);
    setPasswordInput('');
    setPasswordError(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('dishari_admin_auth_unlocked');
    }
    if (currentUser) {
      logOut();
    }
    setSavedNotice('অ্যাডমিন প্যানেল সুরক্ষিতভাবে লক করা হয়েছে।');
    setTimeout(() => setSavedNotice(null), 2500);
  };

  // PDF Vault Upload State
  const [uploadingProductId, setUploadingProductId] = useState<string | null>(null);
  const [testingDownloadId, setTestingDownloadId] = useState<string | null>(null);

  // Orders State
  const [orders, setOrders] = useState<FirestoreOrderRecord[]>([]);
  const [ordersLoaded, setOrdersLoaded] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<FirestoreOrderRecord | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [statusUpdating, setStatusUpdating] = useState<boolean>(false);

  // Products State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] || null);
  const [isEditingProduct, setIsEditingProduct] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // New Product Creation & Filter State
  const [isCreatingNewProduct, setIsCreatingNewProduct] = useState<boolean>(false);
  const [isSavingProduct, setIsSavingProduct] = useState<boolean>(false);
  const [newPdfFile, setNewPdfFile] = useState<File | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<'all' | 'organic' | 'inorganic' | 'physical'>('all');
  const [productSearchQuery, setProductSearchQuery] = useState<string>('');
  const [productFilterFormat, setProductFilterFormat] = useState<'all' | 'printed' | 'pdf' | 'combo'>('all');

  // Product Form Fields
  const [titleBn, setTitleBn] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [subtitleBn, setSubtitleBn] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [format, setFormat] = useState<'printed' | 'pdf' | 'combo'>('printed');
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [author, setAuthor] = useState('');
  const [edition, setEdition] = useState('');
  const [publisher, setPublisher] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [fileDownloadUrlOrKey, setFileDownloadUrlOrKey] = useState('');
  const [description, setDescription] = useState('');

  // Derived loading state without setState in effect body
  const ordersLoading = isOpen && isAuthorizedAdmin && !ordersLoaded;

  // 1. Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthUserChanged(async (user) => {
      const isSessionUnlocked = typeof window !== 'undefined' && sessionStorage.getItem('dishari_admin_auth_unlocked') === 'true';
      setCurrentUser(user);
      if (user) {
        // Verify if user is explicitly authorized: matches disharichem@gmail.com OR has doc in /admins/{uid}
        const isOwnerEmail = user.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();
        let hasAdminDoc = false;
        try {
          const adminDocSnap = await getDoc(doc(db, 'admins', user.uid));
          hasAdminDoc = adminDocSnap.exists();
        } catch {
          // If security rules or network prevents getDoc, fallback to verified email check
        }

        const isAuth = isSessionUnlocked || isOwnerEmail || hasAdminDoc;
        setIsAuthorizedAdmin(isAuth);
        if (isOwnerEmail || hasAdminDoc) {
          setIsPasswordUnlocked(true);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('dishari_admin_auth_unlocked', 'true');
          }
        }

        // Bootstrap owner record if owner email logs in
        if (isOwnerEmail && !hasAdminDoc) {
          try {
            await setDoc(
              doc(db, 'admins', user.uid),
              {
                email: user.email,
                role: 'superadmin',
                createdAt: new Date().toISOString(),
              },
              { merge: true }
            );
          } catch (e) {
            console.warn('Admin bootstrap notice:', e);
          }
        }
      } else {
        const stillUnlocked = typeof window !== 'undefined' && sessionStorage.getItem('dishari_admin_auth_unlocked') === 'true';
        setIsAuthorizedAdmin(stillUnlocked);
        setIsPasswordUnlocked(stillUnlocked);
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore Orders Listener (Only attach when modal is open AND user is authorized admin)
  useEffect(() => {
    if (!isOpen || !isAuthorizedAdmin) {
      return;
    }

    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedOrders: FirestoreOrderRecord[] = [];
        snapshot.forEach((docSnap) => {
          fetchedOrders.push(docSnap.data() as FirestoreOrderRecord);
        });
        // Sort newest first
        fetchedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(fetchedOrders);
        setSelectedOrder((prev) => prev || (fetchedOrders.length > 0 ? fetchedOrders[0] : null));
        setOrdersLoaded(true);
      },
      (error) => {
        console.warn('Firestore orders snapshot notice (requires admin permission):', error.message);
        setOrdersLoaded(true);
      }
    );

    return () => unsubscribe();
  }, [isOpen, isAuthorizedAdmin, standalone]);

  if (!isOpen && !standalone) return null;

  // Handlers for Products
  const handleSelectProduct = (p: Product) => {
    setIsCreatingNewProduct(false);
    setSelectedProduct(p);
    setTitleBn(p.titleBn);
    setTitleEn(p.titleEn || '');
    setSubtitleBn(p.subtitleBn || '');
    setPrice(p.price);
    setOriginalPrice(p.originalPrice || 0);
    setFormat(p.format);
    setStockQuantity(p.stockQuantity || 0);
    setIsPublished(p.isPublished !== false);
    setAuthor(p.author || '');
    setEdition(p.edition || '');
    setPublisher(p.publisher || '');
    setCoverImage(p.coverImage || '');
    setFileDownloadUrlOrKey(p.fileDownloadUrlOrKey || '');
    setDescription(p.description);
    setIsEditingProduct(false);
    setNewPdfFile(null);
  };

  const handleStartCreateNewProduct = (initialFormat: 'printed' | 'pdf' | 'combo' = 'printed') => {
    setIsCreatingNewProduct(true);
    setIsEditingProduct(false);
    setSelectedProduct(null);
    setTitleBn('');
    setTitleEn('');
    setSubtitleBn('');
    setPrice(initialFormat === 'pdf' ? 120 : 380);
    setOriginalPrice(initialFormat === 'pdf' ? 160 : 480);
    setFormat(initialFormat);
    setStockQuantity(initialFormat === 'pdf' ? 0 : 50);
    setIsPublished(true);
    setAuthor('মোঃ আল মেহেদী');
    setEdition('২০২৫-২০২৬ পরিমার্জিত সংস্করণ');
    setPublisher('দিশারী কেমিস্ট্রি প্রকাশনা');
    setCoverImage(
      initialFormat === 'pdf'
        ? '/images/book_organic_chemistry_notes_1793290222839.jpg'
        : '/images/book_ssc_chemistry_guide_1793290222060.jpg'
    );
    setFileDownloadUrlOrKey('');
    setDescription(
      initialFormat === 'pdf'
        ? 'এসএসসি শিক্ষার্থীদের জন্য রসায়ন অধ্যায়ভিত্তিক সম্পূর্ণ কালারফুল ডিজিটাল পিডিএফ হ্যান্ডনোট। বোর্ড স্ট্যান্ডার্ড সংক্ষিপ্ত সূত্র ও উদাহরণ।'
        : 'এসএসসি বিজ্ঞান বিভাগের পরীক্ষার্থীদের রসায়ন পাঠ্যক্রম সহজ ভাষায় আয়ত্ত করার জন্য রচিত পূর্ণাঙ্গ সহায়িকা বই।'
    );
    setSelectedBranch(initialFormat === 'pdf' ? 'organic' : 'all');
    setNewPdfFile(null);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleBn.trim()) {
      setSavedNotice('বই বা নোটের বাংলা নাম আবশ্যক!');
      setTimeout(() => setSavedNotice(null), 3000);
      return;
    }

    if (Number(price) < 0) {
      setSavedNotice('মূল্য ০ বা তার বেশি হতে হবে!');
      setTimeout(() => setSavedNotice(null), 3000);
      return;
    }

    setIsSavingProduct(true);
    try {
      const { id: generatedId, sku: generatedSku } = generateProductId(format);

      let pdfStoragePath = '';
      let pdfFileName = '';
      let pdfSizeMb = 0;
      let downloadUrl = fileDownloadUrlOrKey.trim();

      // If PDF file is attached, upload via /api/admin/upload-pdf
      if ((format === 'pdf' || format === 'combo') && newPdfFile) {
        try {
          const formData = new FormData();
          formData.append('file', newPdfFile);
          formData.append('productId', generatedId);
          formData.append(
            'product',
            JSON.stringify({
              id: generatedId,
              sku: generatedSku,
              titleBn: titleBn.trim(),
              titleEn: titleEn.trim(),
              format,
              price: Number(price),
              originalPrice: Number(originalPrice) || 0,
              isPublished,
            })
          );

          const uploadRes = await fetch('/api/admin/upload-pdf', {
            method: 'POST',
            body: formData,
          });

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            downloadUrl = uploadData.fileUrl || `/uploads/pdfs/${generatedId}/${newPdfFile.name}`;
            pdfStoragePath = `private_pdfs/${generatedId}/${newPdfFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
            pdfFileName = newPdfFile.name;
            pdfSizeMb = uploadData.fileSizeMb || parseFloat((newPdfFile.size / (1024 * 1024)).toFixed(2));
          } else {
            console.warn('Initial PDF upload route returned non-OK, proceeding with product setup');
          }
        } catch (uploadErr) {
          console.warn('PDF upload error during product creation:', uploadErr);
        }
      }

      const newProduct: Product = {
        id: generatedId,
        sku: generatedSku,
        titleBn: titleBn.trim(),
        titleEn: titleEn.trim() || 'Dishari SSC Chemistry Book',
        subtitleBn: subtitleBn.trim() || 'এসএসসি রসায়ন অধ্যায়ভিত্তিক প্রস্তুতি',
        format,
        branches: selectedBranch === 'all' ? ['organic', 'inorganic', 'physical'] : [selectedBranch],
        price: Number(price),
        originalPrice: Number(originalPrice) > 0 ? Number(originalPrice) : undefined,
        isSamplePrice: true,
        availabilityStatus: format === 'pdf' ? 'digital_download' : 'in_stock',
        stockQuantity: format === 'pdf' ? undefined : Number(stockQuantity) || 50,
        inventoryTracking: format !== 'pdf',
        pages: format === 'pdf' ? 85 : 320,
        author: author.trim() || 'মোঃ আল মেহেদী',
        edition: edition.trim() || '২০২৫-২০২৬ পরিমার্জিত সংস্করণ',
        publisher: publisher.trim() || 'দিশারী কেমিস্ট্রি প্রকাশনা',
        bindingType: format === 'pdf' ? 'ডিজিটাল ই-বুক / পিডিএফ' : 'কাগজ বাঁধাই (Paperback)',
        fileFormat: format === 'pdf' ? 'PDF (প্রাইভেট ডিজিটাল সংস্করণ)' : undefined,
        coverImage: coverImage.trim() || (format === 'pdf' ? '/images/book_organic_chemistry_notes_1793290222839.jpg' : '/images/book_ssc_chemistry_guide_1793290222060.jpg'),
        description: description.trim() || 'এসএসসি বিজ্ঞান বিভাগের পরীক্ষার্থীদের জন্য রচিত রসায়ন সহায়িকা।',
        highlights: [
          'অধ্যায়ভিত্তিক মৌলিক ধারণার সহজ উপস্থাপন',
          'বোর্ড পরীক্ষার গুরুত্বপূর্ণ প্রশ্নের বিশ্লেষণ',
          'সহজ ফ্লোচার্ট ও রাসায়নিক বিক্রিয়ার ব্যাখ্যা',
        ],
        chapters: [
          { number: 1, title: 'অধ্যায় পরিচিতি ও মৌলিক ধারণা', topics: ['মৌলিক সূত্র', 'নমুনা প্রশ্ন'] }
        ],
        samplePages: [],
        hasSecurePdf: Boolean(pdfStoragePath || downloadUrl),
        pdfFileRef: pdfStoragePath || undefined,
        pdfFileName: pdfFileName || undefined,
        pdfFileSizeMb: pdfSizeMb || undefined,
        fileDownloadUrlOrKey: downloadUrl || undefined,
        samplePdfUrl: downloadUrl || undefined,
        pdfUploadedAt: pdfStoragePath ? new Date().toISOString() : undefined,
        isPublished,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to Firestore
      try {
        const firestorePayload = {
          id: newProduct.id,
          sku: newProduct.sku,
          titleBn: newProduct.titleBn,
          titleEn: newProduct.titleEn || '',
          subtitleBn: newProduct.subtitleBn || '',
          format: newProduct.format,
          price: newProduct.price,
          originalPrice: newProduct.originalPrice || 0,
          isPublished: newProduct.isPublished !== false,
          stockQuantity: newProduct.stockQuantity ?? 50,
          description: (newProduct.description || '').slice(0, 1900),
          coverImage: newProduct.coverImage,
          author: newProduct.author || '',
          edition: newProduct.edition || '',
          publisher: newProduct.publisher || '',
          fileDownloadUrlOrKey: newProduct.fileDownloadUrlOrKey || '',
          pdfFileRef: newProduct.pdfFileRef || '',
          pdfFileName: newProduct.pdfFileName || '',
          pdfFileSizeMb: newProduct.pdfFileSizeMb || 0,
          hasSecurePdf: newProduct.hasSecurePdf || false,
          pdfUploadedAt: newProduct.pdfUploadedAt || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await setDoc(doc(db, 'products', newProduct.id), firestorePayload);
      } catch (fsErr) {
        console.warn('Firestore product create notice:', fsErr);
      }

      // Cache locally in dishari_custom_products
      try {
        const rawCustom = localStorage.getItem('dishari_custom_products') || '{}';
        const customObj = JSON.parse(rawCustom);
        customObj[newProduct.id] = newProduct;
        localStorage.setItem('dishari_custom_products', JSON.stringify(customObj));
      } catch (cacheErr) {
        console.warn('LocalStorage cache update notice:', cacheErr);
      }

      // Broadcast price alert
      broadcastPriceAlert({
        productId: newProduct.id,
        title: newProduct.titleBn,
        oldPrice: newProduct.price,
        newPrice: newProduct.price,
        originalPrice: newProduct.originalPrice,
        type: 'price_change',
        customMessage: `🎉 নতুন ${newProduct.format === 'pdf' ? 'ডিজিটাল PDF' : 'বই'} যুক্ত হয়েছে: "${newProduct.titleBn}"!`,
      });

      // Update state
      onUpdateProduct(newProduct);
      setSelectedProduct(newProduct);
      setIsCreatingNewProduct(false);
      setIsEditingProduct(false);
      setNewPdfFile(null);

      setSavedNotice(`🎉 নতুন ${newProduct.format === 'pdf' ? 'ডিজিটাল PDF নোট' : 'মুদ্রিত বই'} "${newProduct.titleBn}" সফলভাবে ক্যাটালগে যুক্ত হয়েছে!`);
      setTimeout(() => setSavedNotice(null), 4000);
    } catch (err: any) {
      console.error('Error creating product:', err);
      setSavedNotice(`পণ্য তৈরিতে সমস্যা: ${err.message || 'দয়া করে পুনরায় চেষ্টা করুন'}`);
      setTimeout(() => setSavedNotice(null), 3500);
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${product.titleBn}" মুছে ফেলতে চান? এটি ওয়েবসাইট ও ডাটাবেজ থেকে মুছে যাবে।`)) {
      return;
    }

    try {
      try {
        await deleteDoc(doc(db, 'products', product.id));
      } catch (fsErr) {
        console.warn('Firestore delete notice:', fsErr);
      }

      try {
        const raw = localStorage.getItem('dishari_custom_products') || '{}';
        const customMap = JSON.parse(raw);
        delete customMap[product.id];
        localStorage.setItem('dishari_custom_products', JSON.stringify(customMap));
      } catch (e) {
        console.warn('LocalStorage delete notice:', e);
      }

      const remaining = products.filter((p) => p.id !== product.id);
      setSelectedProduct(remaining.length > 0 ? remaining[0] : null);
      setIsEditingProduct(false);
      setIsCreatingNewProduct(false);

      setSavedNotice(`"${product.titleBn}" সফলভাবে মুছে ফেলা হয়েছে।`);
      setTimeout(() => setSavedNotice(null), 3000);
    } catch (e: any) {
      console.error('Delete product error:', e);
      setSavedNotice(`পণ্য মুছতে সমস্যা হয়েছে: ${e.message}`);
      setTimeout(() => setSavedNotice(null), 3000);
    }
  };

  const handleStartEdit = () => {
    if (!selectedProduct) return;
    setIsCreatingNewProduct(false);
    setTitleBn(selectedProduct.titleBn);
    setTitleEn(selectedProduct.titleEn || '');
    setSubtitleBn(selectedProduct.subtitleBn || '');
    setPrice(selectedProduct.price);
    setOriginalPrice(selectedProduct.originalPrice || 0);
    setFormat(selectedProduct.format);
    setStockQuantity(selectedProduct.stockQuantity || 0);
    setIsPublished(selectedProduct.isPublished !== false);
    setAuthor(selectedProduct.author || '');
    setEdition(selectedProduct.edition || '');
    setPublisher(selectedProduct.publisher || '');
    setCoverImage(selectedProduct.coverImage || '');
    setFileDownloadUrlOrKey(selectedProduct.fileDownloadUrlOrKey || '');
    setDescription(selectedProduct.description);
    setIsEditingProduct(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const updated: Product = {
      ...selectedProduct,
      titleBn,
      titleEn,
      subtitleBn,
      price: Number(price),
      originalPrice: Number(originalPrice) || undefined,
      format,
      stockQuantity: format === 'pdf' ? undefined : Number(stockQuantity),
      isPublished,
      author,
      edition,
      publisher,
      coverImage,
      fileDownloadUrlOrKey: format === 'pdf' ? fileDownloadUrlOrKey : undefined,
      description,
    };

    const oldPrice = selectedProduct.price;
    const oldOriginalPrice = selectedProduct.originalPrice;
    const newPrice = Number(price);
    const newOriginalPrice = Number(originalPrice) || undefined;

    // Save to Firestore products collection if authorized
    try {
      await setDoc(doc(db, 'products', updated.id), {
        sku: updated.sku || `DC-SKU-${updated.id}`,
        titleBn: updated.titleBn,
        titleEn: updated.titleEn,
        subtitleBn: updated.subtitleBn || '',
        format: updated.format,
        price: updated.price,
        originalPrice: updated.originalPrice || 0,
        isSamplePrice: updated.isSamplePrice,
        availabilityStatus: updated.availabilityStatus || 'in_stock',
        stockQuantity: updated.stockQuantity || 0,
        author: updated.author || '',
        edition: updated.edition || '',
        publisher: updated.publisher || '',
        description: (updated.description || '').slice(0, 1900),
        coverImage: updated.coverImage,
        fileDownloadUrlOrKey: updated.fileDownloadUrlOrKey || '',
        pdfFileRef: updated.pdfFileRef || '',
        pdfFileName: updated.pdfFileName || '',
        pdfFileSizeMb: updated.pdfFileSizeMb || 0,
        hasSecurePdf: updated.hasSecurePdf || false,
        pdfUploadedAt: updated.pdfUploadedAt || '',
        isPublished: updated.isPublished !== false,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      // Cache locally for instant UI responsiveness
      try {
        const rawCustom = localStorage.getItem('dishari_custom_products') || '{}';
        const customObj = JSON.parse(rawCustom);
        customObj[updated.id] = updated;
        localStorage.setItem('dishari_custom_products', JSON.stringify(customObj));
      } catch (cacheErr) {
        console.warn('LocalStorage cache update notice:', cacheErr);
      }
    } catch (err) {
      console.warn('Firestore product sync note:', err);
    }

    // Broadcast toast notification if price or discount changed
    if (oldPrice !== newPrice || oldOriginalPrice !== newOriginalPrice) {
      const isDiscount = Boolean(newOriginalPrice && newOriginalPrice > newPrice);
      const isDrop = newPrice < oldPrice;
      const pct = (isDiscount && newOriginalPrice)
        ? Math.round(((newOriginalPrice - newPrice) / newOriginalPrice) * 100)
        : undefined;

      broadcastPriceAlert({
        productId: updated.id,
        title: updated.titleBn,
        oldPrice,
        newPrice,
        originalPrice: newOriginalPrice,
        discountPercent: pct,
        type: isDiscount ? 'new_discount' : isDrop ? 'price_drop' : 'price_change',
        customMessage: isDiscount
          ? `🎉 নতুন ডিসকাউন্ট যুক্ত হয়েছে! ৳${newOriginalPrice} এর বই এখন মাত্র ৳${newPrice} (${pct}% ছাড়)!`
          : isDrop
          ? `📉 দাম কমেছে! "${updated.titleBn}" এর মূল্য এখন মাত্র ৳${newPrice}!`
          : `📢 মূল্য আপডেট: "${updated.titleBn}" এর নতুন মূল্য ৳${newPrice} নির্ধারণ করা হয়েছে।`,
      });
    }

    onUpdateProduct(updated);
    setSelectedProduct(updated);
    setIsEditingProduct(false);
    setSavedNotice(`"${updated.titleBn}" সফলভাবে সংরক্ষিত ও আপডেট হয়েছে!`);
    setTimeout(() => setSavedNotice(null), 3000);
  };

  // Handlers for Orders
  const handleUpdatePaymentStatus = async (
    orderId: string,
    newPaymentStatus: 'verified' | 'failed' | 'pending_verification'
  ) => {
    setStatusUpdating(true);
    try {
      const isVerifying = newPaymentStatus === 'verified';
      const updates: any = {
        paymentStatus: newPaymentStatus,
        downloadPermission: isVerifying,
        updatedAt: new Date().toISOString(),
      };

      if (isVerifying) {
        updates.verifiedAt = new Date().toISOString();
        updates.verifiedBy = currentUser?.email || 'admin';
        if (selectedOrder?.orderType === 'pdf') {
          updates.orderStatus = 'delivered';
        }
      } else if (newPaymentStatus === 'failed') {
        updates.downloadPermission = false;
      }

      await updateDoc(doc(db, 'orders', orderId), updates);

      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, ...updates } : o))
      );
      if (selectedOrder?.orderId === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, ...updates } : null));
      }
      setSavedNotice(
        `অর্ডার ${orderId} এর পেমেন্ট ${
          isVerifying
            ? 'সফলভাবে যাচাই হয়েছে এবং ডিজিটাল PDF ডাউনলোড অনুমতি সক্রিয় হয়েছে!'
            : newPaymentStatus === 'failed'
            ? 'বাতিল করা হয়েছে এবং ডাউনলোড অনুমতি বন্ধ করা হয়েছে।'
            : 'অপেক্ষমাণ হিসেবে চিহ্নিত হয়েছে।'
        }`
      );
      setTimeout(() => setSavedNotice(null), 3500);
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      setSavedNotice('পেমেন্ট স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে। শুধুমাত্র অনুমোদিত অ্যাডমিন এই পরিবর্তন করতে পারেন।');
      setTimeout(() => setSavedNotice(null), 3000);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleToggleDownloadPermission = async (orderId: string, currentPermission: boolean) => {
    setStatusUpdating(true);
    try {
      const newPermission = !currentPermission;
      await updateDoc(doc(db, 'orders', orderId), {
        downloadPermission: newPermission,
        updatedAt: new Date().toISOString(),
      });

      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, downloadPermission: newPermission } : o))
      );
      if (selectedOrder?.orderId === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, downloadPermission: newPermission } : null));
      }
      setSavedNotice(
        `অর্ডার ${orderId} এর ডাউনলোড অনুমতি ${newPermission ? 'সক্রিয় (Granted)' : 'স্থগিত (Revoked)'} করা হয়েছে।`
      );
      setTimeout(() => setSavedNotice(null), 3000);
    } catch (err: any) {
      console.error('Toggle permission error:', err);
      setSavedNotice('ডাউনলোড অনুমতি পরিবর্তন করতে ব্যর্থ হয়েছে।');
      setTimeout(() => setSavedNotice(null), 3000);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleIncreaseDownloadLimit = async (orderId: string, currentLimit: number = 5) => {
    setStatusUpdating(true);
    try {
      const newLimit = currentLimit + 5;
      await updateDoc(doc(db, 'orders', orderId), {
        downloadLimit: newLimit,
        updatedAt: new Date().toISOString(),
      });

      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, downloadLimit: newLimit } : o))
      );
      if (selectedOrder?.orderId === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, downloadLimit: newLimit } : null));
      }
      setSavedNotice(`অর্ডার ${orderId} এর ডাউনলোড সীমা বৃদ্ধি করে ${newLimit} বার করা হয়েছে।`);
      setTimeout(() => setSavedNotice(null), 3000);
    } catch (err: any) {
      console.error('Increase limit error:', err);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    newOrderStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled'
  ) => {
    setStatusUpdating(true);
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        orderStatus: newOrderStatus,
        updatedAt: new Date().toISOString(),
      });

      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, orderStatus: newOrderStatus } : o))
      );
      if (selectedOrder?.orderId === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, orderStatus: newOrderStatus } : null));
      }
      setSavedNotice(`অর্ডার ${orderId} এর ডেলিভারি স্ট্যাটাস: "${newOrderStatus}" হিসেবে আপডেট হয়েছে।`);
      setTimeout(() => setSavedNotice(null), 3000);
    } catch (error) {
      console.error('Error updating order status:', error);
      setSavedNotice('অর্ডার স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।');
      setTimeout(() => setSavedNotice(null), 3000);
    } finally {
      setStatusUpdating(false);
    }
  };

  // Handler for Admin PDF file upload using server route + complete schema sync
  const handlePdfFileUpload = async (product: Product, file: File) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setSavedNotice('ভুল ফাইল ফরম্যাট! অনুগ্রহ করে শুধুমাত্র .pdf ফাইল নির্বাচন করুন।');
      setTimeout(() => setSavedNotice(null), 3000);
      return;
    }

    setUploadingProductId(product.id);
    try {
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `private_pdfs/${product.id}/${cleanFileName}`;
      const sizeMb = Math.round((file.size / (1024 * 1024)) * 100) / 100;

      // 1. Upload via /api/admin/upload-pdf server endpoint
      const formData = new FormData();
      formData.append('file', file);
      formData.append('productId', product.id);
      formData.append('product', JSON.stringify(product));

      const res = await fetch('/api/admin/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `সার্ভার ত্রুটি: ${res.status}`);
      }

      const resData = await res.json();
      const updatedProduct: Product = {
        ...product,
        ...(resData.product || {}),
        pdfFileRef: storagePath,
        pdfFileName: file.name,
        pdfFileSizeMb: sizeMb,
        hasSecurePdf: true,
        fileDownloadUrlOrKey: resData.fileUrl || `/uploads/pdfs/${product.id}/${cleanFileName}`,
        samplePdfUrl: resData.fileUrl || `/uploads/pdfs/${product.id}/${cleanFileName}`,
        pdfUploadedAt: new Date().toISOString(),
        fileFormat: 'PDF (প্রাইভেট ডিজিটাল সংস্করণ)',
        updatedAt: new Date().toISOString(),
      };

      // 2. Client-side Firebase Storage backup (non-blocking)
      try {
        const fileRef = ref(storage, storagePath);
        await uploadBytes(fileRef, file, {
          contentType: 'application/pdf',
          customMetadata: {
            productId: product.id,
            sku: product.sku || '',
            uploadedBy: currentUser?.email || 'admin',
            uploadedAt: new Date().toISOString(),
          },
        });
      } catch (storageErr) {
        console.warn('Firebase Storage direct upload notice (non-fatal):', storageErr);
      }

      // 3. Persist complete Product document in Firestore satisfying isValidProduct
      try {
        const fullFirestoreDoc = {
          id: updatedProduct.id,
          sku: updatedProduct.sku || `DC-SKU-${updatedProduct.id}`,
          titleBn: updatedProduct.titleBn,
          titleEn: updatedProduct.titleEn || '',
          format: updatedProduct.format,
          price: updatedProduct.price,
          originalPrice: updatedProduct.originalPrice || 0,
          isPublished: updatedProduct.isPublished !== false,
          stockQuantity: updatedProduct.stockQuantity ?? 50,
          description: (updatedProduct.description || '').slice(0, 1900),
          coverImage: updatedProduct.coverImage || '',
          author: updatedProduct.author || '',
          edition: updatedProduct.edition || '',
          publisher: updatedProduct.publisher || '',
          fileDownloadUrlOrKey: updatedProduct.fileDownloadUrlOrKey || '',
          pdfFileRef: updatedProduct.pdfFileRef || '',
          pdfFileName: updatedProduct.pdfFileName || '',
          pdfFileSizeMb: updatedProduct.pdfFileSizeMb || sizeMb,
          hasSecurePdf: true,
          pdfUploadedAt: updatedProduct.pdfUploadedAt,
          updatedAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'products', product.id), fullFirestoreDoc, { merge: true });
      } catch (fsErr) {
        console.warn('Client Firestore write notice:', fsErr);
      }

      // 4. Update localStorage cache
      try {
        const rawCustom = localStorage.getItem('dishari_custom_products') || '{}';
        const customObj = JSON.parse(rawCustom);
        customObj[updatedProduct.id] = updatedProduct;
        localStorage.setItem('dishari_custom_products', JSON.stringify(customObj));
      } catch (cacheErr) {
        console.warn('LocalStorage cache update notice:', cacheErr);
      }

      onUpdateProduct(updatedProduct);
      if (selectedProduct?.id === product.id) {
        setSelectedProduct(updatedProduct);
      }

      setSavedNotice(`"${product.titleBn}" এর জন্য PDF ফাইল সফলভাবে ভল্টে সংরক্ষিত ও সংযুক্ত হয়েছে! (${file.name}, ${sizeMb} MB)`);
      setTimeout(() => setSavedNotice(null), 4000);
    } catch (err: any) {
      console.error('PDF upload & linking error:', err);
      setSavedNotice(`পিডিএফ আপলোডে সমস্যা: ${err.message || 'দয়া করে পুনরায় চেষ্টা করুন।'}`);
      setTimeout(() => setSavedNotice(null), 3000);
    } finally {
      setUploadingProductId(null);
    }
  };

  // Admin test download function
  const handleAdminTestDownload = async (product: Product) => {
    setTestingDownloadId(product.id);
    try {
      // Create a test order or stream licensed PDF directly
      const url = new URL('/api/pdf/download', window.location.origin);
      url.searchParams.set('orderId', orders.length > 0 ? orders[0].orderId : 'DC-ADMIN-TEST');
      url.searchParams.set('productId', product.id);
      url.searchParams.set('customerEmail', 'disharichem@gmail.com');

      const res = await fetch(url.toString());
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'টেস্ট ডাউনলোড ব্যর্থ হয়েছে।');
      }

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `Dishari_Test_${product.sku || 'PDF'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);

      setSavedNotice(`"${product.titleBn}" এর টেস্ট ডাউনলোড সফলভাবে সম্পন্ন হয়েছে!`);
      setTimeout(() => setSavedNotice(null), 3000);
    } catch (e: any) {
      console.error('Test download error:', e);
      setSavedNotice(`টেস্ট ডাউনলোডে ত্রুটি: ${e.message}`);
      setTimeout(() => setSavedNotice(null), 3500);
    } finally {
      setTestingDownloadId(null);
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (paymentFilter === 'all') return true;
    return o.paymentStatus === paymentFilter;
  });

  // Filtered PDF Orders for Payment Verification Tab
  const pdfOrders = orders.filter(
    (o) =>
      o.orderType === 'pdf' ||
      o.orderType === 'mixed' ||
      Boolean(o.transactionId) ||
      o.items?.some((i) => i.format === 'pdf' || i.format === 'combo')
  );
  const pendingPdfOrders = pdfOrders.filter(
    (o) => o.paymentStatus !== 'verified' && o.paymentStatus !== 'failed'
  );

  const filteredPaymentOrders = pdfOrders.filter((o) => {
    // 1. Status Filter
    if (paymentTabFilter === 'pending' && o.paymentStatus === 'verified') return false;
    if (paymentTabFilter === 'verified' && o.paymentStatus !== 'verified') return false;

    // 2. Search Filter
    if (paymentSearchQuery.trim()) {
      const q = paymentSearchQuery.trim().toLowerCase();
      const matchOrderId = o.orderId.toLowerCase().includes(q);
      const matchName = o.customerName?.toLowerCase().includes(q);
      const matchPhone = o.customerPhone?.includes(q) || o.senderPhone?.includes(q);
      const matchEmail = o.customerEmail?.toLowerCase().includes(q);
      const matchTxn = o.transactionId?.toLowerCase().includes(q);
      return matchOrderId || matchName || matchPhone || matchEmail || matchTxn;
    }
    return true;
  });

  // Dedicated Payment Verification Action: updates Firestore & grants customer download access
  const handleVerifyPaymentAndGrantAccess = async (order: FirestoreOrderRecord) => {
    setStatusUpdating(true);
    try {
      const updates: Partial<FirestoreOrderRecord> = {
        paymentStatus: 'verified',
        downloadPermission: true,
        orderStatus: order.orderType === 'pdf' ? 'delivered' : order.orderStatus,
        verifiedAt: new Date().toISOString(),
        verifiedBy: currentUser?.email || 'disharichem@gmail.com',
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(doc(db, 'orders', order.orderId), updates);

      setOrders((prev) =>
        prev.map((o) => (o.orderId === order.orderId ? { ...o, ...updates } : o))
      );
      if (selectedOrder?.orderId === order.orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, ...updates } : null));
      }

      setSavedNotice(
        `অর্ডার #${order.orderId} এর পেমেন্ট সফলভাবে যাচাই হয়েছে এবং গ্রাহকের জন্য PDF ডাউনলোড অনুমতি উন্মুক্ত করা হয়েছে!`
      );
      setTimeout(() => setSavedNotice(null), 4000);
    } catch (err: any) {
      console.error('Verify payment error:', err);
      setSavedNotice(`পেমেন্ট ভেরিফিকেশন ব্যর্থ হয়েছে: ${err.message || 'দয়া করে পুনরায় চেষ্টা করুন।'}`);
      setTimeout(() => setSavedNotice(null), 3500);
    } finally {
      setStatusUpdating(false);
    }
  };

  // Helper to create a sample pending PDF order for instant verification testing
  const handleCreateDemoPendingOrder = async () => {
    setStatusUpdating(true);
    try {
      const { demoId, demoTxn } = generateDemoOrderIdentifiers();
      const digitalProd =
        products.find((p) => p.format === 'pdf' || p.format === 'combo') || products[0];

      const newOrderData: FirestoreOrderRecord = {
        orderId: demoId,
        customerId: currentUser?.uid || 'demo-student-uid',
        customerName: 'সাকিব আল হাসান (টেস্ট শিক্ষার্থী)',
        customerPhone: '01712345678',
        customerEmail: currentUser?.email || 'student.dishari@gmail.com',
        orderType: 'pdf',
        items: [
          {
            productId: digitalProd.id,
            titleBn: digitalProd.titleBn,
            format: 'pdf',
            unitPrice: digitalProd.price,
            quantity: 1,
            totalPrice: digitalProd.price,
            sku: digitalProd.sku || 'DC-PDF-01',
            pdfFileRef: digitalProd.pdfFileRef || `private_pdfs/${digitalProd.id}/notes.pdf`,
            pdfFileName: digitalProd.pdfFileName || `${digitalProd.sku || 'notes'}.pdf`,
          },
        ],
        subtotal: digitalProd.price,
        deliveryFee: 0,
        total: digitalProd.price,
        paymentMethod: 'bkash',
        paymentStatus: 'pending_verification',
        orderStatus: 'received',
        downloadPermission: false,
        downloadCount: 0,
        downloadLimit: 5,
        downloadHistory: [],
        transactionId: demoTxn,
        senderPhone: '01712345678',
        isDemoSimulation: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'orders', demoId), newOrderData);

      setOrders((prev) => [newOrderData, ...prev]);
      setSavedNotice(`নতুন পেন্ডিং PDF অর্ডার #${demoId} তৈরি হয়েছে! এটি নিচে তালিকাভুক্ত হয়েছে।`);
      setTimeout(() => setSavedNotice(null), 4000);
    } catch (err: any) {
      console.error('Create demo order error:', err);
      setSavedNotice(`ডেমো অর্ডার তৈরিতে ত্রুটি: ${err.message}`);
      setTimeout(() => setSavedNotice(null), 3000);
    } finally {
      setStatusUpdating(false);
    }
  };

  const panelContent = (
    <div
      className={
        standalone
          ? 'w-full max-w-7xl mx-auto my-0 sm:my-3 bg-white sm:rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col flex-1'
          : 'relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]'
      }
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-900 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-600/30 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold">
                দিশারী কেমিস্ট্রি অ্যাডমিন ড্যাশবোর্ড
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-900/80 text-cyan-300 border border-cyan-700/50 font-mono">
                {standalone ? 'স্বতন্ত্র পেইজ' : 'Cloud Firestore'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              পারসিস্টেন্ট অর্ডার ব্যবস্থাপনা ও রিয়েল-টাইম ক্যাটালগ কন্ট্রোল
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {standalone ? (
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-700 hover:bg-cyan-800 text-white transition-colors cursor-pointer shadow-xs"
              title="মূল ওয়েবসাইটে ফিরে যান"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>মূল ওয়েবসাইট</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              aria-label="বন্ধ করুন"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <a
            href={FIREBASE_CONSOLE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Firebase Console এ সরাসরি ডাটাবেজ দেখুন"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            <span>Firebase Console</span>
          </a>
        </div>
      </div>

        {/* Saved Alert Banner */}
        {savedNotice && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2 flex items-center justify-center gap-2 animate-in fade-in duration-150">
            <Check className="w-4 h-4" />
            <span>{savedNotice}</span>
          </div>
        )}

        {/* If password locked, show password unlock gate */}
        {!isPasswordUnlocked ? (
          <div className="flex-1 p-6 sm:p-12 flex flex-col items-center justify-center bg-slate-50 min-h-[460px]">
            <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-gradient-to-tr from-cyan-600 to-cyan-800 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  অ্যাডমিন ও প্রোডাক্ট ডাটা প্যানেল
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  পণ্য ডাটাবেজ, ইনভেন্টরি, অর্ডার ও PDF ভল্ট অ্যাক্সেস করতে অফিশিয়াল অ্যাডমিন পাসওয়ার্ড প্রদান করুন।
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    অ্যাডমিন পাসওয়ার্ড (Admin Password)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoFocus
                      required
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        setPasswordError(null);
                      }}
                      placeholder="পাসওয়ার্ড লিখুন..."
                      className={`w-full pl-3.5 pr-10 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-hidden transition-all ${
                        passwordError
                          ? 'border-rose-400 focus:border-rose-500 ring-2 ring-rose-100 bg-rose-50/20'
                          : 'border-slate-300 focus:border-cyan-600 focus:bg-white ring-2 ring-cyan-100/50'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      title={showPassword ? 'লুকান' : 'দেখুন'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordError && (
                    <div className="flex items-center gap-1.5 text-xs text-rose-600 pt-1 animate-in fade-in">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-cyan-700 hover:bg-cyan-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>প্যানেলে প্রবেশ করুন (Unlock Panel)</span>
                </button>
              </form>

              <div className="pt-2 border-t border-slate-100 text-center space-y-2">
                <p className="text-[11px] text-slate-400">
                  সঠিক পাসওয়ার্ড প্রদানের সাথে সাথে সম্পূর্ণ প্যানেল সক্রিয় হবে।
                </p>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>অফিশিয়াল এনক্রিপ্টেড প্যানেল ভেরিফিকেশন</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Auth & Tab Bar */}
            <div className="bg-slate-100 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Navigation Tabs */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'orders'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
                  <span>অর্ডার ব্যবস্থাপনা</span>
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-600 text-white font-mono">
                    {orders.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('products')}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'products'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  <span>পণ্য ও ক্যাটালগ</span>
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-700 text-white font-mono">
                    {products.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('pdf_vault')}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'pdf_vault'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <FolderLock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>PDF ভল্ট ও আপলোড</span>
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-700 text-white font-mono">
                    {products.filter((p) => p.format === 'pdf' || p.format === 'combo').length}
                  </span>
                </button>

                <button
                  data-tab="payment_verification"
                  onClick={() => setActiveTab('payment_verification')}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'payment_verification'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                  <span>Payment Verification (পেমেন্ট ভেরিফিকেশন)</span>
                  {pendingPdfOrders.length > 0 ? (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-red-600 text-white font-mono font-bold animate-pulse">
                      {pendingPdfOrders.length}
                    </span>
                  ) : (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-700 text-white font-mono">
                      ✓
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('products');
                    handleStartCreateNewProduct('printed');
                  }}
                  className="px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 bg-cyan-700 hover:bg-cyan-800 text-white shadow-xs transition-colors cursor-pointer text-xs"
                  title="নতুন বই বা ডিজিটাল PDF ক্যাটালগে যুক্ত করুন"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ নতুন বই / PDF যোগ করুন</span>
                </button>
              </div>

              {/* Admin Auth Status Box */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-[11px] font-medium text-slate-700">
                    {currentUser?.email || 'অ্যাডমিন সেশন'}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800">
                    পাসওয়ার্ড আনলকড
                  </span>
                  <button
                    type="button"
                    onClick={handleLockPanel}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded transition-colors cursor-pointer ml-1"
                    title="লক করুন / সেশন সমাপ্ত"
                  >
                    <Lock className="w-3 h-3" />
                    <span>লক করুন</span>
                  </button>
                </div>
              </div>
            </div>

        {/* Tab 1: Orders Management View */}
        {activeTab === 'orders' && (
          <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {/* Left Orders List */}
            <div className="md:col-span-5 p-4 sm:p-5 space-y-3 overflow-y-auto max-h-[75vh]">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    ফায়ারস্টোর অর্ডার তালিকা
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                    {filteredOrders.length}
                  </span>
                </div>

                {/* Filter Selector */}
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="text-[11px] px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-hidden"
                >
                  <option value="all">সকল পেমেন্ট স্ট্যাটাস</option>
                  <option value="pending_verification">অপেক্ষমাণ (Pending)</option>
                  <option value="verified">যাচাইকৃত (Verified)</option>
                  <option value="failed">ব্যর্থ / বাতিল (Failed)</option>
                </select>
              </div>

              {ordersLoading ? (
                <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-cyan-600 animate-spin" />
                  <span>ক্লাউড ফায়ারস্টোর থেকে অর্ডার লোড হচ্ছে...</span>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                  <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-medium text-slate-700">কোনো অর্ডার পাওয়া যায়নি</p>
                  <p className="text-[11px] text-slate-400">
                    ওয়েবসাইট থেকে বই বা পিডিএফ অর্ডার করলে তা স্বয়ংক্রিয়ভাবে এখানে পারসিস্টেন্ট হবে।
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredOrders.map((ord) => {
                    const isSelected = selectedOrder?.orderId === ord.orderId;
                    return (
                      <button
                        key={ord.orderId}
                        type="button"
                        onClick={() => setSelectedOrder(ord)}
                        className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                          isSelected
                            ? 'border-cyan-600 bg-cyan-50/50 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-bold text-slate-900">
                            {ord.orderId}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              ord.paymentStatus === 'verified'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.paymentStatus === 'failed'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.paymentStatus === 'verified'
                              ? 'পেমেন্ট ভেরিফায়েড'
                              : ord.paymentStatus === 'failed'
                              ? 'পেমেন্ট ব্যর্থ'
                              : 'পেমেন্ট অপেক্ষমাণ'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">{ord.customerName}</span>
                          <span className="font-mono text-cyan-800 font-bold">৳{ord.total}</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                          <span>
                            {ord.orderType === 'pdf'
                              ? 'ডিজিটাল PDF'
                              : ord.orderType === 'mixed'
                              ? 'মুদ্রিত + PDF'
                              : 'মুদ্রিত বই'}
                          </span>
                          <span className="font-mono text-[10px]">
                            {new Date(ord.createdAt).toLocaleDateString('bn-BD', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Order Details & Action Controls */}
            <div className="md:col-span-7 p-5 sm:p-6 overflow-y-auto max-h-[75vh]">
              {selectedOrder ? (
                <div className="space-y-5 text-xs">
                  {/* Order Top Summary */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                    <div>
                      <span className="text-xs font-mono font-bold text-cyan-800 block">
                        {selectedOrder.orderId}
                      </span>
                      <h4 className="text-base font-bold text-slate-900">
                        {selectedOrder.customerName}
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        তারিখ: {new Date(selectedOrder.createdAt).toLocaleString('bn-BD')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          selectedOrder.orderStatus === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : selectedOrder.orderStatus === 'shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : selectedOrder.orderStatus === 'processing'
                            ? 'bg-cyan-100 text-cyan-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        স্ট্যাটাস: {selectedOrder.orderStatus}
                      </span>
                    </div>
                  </div>

                  {/* Customer Information Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-slate-400 block text-[11px] font-medium">যোগাযোগের তথ্য</span>
                      <p className="font-bold text-slate-900">{selectedOrder.customerName}</p>
                      <p className="font-mono text-slate-700">ফোন: {selectedOrder.customerPhone}</p>
                      {selectedOrder.customerEmail && (
                        <p className="font-mono text-cyan-800">ইমেইল: {selectedOrder.customerEmail}</p>
                      )}
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-slate-400 block text-[11px] font-medium">ডেলিভারি ঠিকানা</span>
                      {selectedOrder.orderType === 'pdf' ? (
                        <p className="text-cyan-800 font-medium">ডিজিটাল ডেলিভারি (ইমেইল / গুগল ড্রাইভ)</p>
                      ) : (
                        <>
                          <p className="font-medium text-slate-800">জেলা: {selectedOrder.district || 'ঢাকা'}</p>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            {selectedOrder.deliveryAddress || 'ঠিকানা দেওয়া নেই'}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Manual Payment Verification Box */}
                  <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span className="font-bold text-xs text-white">
                          ম্যানুয়াল পেমেন্ট ভেরিফিকেশন (Manual Verification)
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        পেমেন্ট পদ্ধতি: {selectedOrder.paymentMethod.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">ট্রানজেকশন আইডি (TxnID)</span>
                        <span className="font-mono text-cyan-300 font-bold text-sm">
                          {selectedOrder.transactionId || 'প্রযোজ্য নয় (COD)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">প্রেরক মোবাইল নম্বর</span>
                        <span className="font-mono text-white text-sm">
                          {selectedOrder.senderPhone || selectedOrder.customerPhone}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      💡 আপনার বিকাশ বা নগদ মার্চেন্ট/ব্যক্তিগত স্টেটমেন্ট চেক করে ট্রানজেকশন আইডি মিলিয়ে নিচের বোতামের মাধ্যমে স্ট্যাটাস পরিবর্তন করুন:
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        disabled={statusUpdating}
                        onClick={() => handleUpdatePaymentStatus(selectedOrder.orderId, 'verified')}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>পেমেন্ট নিশ্চিত করুন (Verified)</span>
                      </button>

                      <button
                        type="button"
                        disabled={statusUpdating}
                        onClick={() => handleUpdatePaymentStatus(selectedOrder.orderId, 'failed')}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-700 hover:bg-rose-600 text-white flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>পেমেন্ট বাতিল (Failed)</span>
                      </button>

                      <button
                        type="button"
                        disabled={statusUpdating}
                        onClick={() => handleUpdatePaymentStatus(selectedOrder.orderId, 'pending_verification')}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <span>পুনরায় অপেক্ষমাণ (Pending)</span>
                      </button>
                    </div>
                  </div>

                  {/* Digital License & Download Permission Controls (Requirements 4, 5, 8, 10) */}
                  {(selectedOrder.orderType === 'pdf' ||
                    selectedOrder.orderType === 'mixed' ||
                    selectedOrder.items.some((i) => i.format === 'pdf' || i.format === 'combo')) && (
                    <div className="p-4 rounded-xl bg-cyan-950 text-white space-y-3 border border-cyan-800">
                      <div className="flex items-center justify-between border-b border-cyan-800/80 pb-2">
                        <div className="flex items-center gap-2">
                          <FolderLock className="w-4 h-4 text-cyan-400" />
                          <span className="font-bold text-xs text-white">
                            ডিজিটাল PDF লাইসেন্স ও ডাউনলোড নিয়ন্ত্রণ
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            selectedOrder.downloadPermission
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {selectedOrder.downloadPermission
                            ? 'অনুমতি: সক্রিয় (Granted)'
                            : 'অনুমতি: নিষ্ক্রিয় (Locked)'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                        <div className="bg-cyan-900/40 p-2.5 rounded-lg border border-cyan-800/50">
                          <span className="text-cyan-300 block text-[10px]">গ্রাহক আইডি (UID)</span>
                          <span className="font-mono text-white text-[10px] block truncate">
                            {selectedOrder.customerId || selectedOrder.customerEmail || 'গেস্ট ক্রেতা'}
                          </span>
                        </div>

                        <div className="bg-cyan-900/40 p-2.5 rounded-lg border border-cyan-800/50">
                          <span className="text-cyan-300 block text-[10px]">ডাউনলোড পরিসংখ্যান</span>
                          <span className="font-bold text-white text-xs block">
                            {selectedOrder.downloadCount || 0} / {selectedOrder.downloadLimit || 5} বার ব্যবহৃত
                          </span>
                        </div>

                        <div className="bg-cyan-900/40 p-2.5 rounded-lg border border-cyan-800/50">
                          <span className="text-cyan-300 block text-[10px]">যাচাইয়ের তথ্য</span>
                          <span className="text-white text-[10px] block truncate">
                            {selectedOrder.verifiedAt
                              ? `ভেরিফায়েড (${selectedOrder.verifiedBy || 'Admin'})`
                              : 'অপেক্ষমাণ'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          disabled={statusUpdating}
                          onClick={() =>
                            handleToggleDownloadPermission(
                              selectedOrder.orderId,
                              selectedOrder.downloadPermission || false
                            )
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            selectedOrder.downloadPermission
                              ? 'bg-amber-600 hover:bg-amber-700 text-white'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {selectedOrder.downloadPermission ? (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span>ডাউনলোড স্থগিত করুন (Revoke)</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3.5 h-3.5" />
                              <span>ডাউনলোড অনুমতি প্রদান করুন (Grant)</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          disabled={statusUpdating}
                          onClick={() =>
                            handleIncreaseDownloadLimit(
                              selectedOrder.orderId,
                              selectedOrder.downloadLimit || 5
                            )
                          }
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-800 hover:bg-cyan-700 text-cyan-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+৫ বার ডাউনলোড সীমা বাড়ান</span>
                        </button>
                      </div>

                      {/* Download History Log */}
                      {selectedOrder.downloadHistory && selectedOrder.downloadHistory.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-cyan-800/60 text-[11px] space-y-1">
                          <span className="text-cyan-300 font-semibold block text-[10px]">
                            ডাউনলোড হিস্টোরি লগ ({selectedOrder.downloadHistory.length} বার):
                          </span>
                          <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                            {selectedOrder.downloadHistory.map((h, i) => (
                              <div
                                key={i}
                                className="flex justify-between text-slate-300 text-[10px] font-mono bg-cyan-900/30 px-2 py-0.5 rounded"
                              >
                                <span>{new Date(h.downloadedAt).toLocaleString('bn-BD')}</span>
                                <span>IP: {h.ip || 'রেকর্ডকৃত'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Order Items Table */}
                  <div className="space-y-2">
                    <span className="font-bold text-slate-800 block text-xs">
                      অর্ডারকৃত বই ও আইটেমসমূহ
                    </span>
                    <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                      {selectedOrder.items.map((it, idx) => (
                        <div key={idx} className="p-3 flex items-center justify-between text-xs bg-slate-50/50">
                          <div>
                            <span className="font-bold text-slate-900 block">{it.titleBn}</span>
                            <span className="text-[10px] text-slate-500">
                              {it.format === 'pdf' ? 'ডিজিটাল PDF' : 'মুদ্রিত সংস্করণ'} × {it.quantity} কপি
                            </span>
                          </div>
                          <span className="font-bold font-mono text-slate-800">
                            ৳{it.totalPrice || it.unitPrice * it.quantity}
                          </span>
                        </div>
                      ))}

                      {/* Pricing Breakdown */}
                      <div className="p-3 bg-white space-y-1 text-xs">
                        <div className="flex justify-between text-slate-600">
                          <span>সাবটোটাল:</span>
                          <span className="font-mono">৳{selectedOrder.subtotal}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>ডেলিভারি চার্জ:</span>
                          <span className="font-mono">৳{selectedOrder.deliveryFee}</span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100 text-sm">
                          <span>সর্বমোট মূল্য:</span>
                          <span className="font-mono text-cyan-800">৳{selectedOrder.total}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Progress Control */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-800 block text-xs">
                      ডেলিভারি স্ট্যাটাস পরিবর্তন করুন:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateOrderStatus(selectedOrder.orderId, 'processing')}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 cursor-pointer"
                      >
                        প্রক্রিয়াধীন (Processing)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateOrderStatus(selectedOrder.orderId, 'shipped')}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-700 hover:bg-cyan-800 text-white cursor-pointer"
                      >
                        কুরিয়ারে পাঠানো হয়েছে (Shipped)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateOrderStatus(selectedOrder.orderId, 'delivered')}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                      >
                        ডেলিভারি সম্পন্ন (Delivered)
                      </button>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="py-20 text-center text-xs text-slate-400">
                  বাম পাশের তালিকা থেকে একটি অর্ডার নির্বাচন করুন।
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Products Catalog Management View */}
        {activeTab === 'products' && (() => {
          const filteredCatalogProducts = products.filter((p) => {
            if (productFilterFormat !== 'all' && p.format !== productFilterFormat) {
              return false;
            }
            if (productSearchQuery.trim()) {
              const q = productSearchQuery.toLowerCase().trim();
              const matchTitle = (p.titleBn || '').toLowerCase().includes(q) || (p.titleEn || '').toLowerCase().includes(q);
              const matchSku = (p.sku || '').toLowerCase().includes(q);
              const matchAuthor = (p.author || '').toLowerCase().includes(q);
              return matchTitle || matchSku || matchAuthor;
            }
            return true;
          });

          const printedCount = products.filter((p) => p.format === 'printed').length;
          const pdfCount = products.filter((p) => p.format === 'pdf').length;
          const comboCount = products.filter((p) => p.format === 'combo').length;

          return (
            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              {/* Left Column: Product Directory, Search, Filters & Quick Add */}
              <div className="md:col-span-5 p-4 sm:p-5 space-y-3 overflow-y-auto max-h-[78vh]">
                {/* Header & Primary Add Button */}
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-slate-800 tracking-wider">
                      সকল বই ও পিডিএফ ({products.length})
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      তালিকা থেকে নির্বাচন বা নতুন পণ্য যুক্ত করুন
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStartCreateNewProduct('printed')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-cyan-700 hover:bg-cyan-800 transition-colors shadow-xs cursor-pointer shrink-0"
                    title="নতুন বই বা ডিজিটাল PDF ক্যাটালগে যুক্ত করুন"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ নতুন যুক্ত করুন</span>
                  </button>
                </div>

                {/* Quick Add By Format Row */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleStartCreateNewProduct('printed')}
                    className="py-1.5 px-2 text-[11px] font-semibold rounded-lg bg-white hover:bg-cyan-50 text-slate-700 hover:text-cyan-800 border border-slate-200/60 shadow-2xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>📘</span>
                    <span>+ মুদ্রিত বই</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartCreateNewProduct('pdf')}
                    className="py-1.5 px-2 text-[11px] font-semibold rounded-lg bg-white hover:bg-cyan-50 text-slate-700 hover:text-cyan-800 border border-slate-200/60 shadow-2xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>📄</span>
                    <span>+ ডিজিটাল PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartCreateNewProduct('combo')}
                    className="py-1.5 px-2 text-[11px] font-semibold rounded-lg bg-white hover:bg-cyan-50 text-slate-700 hover:text-cyan-800 border border-slate-200/60 shadow-2xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>📦</span>
                    <span>+ কম্বো প্যাক</span>
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    placeholder="বইয়ের নাম, SKU বা লেখক দিয়ে খুঁজুন..."
                    className="w-full pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:border-cyan-500"
                  />
                  {productSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setProductSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Format Filter Badges */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setProductFilterFormat('all')}
                    className={`px-2.5 py-1 rounded-full font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                      productFilterFormat === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    সব ({products.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductFilterFormat('printed')}
                    className={`px-2.5 py-1 rounded-full font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                      productFilterFormat === 'printed'
                        ? 'bg-cyan-700 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    মুদ্রিত ({printedCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductFilterFormat('pdf')}
                    className={`px-2.5 py-1 rounded-full font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                      productFilterFormat === 'pdf'
                        ? 'bg-cyan-700 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    ডিজিটাল PDF ({pdfCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductFilterFormat('combo')}
                    className={`px-2.5 py-1 rounded-full font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                      productFilterFormat === 'combo'
                        ? 'bg-cyan-700 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    কম্বো ({comboCount})
                  </button>
                </div>

                {/* Products List */}
                <div className="space-y-2">
                  {filteredCatalogProducts.length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
                      <p className="text-xs text-slate-500">কোনো বই বা পিডিএফ খুঁজে পাওয়া যায়নি।</p>
                      <button
                        type="button"
                        onClick={() => handleStartCreateNewProduct('printed')}
                        className="inline-flex items-center gap-1.5 text-xs text-cyan-700 font-bold hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>এখানে নতুন বই যোগ করুন</span>
                      </button>
                    </div>
                  ) : (
                    filteredCatalogProducts.map((p) => {
                      const isSelected = !isCreatingNewProduct && selectedProduct?.id === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectProduct(p)}
                          className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                            isSelected
                              ? 'border-cyan-600 bg-cyan-50/60 shadow-xs ring-1 ring-cyan-500/30'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-semibold text-slate-500">
                              {p.sku || 'DC-SKU'}
                            </span>
                            <div className="flex items-center gap-1">
                              {p.isPublished === false && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                                  ড্রাফট
                                </span>
                              )}
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                {p.format === 'pdf' ? 'ডিজিটাল PDF' : p.format === 'combo' ? 'কম্বো' : 'মুদ্রিত বই'}
                              </span>
                            </div>
                          </div>

                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                            {p.titleBn}
                          </h4>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 tabular-nums">৳{p.price}</span>
                              {p.originalPrice && p.originalPrice > p.price && (
                                <span className="text-[10px] text-slate-400 line-through tabular-nums">
                                  ৳{p.originalPrice}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px]">
                              {p.format === 'pdf'
                                ? (p.hasSecurePdf || p.fileDownloadUrlOrKey ? '✓ PDF সংযুক্ত' : '⚠️ PDF ফাইল দিন')
                                : `স্টক: ${p.stockQuantity ?? 50} কপি`}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Add New Product Form OR Product Details/Edit Form */}
              <div className="md:col-span-7 p-5 sm:p-6 overflow-y-auto max-h-[78vh]">
                {isCreatingNewProduct ? (
                  /* ================= CREATE NEW PRODUCT FORM ================= */
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold shadow-xs">
                          <Plus className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-slate-900">
                            নতুন বই বা ডিজিটাল PDF যুক্ত করুন
                          </h4>
                          <p className="text-xs text-slate-500">
                            তথ্য পূরণ করে সরাসরি ক্যাটালগ ও ডাটাবেজে নতুন পণ্য প্রকাশ করুন
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingNewProduct(false);
                          if (!selectedProduct && products.length > 0) {
                            handleSelectProduct(products[0]);
                          }
                        }}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                      >
                        বাতিল
                      </button>
                    </div>

                    <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
                      {/* 1. Format Selector Cards */}
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-800 block">১. পণ্য ফরম্যাট নির্বাচন করুন *</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              setFormat('printed');
                              if (price === 120) setPrice(380);
                              if (originalPrice === 160) setOriginalPrice(480);
                              setCoverImage('/images/book_ssc_chemistry_guide_1793290222060.jpg');
                            }}
                            className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                              format === 'printed'
                                ? 'border-cyan-600 bg-cyan-50/70 ring-2 ring-cyan-500/30'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <span className="text-lg block mb-1">📘</span>
                            <span className="font-bold text-slate-900 block text-xs">মুদ্রিত বই (Printed)</span>
                            <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">
                              কাগজে মুদ্রিত হার্ডকপি বই, ডাকযোগে সারা দেশে ডেলিভারি
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setFormat('pdf');
                              if (price === 380) setPrice(120);
                              if (originalPrice === 480) setOriginalPrice(160);
                              setCoverImage('/images/book_organic_chemistry_notes_1793290222839.jpg');
                            }}
                            className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                              format === 'pdf'
                                ? 'border-cyan-600 bg-cyan-50/70 ring-2 ring-cyan-500/30'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <span className="text-lg block mb-1">📄</span>
                            <span className="font-bold text-slate-900 block text-xs">ডিজিটাল PDF হ্যান্ডনোট</span>
                            <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">
                              ইনস্ট্যান্ট ডাউনলোড সুবিধা ও ডিভাইস রিডার
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setFormat('combo');
                              if (price === 120) setPrice(460);
                              if (originalPrice === 160) setOriginalPrice(580);
                            }}
                            className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                              format === 'combo'
                                ? 'border-cyan-600 bg-cyan-50/70 ring-2 ring-cyan-500/30'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <span className="text-lg block mb-1">📦</span>
                            <span className="font-bold text-slate-900 block text-xs">কম্বো প্যাকেজ (Combo)</span>
                            <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">
                              মুদ্রিত বই + সাথে ডিজিটাল PDF লাইসেন্স
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* 2. Book Title & Branch */}
                      <div className="space-y-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
                        <span className="font-bold text-slate-800 block text-xs">২. বই বা নোটের শিরোনাম ও শাখা</span>
                        
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700 block">বই / নোটের নাম (বাংলা) *</label>
                          <input
                            type="text"
                            required
                            value={titleBn}
                            onChange={(e) => setTitleBn(e.target.value)}
                            placeholder="যেমন: দিশারী এসএসসি রসায়ন অধ্যায় ৪ ও ৫ স্পেশাল হ্যান্ডনোট"
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-cyan-500 shadow-2xs"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="font-semibold text-slate-700 block">ইংরেজি নাম (ঐচ্ছিক)</label>
                            <input
                              type="text"
                              value={titleEn}
                              onChange={(e) => setTitleEn(e.target.value)}
                              placeholder="e.g. Dishari Chemistry Special Notes"
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-cyan-500 shadow-2xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-semibold text-slate-700 block">বিষয় / শাখা (Chemistry Branch)</label>
                            <select
                              value={selectedBranch}
                              onChange={(e) => setSelectedBranch(e.target.value as any)}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-cyan-500 shadow-2xs"
                            >
                              <option value="all">সব শাখা / সাধারণ রসায়ন (General)</option>
                              <option value="organic">জৈব রসায়ন (Organic Chemistry)</option>
                              <option value="inorganic">অজৈব রসায়ন (Inorganic Chemistry)</option>
                              <option value="physical">ভৌত ও ব্যবহারিক রসায়ন (Physical)</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700 block">সাবটাইটেল বা ট্যাগলাইন (বাংলা)</label>
                          <input
                            type="text"
                            value={subtitleBn}
                            onChange={(e) => setSubtitleBn(e.target.value)}
                            placeholder="যেমন: পর্যায় সারণি ও রাসায়নিক বন্ধনের সহজ ব্যাখ্যা ও বোর্ড সমাধান"
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-cyan-500 shadow-2xs"
                          />
                        </div>
                      </div>

                      {/* 3. Pricing & Inventory */}
                      <div className="space-y-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 block text-xs">৩. মূল্য নির্ধারণ ও ইনভেন্টরি স্টক</span>
                          {originalPrice > price && price > 0 && (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              🎉 {Math.round(((originalPrice - price) / originalPrice) * 100)}% বিশেষ ছাড় সক্রিয়
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="font-semibold text-slate-700 block">বিক্রয় মূল্য (৳) *</label>
                            <input
                              type="number"
                              required
                              min={0}
                              value={price}
                              onChange={(e) => setPrice(Number(e.target.value))}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-cyan-500 font-bold text-cyan-900 shadow-2xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-semibold text-slate-700 block">পূর্বের / আসল মূল্য (৳)</label>
                            <input
                              type="number"
                              min={0}
                              value={originalPrice || ''}
                              placeholder="ছাড় থাকলে লিখুন"
                              onChange={(e) => setOriginalPrice(Number(e.target.value))}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-cyan-500 shadow-2xs"
                            />
                          </div>

                          {format !== 'pdf' ? (
                            <div className="space-y-1">
                              <label className="font-semibold text-slate-700 block">মুদ্রিত স্টক সংখ্যা (কপি)</label>
                              <input
                                type="number"
                                min={0}
                                value={stockQuantity}
                                onChange={(e) => setStockQuantity(Number(e.target.value))}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-cyan-500 shadow-2xs"
                              />
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <label className="font-semibold text-slate-400 block">স্টক সংখ্যা</label>
                              <div className="px-3 py-2 bg-slate-100 text-slate-500 rounded-lg text-xs border border-slate-200">
                                ডিজিটাল পণ্য (আনলিমিটেড)
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 4. PDF File Attachment (for PDF & Combo) */}
                      {(format === 'pdf' || format === 'combo') && (
                        <div className="space-y-3 p-3.5 bg-cyan-50/60 rounded-xl border border-cyan-200">
                          <div className="flex items-center gap-2 text-cyan-900">
                            <FolderLock className="w-4 h-4 text-cyan-700" />
                            <span className="font-bold text-xs">৪. সুরক্ষিত PDF হ্যান্ডনোট ফাইল সংযুক্তকরণ</span>
                          </div>

                          <div className="space-y-2">
                            <label className="font-semibold text-slate-700 block">
                              সরাসরি .pdf ফাইল আপলোড করুন (সর্বোচ্চ ১০০ মেগাবাইট)
                            </label>
                            <div className="p-4 bg-white rounded-xl border-2 border-dashed border-cyan-300 flex flex-col items-center justify-center gap-2 text-center">
                              <input
                                type="file"
                                accept=".pdf,application/pdf"
                                id="newProductPdfInput"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    const f = e.target.files[0];
                                    if (f.name.toLowerCase().endsWith('.pdf')) {
                                      setNewPdfFile(f);
                                    } else {
                                      alert('অনুগ্রহ করে শুধুমাত্র বৈধ .pdf ফাইল নির্বাচন করুন।');
                                    }
                                  }
                                }}
                                className="hidden"
                              />
                              {newPdfFile ? (
                                <div className="flex items-center gap-2.5 bg-emerald-50 text-emerald-800 px-3.5 py-2.5 rounded-lg border border-emerald-200 w-full justify-between">
                                  <div className="flex items-center gap-2">
                                    <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                                    <div className="text-left">
                                      <span className="font-bold block text-xs truncate max-w-[240px]">{newPdfFile.name}</span>
                                      <span className="text-[10px] text-slate-500">
                                        {(newPdfFile.size / (1024 * 1024)).toFixed(2)} MB • আপলোডের জন্য প্রস্তুত
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setNewPdfFile(null)}
                                    className="text-slate-400 hover:text-rose-600 p-1"
                                    title="ফাইল বাদ দিন"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <label
                                  htmlFor="newProductPdfInput"
                                  className="cursor-pointer flex flex-col items-center gap-1.5 py-1 w-full"
                                >
                                  <Upload className="w-6 h-6 text-cyan-600 animate-bounce" />
                                  <span className="font-bold text-cyan-800 text-xs hover:underline">
                                    কম্পিউটার বা ডিভাইস থেকে PDF ফাইল সিলেক্ট করুন
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    সংরক্ষণের সময় ফাইলটি সরাসরি প্রাইভেট ফায়ারবেস ভল্টে যুক্ত হবে
                                  </span>
                                </label>
                              )}
                            </div>

                            <div className="space-y-1 pt-1">
                              <label className="text-[11px] text-slate-600 block">
                                অথবা ক্লাউড / প্রিভিউ লিংক (URL):
                              </label>
                              <input
                                type="text"
                                value={fileDownloadUrlOrKey}
                                onChange={(e) => setFileDownloadUrlOrKey(e.target.value)}
                                placeholder="/uploads/pdfs/... বা ক্লাউড ড্রাইভ লিংক"
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:outline-hidden focus:border-cyan-500"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 5. Cover Image & Presets */}
                      <div className="space-y-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 block text-xs">৫. বইয়ের কভার ছবি (Cover Image)</span>
                          <span className="text-[10px] text-slate-500">প্রিসেট থেকে নির্বাচন বা কাস্টম URL দিন</span>
                        </div>

                        {/* Preset Cover Buttons */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {PRESET_COVERS.map((cov, idx) => {
                            const isPicked = coverImage === cov.url;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setCoverImage(cov.url)}
                                className={`p-2 rounded-xl border text-left cursor-pointer transition-all flex flex-col items-center gap-1.5 ${
                                  isPicked
                                    ? 'border-cyan-600 bg-cyan-50/60 ring-2 ring-cyan-500/30'
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                }`}
                              >
                                <div className="w-12 h-16 rounded overflow-hidden bg-slate-100 shadow-2xs relative">
                                  <Image
                                    src={cov.url}
                                    alt={cov.label}
                                    width={48}
                                    height={64}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <span className="text-[10px] font-bold text-slate-800 text-center line-clamp-1">
                                  {cov.label}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                                  {cov.tag}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        <div className="space-y-1 pt-1">
                          <label className="text-[11px] text-slate-600 block">কাস্টম ইমেজ URL বা ফাইল পাথ:</label>
                          <input
                            type="text"
                            value={coverImage}
                            onChange={(e) => setCoverImage(e.target.value)}
                            placeholder="/images/... বা https://..."
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:outline-hidden focus:border-cyan-500 shadow-2xs"
                          />
                        </div>
                      </div>

                      {/* 6. Author, Edition & Publisher */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700 block">লেখক / ইন্সট্রাক্টর</label>
                          <input
                            type="text"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-cyan-500 shadow-2xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700 block">সংস্করণ (Edition)</label>
                          <input
                            type="text"
                            value={edition}
                            onChange={(e) => setEdition(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-cyan-500 shadow-2xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700 block">প্রকাশনী (Publisher)</label>
                          <input
                            type="text"
                            value={publisher}
                            onChange={(e) => setPublisher(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-cyan-500 shadow-2xs"
                          />
                        </div>
                      </div>

                      {/* 7. Description */}
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700 block">বই বা নোটের সংক্ষিপ্ত বিবরণ</label>
                        <textarea
                          rows={3}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="বইয়ের বিষয়বস্তু, অধ্যায় ও বিশেষত্ব সম্পর্কে লিখুন..."
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-cyan-500 shadow-2xs"
                        />
                      </div>

                      {/* 8. Live Publish Checkbox */}
                      <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <input
                          type="checkbox"
                          id="newProductPublishCheck"
                          checked={isPublished}
                          onChange={(e) => setIsPublished(e.target.checked)}
                          className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor="newProductPublishCheck" className="font-bold text-slate-800 cursor-pointer">
                          সরাসরি ওয়েবসাইটে লাইভ প্রদর্শন করুন (Published to Storefront)
                        </label>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2.5 pt-2">
                        <button
                          type="submit"
                          disabled={isSavingProduct}
                          className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-700 to-cyan-800 hover:from-cyan-800 hover:to-cyan-900 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                        >
                          {isSavingProduct ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>ডাটাবেজ ও ভল্টে সংরক্ষণ হচ্ছে...</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              <span>+ নতুন বই/নোট ক্যাটালগে যুক্ত করুন (Save & Publish)</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsCreatingNewProduct(false)}
                          className="py-3 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                        >
                          বাতিল
                        </button>
                      </div>
                    </form>
                  </div>
                ) : selectedProduct ? (
                  /* ================= EDIT OR VIEW PRODUCT ================= */
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                      <div>
                        <span className="text-xs font-mono text-cyan-800 font-bold block">
                          {selectedProduct.sku || 'DC-SKU'}
                        </span>
                        <h4 className="text-base font-bold text-slate-900">
                          {isEditingProduct ? 'পণ্য সম্পাদনা ফরম' : selectedProduct.titleBn}
                        </h4>
                      </div>

                      {!isEditingProduct ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStartCreateNewProduct('printed')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-700 hover:bg-cyan-800 text-white transition-colors cursor-pointer shadow-xs"
                            title="নতুন বই বা PDF যোগ করুন"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ নতুন পণ্য</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleStartEdit}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>সম্পাদনা</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(selectedProduct)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                            title="পণ্যটি মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>মুছে ফেলুন</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsEditingProduct(false)}
                          className="text-xs text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                        >
                          বাতিল
                        </button>
                      )}
                    </div>

                    {isEditingProduct ? (
                      <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700 block">বই / নোটের নাম (বাংলা) *</label>
                          <input
                            type="text"
                            required
                            value={titleBn}
                            onChange={(e) => setTitleBn(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-cyan-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="font-semibold text-slate-700 block">বিক্রয় মূল্য (৳) *</label>
                            <input
                              type="number"
                              required
                              value={price}
                              onChange={(e) => setPrice(Number(e.target.value))}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-cyan-500 font-bold"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-semibold text-slate-700 block">পূর্বের মূল্য / ছাড় রেফারেন্স (৳)</label>
                            <input
                              type="number"
                              value={originalPrice || ''}
                              placeholder="যেমন: 550"
                              onChange={(e) => setOriginalPrice(Number(e.target.value))}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-cyan-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-semibold text-slate-700 block">পণ্য ফরম্যাট *</label>
                            <select
                              value={format}
                              onChange={(e) => setFormat(e.target.value as 'printed' | 'pdf' | 'combo')}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-cyan-500"
                            >
                              <option value="printed">মুদ্রিত বই (Printed)</option>
                              <option value="pdf">ডিজিটাল পিডিএফ (PDF)</option>
                              <option value="combo">কম্বো প্যাকেজ (Combo)</option>
                            </select>
                          </div>
                        </div>

                        {format !== 'pdf' && (
                          <div className="space-y-1">
                            <label className="font-semibold text-slate-700 block">ইনভেন্টরি স্টক সংখ্যা</label>
                            <input
                              type="number"
                              value={stockQuantity}
                              onChange={(e) => setStockQuantity(Number(e.target.value))}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-cyan-500"
                            />
                          </div>
                        )}

                        {(format === 'pdf' || format === 'combo') && (
                          <div className="space-y-1.5 pt-1">
                            <label className="font-semibold text-slate-700 block">
                              প্রাইভেট ফায়ারবেস স্টোরেজ PDF ফাইল
                            </label>
                            <AdminUploadPDF
                              product={selectedProduct}
                              compact={true}
                              onUploadSuccess={(updated) => {
                                onUpdateProduct(updated);
                                setSelectedProduct(updated);
                                if (updated.pdfFileName) {
                                  setFileDownloadUrlOrKey(updated.pdfFileName);
                                }
                              }}
                            />
                          </div>
                        )}

                        {/* Preset Covers Selector for Edit Form */}
                        <div className="space-y-2">
                          <label className="font-semibold text-slate-700 block">কভার ছবি প্রিসেট নির্বাচন:</label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {PRESET_COVERS.map((cov, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setCoverImage(cov.url)}
                                className={`p-1.5 rounded-lg border text-left cursor-pointer flex items-center gap-2 ${
                                  coverImage === cov.url
                                    ? 'border-cyan-600 bg-cyan-50 text-cyan-900 font-bold'
                                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <Image
                                  src={cov.url}
                                  alt={cov.label}
                                  width={28}
                                  height={36}
                                  className="w-7 h-9 object-cover rounded shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                                <span className="text-[10px] truncate">{cov.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700 block">কভার ইমেজ লিংক (URL / Path)</label>
                          <input
                            type="text"
                            value={coverImage}
                            onChange={(e) => setCoverImage(e.target.value)}
                            className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-cyan-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700 block">লেখক / সংকলক তথ্য</label>
                          <input
                            type="text"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-cyan-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700 block">বিবরণ</label>
                          <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-cyan-500"
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="checkbox"
                            id="isPublishedCheck"
                            checked={isPublished}
                            onChange={(e) => setIsPublished(e.target.checked)}
                            className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4 cursor-pointer"
                          />
                          <label htmlFor="isPublishedCheck" className="font-semibold text-slate-700 cursor-pointer">
                            ওয়েবসাইটে লাইভ প্রদর্শিত হবে (Published)
                          </label>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-cyan-700 hover:bg-cyan-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>ডাটাবেজে পরিবর্তন সংরক্ষণ করুন (Live Update)</span>
                        </button>
                      </form>
                    ) : (
                      <div className="space-y-3 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="text-slate-400 block text-[11px]">ফরম্যাট</span>
                            <span className="font-semibold text-slate-800">
                              {selectedProduct.format === 'pdf' ? 'ডিজিটাল পিডিএফ (PDF)' : selectedProduct.format === 'combo' ? 'কম্বো প্যাক (Printed + PDF)' : 'মুদ্রিত সংস্করণ (Printed)'}
                            </span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="text-slate-400 block text-[11px]">বিক্রয় মূল্য ও ডিসকাউন্ট</span>
                            <div className="flex items-baseline gap-2">
                              <span className="font-bold text-slate-900 tabular-nums text-sm">৳{selectedProduct.price}</span>
                              {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                                <>
                                  <span className="text-[11px] text-slate-400 line-through tabular-nums">
                                    ৳{selectedProduct.originalPrice}
                                  </span>
                                  <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-bold">
                                    {Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)}% ছাড়
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="text-slate-400 block text-[11px]">ইনভেন্টরি স্টক</span>
                            <span className="font-semibold text-slate-800">
                              {selectedProduct.format === 'pdf' ? 'প্রযোজ্য নয় (ডিজিটাল)' : `${selectedProduct.stockQuantity || 50} কপি`}
                            </span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="text-slate-400 block text-[11px]">স্ট্যাটাস</span>
                            <span className={`font-semibold ${selectedProduct.isPublished !== false ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {selectedProduct.isPublished !== false ? 'প্রকাশিত (Published)' : 'ড্রাফট (Draft)'}
                            </span>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                          <span className="text-slate-400 block text-[11px]">পিডিএফ ফাইল রেফারেন্স</span>
                          <span className="font-mono text-cyan-800 block truncate">
                            {selectedProduct.fileDownloadUrlOrKey || selectedProduct.pdfFileName || 'সংযুক্ত নেই'}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                          <span className="text-slate-400 block text-[11px]">লেখক / সংকলক</span>
                          <p className="font-medium text-slate-800">{selectedProduct.author || '[তথ্য খালি]'}</p>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                          <span className="text-slate-400 block text-[11px]">বিবরণ</span>
                          <p className="text-slate-600 leading-relaxed">{selectedProduct.description}</p>
                        </div>

                        <div className="p-3 bg-gradient-to-r from-cyan-50 to-amber-50 rounded-xl border border-cyan-200 flex flex-wrap items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2">
                            <BellRing className="w-4 h-4 text-cyan-700 shrink-0" />
                            <span className="text-xs text-slate-700 font-medium">
                              শিক্ষার্থীদের জন্য মূল্যছাড় ও ডিসকাউন্ট নোটিফিকেশন পরীক্ষা করুন
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const disc = selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price
                                ? Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)
                                : 20;
                              const origPrice = selectedProduct.originalPrice || Math.round(selectedProduct.price * 1.25);
                              broadcastPriceAlert({
                                productId: selectedProduct.id,
                                title: selectedProduct.titleBn,
                                oldPrice: origPrice,
                                newPrice: selectedProduct.price,
                                originalPrice: origPrice,
                                discountPercent: disc,
                                type: 'new_discount',
                                customMessage: `🎉 বিশেষ অফার অ্যালার্ট! "${selectedProduct.titleBn}" এখন মাত্র ৳${selectedProduct.price}-এ (${disc}% ছাড়)!`,
                              });
                              setSavedNotice('মূল্যছাড় নোটিফিকেশন পাঠানো হয়েছে! উপরে টোস্ট প্রদর্শন হচ্ছে।');
                              setTimeout(() => setSavedNotice(null), 3500);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-700 hover:bg-cyan-800 text-white transition-colors cursor-pointer shadow-xs"
                          >
                            <Percent className="w-3.5 h-3.5" />
                            <span>নোটিফিকেশন টেস্ট পাঠান</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ================= EMPTY STATE PLACEHOLDER ================= */
                  <div className="p-12 text-center flex flex-col items-center justify-center space-y-3 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 max-w-sm">
                      <h4 className="font-bold text-slate-800 text-sm">কোনো পণ্য নির্বাচিত নেই</h4>
                      <p className="text-xs text-slate-500">
                        বাম পাশের তালিকা থেকে যেকোনো বই নির্বাচন করে সম্পাদনা করুন অথবা নতুন বই/পিডিএফ ক্যাটালগে যুক্ত করুন।
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleStartCreateNewProduct('printed')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-cyan-700 hover:bg-cyan-800 transition-colors shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ নতুন বই বা PDF যুক্ত করুন</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Tab 3: PDF Vault & Digital Delivery Management (Requirements 1, 2, 6, 7, 13) */}
        {activeTab === 'pdf_vault' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 max-h-[75vh]">
            {/* Header & Architecture Notice */}
            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2 border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-600/30 text-cyan-400 flex items-center justify-center">
                    <FolderLock className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-white">
                    প্রাইভেট ফায়ারবেস স্টোরেজ PDF ভল্ট
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('products');
                      handleStartCreateNewProduct('pdf');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors cursor-pointer shadow-xs"
                    title="নতুন ডিজিটাল PDF নোট তৈরি ও ভল্টে ফাইল আপলোড করুন"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ নতুন ডিজিটাল PDF তৈরি করুন</span>
                  </button>
                  <span className="text-[10px] bg-cyan-900/60 text-cyan-300 border border-cyan-700/60 px-2 py-0.5 rounded font-mono">
                    private_pdfs/&#123;productId&#125;/
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                এখানে আপলোডকৃত সব PDF ফাইল সম্পূর্ণ প্রাইভেট ফায়ারবেস স্টোরেজে সংরক্ষিত থাকে।
                কোনো পাবলিক ডাউনলোড লিঙ্ক বা টোকেন সরাসরি প্রদর্শিত হয় না। শুধুমাত্র অনুমোদিত অ্যাডমিন ফাইল আপলোড/প্রতিস্থাপন করতে পারেন এবং যাচাইকৃত ক্রেতারা সার্ভার-অথেনটিকেশনের মাধ্যমে নির্দিষ্ট ডাউনলোড সীমার মধ্যে ফাইল সংগ্রহ করতে পারেন।
              </p>
            </div>

            {/* Dedicated AdminUploadPDF Component Module */}
            <AdminUploadPDF
              products={products}
              onUploadSuccess={(updated) => {
                onUpdateProduct(updated);
                if (selectedProduct?.id === updated.id) {
                  setSelectedProduct(updated);
                }
                setSavedNotice(
                  `"${updated.titleBn}" এর জন্য PDF ফাইল সফলভাবে ফায়ারস্টোরে লিঙ্ক ও সংরক্ষিত হয়েছে!`
                );
                setTimeout(() => setSavedNotice(null), 4000);
              }}
            />

            {/* List of Digital Products & Individual Upload Controls */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  পৃথক ডিজিটাল পণ্যভিত্তিক ভল্ট স্ট্যাটাস ও আপলোড ({products.filter((p) => p.format === 'pdf' || p.format === 'combo').length})
                </span>
                <span className="text-xs text-slate-500">
                  নিচের যেকোনো পণ্যের জন্য সরাসরি ফাইল ড্রপ বা নির্বাচন করুন
                </span>
              </div>

              {products
                .filter((p) => p.format === 'pdf' || p.format === 'combo')
                .map((prod) => (
                  <AdminUploadPDF
                    key={prod.id}
                    product={prod}
                    onUploadSuccess={(updated) => {
                      onUpdateProduct(updated);
                      if (selectedProduct?.id === updated.id) {
                        setSelectedProduct(updated);
                      }
                      setSavedNotice(
                        `"${updated.titleBn}" এর জন্য PDF ফাইল সফলভাবে ফায়ারস্টোরে লিঙ্ক ও সংরক্ষিত হয়েছে!`
                      );
                      setTimeout(() => setSavedNotice(null), 4000);
                    }}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Tab 4: Payment Verification for PDF Orders */}
        {activeTab === 'payment_verification' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-h-[75vh]">
            {/* Top Dashboard Hero Banner */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                      <span>ডিজিটাল PDF পেমেন্ট ভেরিফিকেশন প্যানেল (Payment Verification)</span>
                      {pendingPdfOrders.length > 0 && (
                        <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-mono animate-pulse">
                          {pendingPdfOrders.length} টি অপেক্ষমাণ
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      গ্রাহকদের জমা দেওয়া bKash / Nagad ট্রানজেকশন আইডি (TxnID) মিলিয়ে এক ক্লিকে ডাউনলোড পারমিশন সক্রিয় করুন
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-300 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                    মোট ডিজিটাল অর্ডার: <strong className="text-white font-mono">{pdfOrders.length}</strong>
                  </span>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800 text-xs">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex items-center justify-between">
                  <span className="text-slate-400">ভেরিফিকেশন অপেক্ষমাণ:</span>
                  <span className={`font-bold font-mono px-2 py-0.5 rounded text-xs ${pendingPdfOrders.length > 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400'}`}>
                    {pendingPdfOrders.length} টি
                  </span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex items-center justify-between">
                  <span className="text-slate-400">অনুমোদিত ও ডাউনলোড সক্রিয়:</span>
                  <span className="font-bold font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
                    {pdfOrders.filter(o => o.paymentStatus === 'verified').length} টি
                  </span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex items-center justify-between">
                  <span className="text-slate-400">ম্যানুয়াল বিকাশ/নগদ পদ্ধতি:</span>
                  <span className="font-bold text-cyan-400">১০০% ফায়ারস্টোর ভেরিফাইড</span>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              {/* Tab Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setPaymentTabFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    paymentTabFilter === 'pending'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>অপেক্ষমাণ পেমেন্ট</span>
                  <span className="ml-1.5 font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/20">
                    {pendingPdfOrders.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentTabFilter('verified')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    paymentTabFilter === 'verified'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>অনুমোদিত (Verified)</span>
                  <span className="ml-1.5 font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/20">
                    {pdfOrders.filter(o => o.paymentStatus === 'verified').length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentTabFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    paymentTabFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>সকল ডিজিটাল অর্ডার</span>
                  <span className="ml-1.5 font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/20">
                    {pdfOrders.length}
                  </span>
                </button>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="অর্ডার কোড, ফোন, TxnID খুঁজুন..."
                  value={paymentSearchQuery}
                  onChange={(e) => setPaymentSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-cyan-600"
                />
              </div>
            </div>

            {/* Orders List */}
            {filteredPaymentOrders.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h5 className="font-bold text-slate-800 text-sm">
                  {paymentTabFilter === 'pending'
                    ? 'কোনো অপেক্ষমাণ ডিজিটাল PDF অর্ডার নেই!'
                    : 'প্রদত্ত ফিল্টারে কোনো অর্ডার পাওয়া যায়নি।'}
                </h5>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {paymentTabFilter === 'pending'
                    ? 'সবগুলো ডিজিটাল PDF অর্ডারের পেমেন্ট সফলভাবে যাচাই করা হয়েছে অথবা নতুন কোনো অর্ডার জমা পড়েনি।'
                    : 'ফিল্টার বা সার্চের কীওয়ার্ড পরিবর্তন করে পুনরায় চেষ্টা করুন।'}
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={statusUpdating}
                    onClick={handleCreateDemoPendingOrder}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>পরীক্ষামূলক পেন্ডিং PDF অর্ডার তৈরি করুন (Test Verification)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPaymentOrders.map((order) => {
                  const isVerified = order.paymentStatus === 'verified';
                  const hasDownload = Boolean(order.downloadPermission);

                  return (
                    <div
                      key={order.orderId}
                      className={`border rounded-2xl p-5 bg-white shadow-xs space-y-4 transition-all ${
                        isVerified
                          ? 'border-emerald-200/80 bg-emerald-50/10'
                          : 'border-amber-300 bg-amber-50/15 hover:border-amber-400'
                      }`}
                    >
                      {/* Order Card Top Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {order.orderId}
                          </span>
                          <button
                            type="button"
                            title="অর্ডার আইডি কপি করুন"
                            onClick={() => {
                              navigator.clipboard.writeText(order.orderId);
                              setCopiedKey(order.orderId);
                              setTimeout(() => setCopiedKey(null), 2000);
                            }}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            {copiedKey === order.orderId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <span className="text-xs text-slate-500">
                            {new Date(order.createdAt).toLocaleDateString('bn-BD', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {/* Status Badges */}
                        <div className="flex items-center gap-2">
                          {isVerified ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>পেমেন্ট অনুমোদিত • PDF সক্রিয়</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>ম্যানুয়াল যাচাই অপেক্ষমাণ</span>
                            </span>
                          )}

                          {hasDownload ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-200">
                              ডাউনলোড লাইসেন্স সক্রিয়
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              ডাউনলোড লকড
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Content Grid: Customer & Payment Data */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                        {/* Column 1: Customer Details */}
                        <div className="md:col-span-4 p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                          <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
                            গ্রাহকের তথ্য
                          </span>
                          <div>
                            <span className="text-slate-400 block text-[10px]">নাম:</span>
                            <span className="font-bold text-slate-900">{order.customerName}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">মোবাইল / WhatsApp:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-slate-800">{order.customerPhone}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(order.customerPhone);
                                  setCopiedKey(`phone_${order.orderId}`);
                                  setTimeout(() => setCopiedKey(null), 2000);
                                }}
                                className="text-slate-400 hover:text-slate-700 cursor-pointer"
                              >
                                {copiedKey === `phone_${order.orderId}` ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                          {order.customerEmail && (
                            <div>
                              <span className="text-slate-400 block text-[10px]">ইমেইল:</span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-slate-800 truncate block max-w-[180px]">
                                  {order.customerEmail}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(order.customerEmail || '');
                                    setCopiedKey(`email_${order.orderId}`);
                                    setTimeout(() => setCopiedKey(null), 2000);
                                  }}
                                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                                >
                                  {copiedKey === `email_${order.orderId}` ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Column 2: Payment & Transaction Card (The core verification focus) */}
                        <div className="md:col-span-5 p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-950 block text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                              <CreditCard className="w-3.5 h-3.5 text-amber-700" />
                              <span>পেমেন্ট তথ্য ও TxnID</span>
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                order.paymentMethod === 'bkash'
                                  ? 'bg-pink-100 text-pink-800 border border-pink-200'
                                  : 'bg-orange-100 text-orange-800 border border-orange-200'
                              }`}
                            >
                              {order.paymentMethod === 'bkash' ? 'bKash (বিকাশ)' : 'Nagad (নগদ)'}
                            </span>
                          </div>

                          {/* Highlighted Transaction ID Box */}
                          <div className="bg-white p-2.5 rounded-lg border border-amber-300/80 shadow-2xs space-y-1">
                            <span className="text-[10px] font-semibold text-slate-500 block">
                              গ্রাহকের জমা দেওয়া Transaction ID (TxnID):
                            </span>
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono font-bold text-sm text-slate-900 select-all tracking-wide">
                                {order.transactionId || '[TxnID প্রদান করা হয়নি]'}
                              </span>
                              {order.transactionId && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(order.transactionId || '');
                                    setCopiedKey(`txn_${order.orderId}`);
                                    setTimeout(() => setCopiedKey(null), 2000);
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold transition-colors cursor-pointer"
                                >
                                  {copiedKey === `txn_${order.orderId}` ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      <span className="text-emerald-700">কপি হয়েছে</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>কপি</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className="text-slate-500 block text-[10px]">প্রেরক নম্বর:</span>
                              <span className="font-mono font-bold text-slate-800">
                                {order.senderPhone || order.customerPhone || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[10px]">পরিশোধিত মূল্য:</span>
                              <span className="font-mono font-bold text-sm text-cyan-800">
                                ৳{order.total}
                              </span>
                            </div>
                          </div>

                          {order.verifiedAt && (
                            <div className="text-[10px] text-emerald-800 bg-emerald-100/60 p-1.5 rounded border border-emerald-200">
                              যাচাই সম্পন্ন: {new Date(order.verifiedAt).toLocaleString('bn-BD')} ({order.verifiedBy || 'Admin'})
                            </div>
                          )}
                        </div>

                        {/* Column 3: Items & Download Stats */}
                        <div className="md:col-span-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                          <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
                            অর্ডারকৃত ডিজিটাল নোট
                          </span>

                          <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                            {order.items
                              .filter((it) => it.format === 'pdf' || it.format === 'combo')
                              .map((it, idx) => (
                                <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200">
                                  <span className="font-bold text-slate-900 block truncate">
                                    {it.titleBn}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    {it.sku || 'DC-PDF'} • ৳{it.unitPrice}
                                  </span>
                                </div>
                              ))}
                          </div>

                          <div className="pt-1 border-t border-slate-200 flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">ডাউনলোড হিসাব:</span>
                            <span className="font-mono font-bold text-slate-800">
                              {order.downloadCount || 0} / {order.downloadLimit || 5} বার
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Bottom Verification Action Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 bg-slate-50/50 p-3 rounded-xl">
                        <div className="flex items-center gap-2">
                          {!isVerified ? (
                            <button
                              type="button"
                              disabled={statusUpdating}
                              data-action="approve-payment"
                              onClick={() => handleVerifyPaymentAndGrantAccess(order)}
                              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
                            >
                              {statusUpdating ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4" />
                              )}
                              <span>Approve (পেমেন্ট অনুমোদন ও PDF এক্সেস দিন)</span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>পেমেন্ট যাচাইকৃত ও গ্রাহক লাইসেন্স সক্রিয়</span>
                              </span>

                              <button
                                type="button"
                                disabled={statusUpdating}
                                onClick={() => handleToggleDownloadPermission(order.orderId, hasDownload)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                {hasDownload ? (
                                  <>
                                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                                    <span>ডাউনলোড স্থগিত করুন</span>
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>ডাউনলোড পুনরায় চালু</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Secondary Actions */}
                        <div className="flex items-center gap-2">
                          {!isVerified && (
                            <button
                              type="button"
                              disabled={statusUpdating}
                              onClick={() => handleUpdatePaymentStatus(order.orderId, 'failed')}
                              className="px-3 py-2 rounded-lg text-xs font-semibold text-red-700 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer"
                            >
                              পেমেন্ট বাতিল (Reject)
                            </button>
                          )}

                          {isVerified && (
                            <button
                              type="button"
                              disabled={statusUpdating}
                              onClick={() => handleIncreaseDownloadLimit(order.orderId, order.downloadLimit || 5)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-800 hover:bg-cyan-700 text-cyan-100 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>+৫ ডাউনলোড সীমা</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        </>
      )}
    </div>
  );

  if (standalone) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col p-0 sm:p-3 md:p-4">
        {panelContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-150">
      {panelContent}
    </div>
  );
};
