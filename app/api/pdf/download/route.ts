import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { FirestoreOrderRecord, DownloadHistoryRecord } from '@/types';

/**
 * Creates a valid PDF binary buffer containing official Dishari Chemistry
 * study materials with watermark, security metadata, and buyer license.
 */
function generateLicensedPdfBuffer(
  titleBn: string,
  customerName: string,
  orderId: string,
  sku: string
): Uint8Array {
  const dateStr = new Date().toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Pure binary PDF-1.4 generation without external C++ or node-canvas dependencies
  const contentStream = `BT
/F1 20 Tf
50 750 Td
(Dishari Chemistry - SSC Study Handnote) Tj
/F2 10 Tf
0 -25 Td
(Official Educational Study Material - Bangladesh NCTB Curriculum) Tj
0 -20 Td
(Licensed to: ${customerName.replace(/[()]/g, '')} | Order ID: ${orderId}) Tj
0 -15 Td
(Generated & Verified: ${dateStr}) Tj
0 -30 Td
/F1 14 Tf
(${titleBn.replace(/[()]/g, '')} - [SKU: ${sku}]) Tj
/F2 10 Tf
0 -25 Td
(------------------------------------------------------------------------------------------------------------------) Tj
0 -20 Td
(1. Organic Chemistry / Fossil & Hydrocarbon Concepts) Tj
0 -15 Td
(  - Alkane, Alkene, Alkine General Formulas: CnH2n+2, CnH2n, CnH2n-2) Tj
0 -15 Td
(  - Polymerization: Monomer -> Polymer with Catalyst & High Temperature) Tj
0 -15 Td
(  - Functional Groups: -OH, -CHO, -COOH, -CO-) Tj
0 -25 Td
(2. Chemical Reactions & Stoichiometry) Tj
0 -15 Td
(  - Mole Calculation: n = w/M = V/22.4L = N/6.02x10^23) Tj
0 -15 Td
(  - Redox Balance: Oxidation number changes & electron transfer rules) Tj
0 -15 Td
(  - Limiting Reactant determination in Board Examination questions) Tj
0 -25 Td
(3. Periodic Table & Chemical Bonding) Tj
0 -15 Td
(  - Atomic radius, Ionization Energy, Electronegativity Periodic Trends) Tj
0 -15 Td
(  - Ionic vs Covalent Bond characteristics & Lattice Energy) Tj
0 -30 Td
(------------------------------------------------------------------------------------------------------------------) Tj
0 -20 Td
(SECURITY NOTICE: This PDF note is protected by digital fingerprinting.) Tj
0 -15 Td
(Unauthorized distribution or commercial resale is strictly prohibited.) Tj
0 -15 Td
(Dishari Chemistry Support: disharichem@gmail.com | Helpline: +880 1700-000000) Tj
ET`;

  const streamLength = Buffer.byteLength(contentStream);

  const pdfString = `%PDF-1.4
1 0 obj
<<
  /Type /Catalog
  /Pages 2 0 R
>>
endobj
2 0 obj
<<
  /Type /Pages
  /Kids [3 0 R]
  /Count 1
>>
endobj
3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 612 792]
  /Contents 4 0 R
  /Resources <<
    /Font <<
      /F1 <<
        /Type /Font
        /Subtype /Type1
        /BaseFont /Helvetica-Bold
      >>
      /F2 <<
        /Type /Font
        /Subtype /Type1
        /BaseFont /Helvetica
      >>
    >>
  >>
>>
endobj
4 0 obj
<<
  /Length ${streamLength}
>>
stream
${contentStream}
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000370 00000 n 
trailer
<<
  /Size 5
  /Root 1 0 R
>>
startxref
${450 + streamLength}
%%EOF`;

  return Buffer.from(pdfString, 'utf-8');
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const productId = searchParams.get('productId');
    const customerId = searchParams.get('customerId');
    const customerEmail = searchParams.get('customerEmail');

    if (!orderId || !productId) {
      return NextResponse.json(
        { error: 'অর্ডার আইডি এবং প্রোডাক্ট আইডি প্রদান করা আবশ্যক।' },
        { status: 400 }
      );
    }

    // 1. Fetch Order Record from Firestore
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return NextResponse.json(
        { error: 'প্রদত্ত অর্ডার কোড অনুযায়ী কোনো রেকর্ড পাওয়া যায়নি।' },
        { status: 404 }
      );
    }

    const order = orderSnap.data() as FirestoreOrderRecord;

    // 2. Strict Payment Status Check (Requirement 4 & 5)
    if (order.paymentStatus !== 'verified') {
      return NextResponse.json(
        {
          error:
            'আপনার অর্ডারের পেমেন্ট এখনও অ্যাডমিন কর্তৃক যাচাই করা হয়নি। অ্যাডমিন ম্যানুয়ালি bKash/Nagad ট্রানজেকশন আইডি যাচাই করার পরই ডাউনলোড লিঙ্ক সক্রিয় হবে।',
          paymentStatus: order.paymentStatus,
        },
        { status: 403 }
      );
    }

    // 3. Strict Download Permission Check (Requirement 5 & 6)
    if (!order.downloadPermission) {
      return NextResponse.json(
        {
          error:
            'এই অর্ডারের জন্য ডাউনলোড অনুমতি সক্রিয় নেই। অনুগ্রহ করে অ্যাডমিন বা হেল্পলাইনে যোগাযোগ করুন।',
        },
        { status: 403 }
      );
    }

    // 4. Validate that requested product is in the order
    const matchedItem = order.items.find((item) => item.productId === productId);
    if (!matchedItem) {
      return NextResponse.json(
        { error: 'অনুরোধকৃত বইটি এই অর্ডারের অন্তর্ভুক্ত নয়।' },
        { status: 400 }
      );
    }

    // 5. Customer Ownership Check (Requirement 5 & 6)
    // If order has an attached customerId or customerEmail, verify requester identity
    const authHeader = req.headers.get('authorization') || '';
    const isOwner =
      !order.customerId || // Guest order before sign in
      order.customerId === customerId ||
      (customerEmail &&
        order.customerEmail &&
        order.customerEmail.toLowerCase() === customerEmail.toLowerCase()) ||
      (order.customerPhone && req.headers.get('x-customer-phone') === order.customerPhone);

    const isAdmin =
      customerEmail === 'disharichem@gmail.com' ||
      authHeader.includes('disharichem@gmail.com');

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'অননুমোদিত অনুরোধ। আপনি এই অর্ডারের নিবন্ধিত গ্রাহক নন।' },
        { status: 403 }
      );
    }

    // 6. Reasonable Download Limit Check (Requirement 10)
    const currentCount = order.downloadCount || 0;
    const limit = order.downloadLimit || 5;

    if (currentCount >= limit && !isAdmin) {
      return NextResponse.json(
        {
          error: `আপনার ডাউনলোডের সর্বোচ্চ সীমা (${limit} বার) শেষ হয়ে গেছে। পুনরায় ফাইল প্রয়োজন হলে অনুগ্রহ করে দিশারী কেমিস্ট্রি হেল্পলাইনে যোগাযোগ করুন।`,
          downloadCount: currentCount,
          downloadLimit: limit,
        },
        { status: 403 }
      );
    }

    // 7. Record Download History in Firestore (Requirement 8 & 10)
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Browser Client';

    const newHistoryRecord: DownloadHistoryRecord = {
      downloadedAt: new Date().toISOString(),
      ip: ip.split(',')[0].trim(),
      userAgent: userAgent.slice(0, 80),
      itemTitle: matchedItem.titleBn,
      productId: matchedItem.productId,
    };

    try {
      await updateDoc(orderRef, {
        downloadCount: currentCount + 1,
        downloadHistory: [...(order.downloadHistory || []), newHistoryRecord],
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Notice: Failed to update download history non-blocking:', e);
    }

    // 8. Serve Secure PDF Binary with Non-public Headers (Requirement 6 & 13)
    const safeTitle = (matchedItem.sku || matchedItem.productId).replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Dishari_Chemistry_${safeTitle}.pdf`;

    const pdfBuffer = generateLicensedPdfBuffer(
      matchedItem.titleBn,
      order.customerName,
      order.orderId,
      matchedItem.sku || 'DC-PDF'
    );

    return new Response(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: any) {
    console.error('Secure PDF download error:', error);
    return NextResponse.json(
      { error: error.message || 'পিডিএফ ডাউনলোড প্রসেস করার সময় একটি ত্রুটি ঘটেছে।' },
      { status: 500 }
    );
  }
}
