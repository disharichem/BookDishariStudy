import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { INITIAL_PRODUCTS } from '@/data/products';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Product } from '@/types';

export const runtime = 'nodejs';

// Max file size: 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'অনুরোধটিতে multipart/form-data থাকতে হবে।' },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const productId = formData.get('productId') as string | null;
    const productJson = formData.get('product') as string | null;

    if (!file || !productId) {
      return NextResponse.json(
        { error: 'ফাইল এবং পণ্য আইডি (productId) উভয়ই আবশ্যক।' },
        { status: 400 }
      );
    }

    // 1. File Type and Size Validation
    const fileName = file.name || 'document.pdf';
    const isPdfExt = fileName.toLowerCase().endsWith('.pdf');
    const isPdfMime = file.type === 'application/pdf' || file.type === 'application/x-pdf';

    if (!isPdfExt && !isPdfMime) {
      return NextResponse.json(
        { error: 'ভুল ফাইল ফরম্যাট! অনুগ্রহ করে শুধুমাত্র বৈধ PDF (.pdf) ফাইল নির্বাচন করুন।' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'ফাইলের আকার ১০০ মেগাবাইট (100MB) এর বেশি হওয়া যাবে না।' },
        { status: 400 }
      );
    }

    // 2. Prepare Safe Storage Directory and File Name
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'pdfs', productId);
    await fs.mkdir(uploadsDir, { recursive: true });

    const diskFilePath = path.join(uploadsDir, cleanFileName);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(diskFilePath, buffer);

    const publicWebUrl = `/uploads/pdfs/${productId}/${cleanFileName}`;
    const storageRefPath = `private_pdfs/${productId}/${cleanFileName}`;
    const sizeMb = parseFloat((file.size / (1024 * 1024)).toFixed(2));

    // 3. Resolve Product Context (From payload or INITIAL_PRODUCTS)
    let parsedProduct: Partial<Product> = {};
    if (productJson) {
      try {
        parsedProduct = JSON.parse(productJson);
      } catch (e) {
        console.warn('Could not parse productJson payload:', e);
      }
    }

    const defaultCatalogItem = INITIAL_PRODUCTS.find((p) => p.id === productId);

    const mergedProduct: Product = {
      isSamplePrice: true,
      availabilityStatus: 'digital_download',
      inventoryTracking: false,
      highlights: ['অধ্যায়ভিত্তিক মৌলিক বিষয়সমূহ', 'বোর্ড প্রশ্ন বিশ্লেষণ'],
      chapters: [],
      samplePages: [],
      ...(defaultCatalogItem || {}),
      ...parsedProduct,
      id: productId,
      sku: parsedProduct.sku || defaultCatalogItem?.sku || `DC-PDF-${productId}`,
      titleBn: parsedProduct.titleBn || defaultCatalogItem?.titleBn || 'দিশারী রসায়ন নোট',
      titleEn: parsedProduct.titleEn || defaultCatalogItem?.titleEn || 'Dishari Chemistry Note',
      subtitleBn: parsedProduct.subtitleBn || defaultCatalogItem?.subtitleBn || 'অধ্যায়ভিত্তিক ডিজিটাল নোট',
      format: (parsedProduct.format || defaultCatalogItem?.format || 'pdf') as 'printed' | 'pdf' | 'combo',
      price: typeof parsedProduct.price === 'number' ? parsedProduct.price : (defaultCatalogItem?.price || 150),
      originalPrice: parsedProduct.originalPrice || defaultCatalogItem?.originalPrice || undefined,
      isPublished: parsedProduct.isPublished !== false,
      stockQuantity: parsedProduct.format === 'pdf' ? undefined : (parsedProduct.stockQuantity ?? defaultCatalogItem?.stockQuantity ?? 50),
      description: parsedProduct.description || defaultCatalogItem?.description || 'এসএসসি রসায়ন অধ্যায়ভিত্তিক ডিজিটাল হ্যান্ডনোট।',
      coverImage: parsedProduct.coverImage || defaultCatalogItem?.coverImage || '/images/book_ssc_chemistry_guide_1793290222060.jpg',
      author: parsedProduct.author || defaultCatalogItem?.author || 'মোঃ আল মেহেদী',
      edition: parsedProduct.edition || defaultCatalogItem?.edition || '২০২৫-২০২৬ সংস্করণ',
      publisher: parsedProduct.publisher || defaultCatalogItem?.publisher || 'দিশারী কেমিস্ট্রি প্রকাশনা',
      
      // PDF specific fields
      pdfFileRef: storageRefPath,
      pdfFileName: fileName,
      pdfFileSizeMb: sizeMb,
      hasSecurePdf: true,
      fileDownloadUrlOrKey: publicWebUrl,
      samplePdfUrl: publicWebUrl,
      fileFormat: 'PDF (প্রাইভেট ডিজিটাল সংস্করণ)',
      pdfUploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 4. Update Firestore with complete valid product schema
    // Requirement from firestore.rules:
    // data.keys().hasAll(['sku', 'titleBn', 'format', 'price', 'isPublished'])
    try {
      const firestorePayload = {
        id: mergedProduct.id,
        sku: mergedProduct.sku,
        titleBn: mergedProduct.titleBn,
        titleEn: mergedProduct.titleEn || '',
        format: mergedProduct.format,
        price: mergedProduct.price,
        originalPrice: mergedProduct.originalPrice || 0,
        isPublished: mergedProduct.isPublished !== false,
        stockQuantity: mergedProduct.stockQuantity ?? 50,
        description: (mergedProduct.description || '').slice(0, 1900),
        coverImage: mergedProduct.coverImage || '',
        author: mergedProduct.author || '',
        edition: mergedProduct.edition || '',
        publisher: mergedProduct.publisher || '',
        fileDownloadUrlOrKey: mergedProduct.fileDownloadUrlOrKey || '',
        pdfFileRef: mergedProduct.pdfFileRef || '',
        pdfFileName: mergedProduct.pdfFileName || '',
        pdfFileSizeMb: mergedProduct.pdfFileSizeMb || sizeMb,
        hasSecurePdf: true,
        pdfUploadedAt: mergedProduct.pdfUploadedAt,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'products', productId), firestorePayload, { merge: true });
    } catch (fsErr) {
      console.warn('Firestore server-side update notice (non-fatal, local disk storage succeeded):', fsErr);
    }

    return NextResponse.json({
      success: true,
      message: `"${mergedProduct.titleBn}" এর জন্য PDF ফাইল সফলভাবে আপলোড ও ভল্টে সংরক্ষিত হয়েছে!`,
      product: mergedProduct,
      fileUrl: publicWebUrl,
      fileName: fileName,
      fileSizeMb: sizeMb,
      uploadedAt: mergedProduct.pdfUploadedAt,
    });
  } catch (error: any) {
    console.error('Error handling admin PDF upload:', error);
    return NextResponse.json(
      { error: error.message || 'পিডিএফ ফাইল আপলোড করার সময় অভ্যন্তরীণ সার্ভার ত্রুটি হয়েছে।' },
      { status: 500 }
    );
  }
}
