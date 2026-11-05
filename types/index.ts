export type BookFormat = 'printed' | 'pdf' | 'combo';
export type ChemistryBranch = 'all' | 'organic' | 'inorganic' | 'physical';
export type AvailabilityStatus = 'in_stock' | 'pre_order' | 'digital_download' | 'draft';

export interface SamplePage {
  pageNumber: number;
  title: string;
  excerpt: string;
  keyFormulas?: string[];
  diagramNote?: string;
}

export interface Chapter {
  number: number;
  title: string;
  topics: string[];
}

export interface AuthorInfo {
  name: string;
  role: string;
  institution?: string;
  image: string;
  bio: string;
  experience?: string;
  badges?: string[];
}

/**
 * Admin-Ready Product Schema
 * Designed so that store owners can easily manage titles, covers, pricing,
 * inventory, formats, and download references from an admin panel or database.
 */
export interface Product {
  id: string;
  sku?: string;
  titleBn: string;
  titleEn: string;
  subtitleBn: string;
  format: BookFormat;
  branches?: ('organic' | 'inorganic' | 'physical')[];
  price: number;
  originalPrice?: number;
  isSamplePrice: boolean;
  availabilityStatus: AvailabilityStatus;
  stockQuantity?: number; // for printed books
  inventoryTracking: boolean;
  pages?: number;
  coverImage: string;
  edition?: string;
  author?: string;
  authorInfo?: AuthorInfo;
  publisher?: string;
  bindingType?: string; // e.g. পেপারব্যাক, হার্ডকপি
  fileFormat?: string; // e.g. PDF (Interactive), ePub
  fileDownloadUrlOrKey?: string; // Reference to digital file in storage
  pdfFileRef?: string; // Private Firebase Storage file path, e.g. private_pdfs/{productId}/{fileName}
  pdfFileName?: string; // Original uploaded file name
  pdfFileSizeMb?: number;
  pdfUploadedAt?: string;
  hasSecurePdf?: boolean; // True when admin has linked an authorized PDF
  fileSizeMb?: number;
  samplePdfUrl?: string; // URL for 3-page preview PDF
  description: string;
  highlights: string[];
  chapters: Chapter[];
  samplePages: SamplePage[];
  isFeatured?: boolean;
  isPublished?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface PrintedOrderDetails {
  customerName: string;
  phone: string;
  alternativePhone?: string;
  district: string;
  fullAddress: string;
  deliveryZone: 'inside_dhaka' | 'outside_dhaka';
  deliveryFee: number;
  courierPreference?: string;
  paymentMethod: 'cod' | 'bkash' | 'nagad';
  notes?: string;
}

export interface PdfOrderDetails {
  customerName: string;
  email: string;
  whatsappPhone: string;
  paymentMethod: 'bkash' | 'nagad';
  transactionId: string;
  senderPhone: string;
}

export interface DownloadHistoryRecord {
  downloadedAt: string;
  ip?: string;
  userAgent?: string;
  itemTitle?: string;
  productId?: string;
}

export interface CompletedOrder {
  orderId: string;
  customerId?: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  orderType: 'printed' | 'pdf' | 'mixed';
  printedDetails?: PrintedOrderDetails;
  pdfDetails?: PdfOrderDetails;
  status: 'received' | 'processing' | 'shipped' | 'delivered';
  paymentStatus?: 'pending_verification' | 'verified' | 'failed' | 'refunded';
  downloadPermission?: boolean;
  downloadCount?: number;
  downloadLimit?: number;
  downloadHistory?: DownloadHistoryRecord[];
  isDemoSimulation: boolean;
  dbPersisted?: boolean;
  createdAt?: string;
}

export interface FirestoreOrderItem {
  productId: string;
  titleBn: string;
  format: BookFormat;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  sku?: string;
  pdfFileRef?: string;
  pdfFileName?: string;
}

export interface FirestoreOrderRecord {
  orderId: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  orderType: 'printed' | 'pdf' | 'mixed';
  items: FirestoreOrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryZone?: string;
  deliveryAddress?: string;
  district?: string;
  paymentMethod: 'cod' | 'bkash' | 'nagad';
  paymentStatus: 'pending_verification' | 'verified' | 'failed' | 'refunded';
  orderStatus: 'received' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  downloadPermission?: boolean;
  downloadCount?: number;
  downloadLimit?: number;
  downloadHistory?: DownloadHistoryRecord[];
  transactionId?: string;
  senderPhone?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  isDemoSimulation: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProfile {
  uid: string;
  email: string;
  role: 'admin' | 'superadmin';
  createdAt?: string;
}

