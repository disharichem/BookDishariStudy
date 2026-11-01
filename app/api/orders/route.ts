import { NextRequest, NextResponse } from 'next/server';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { INITIAL_PRODUCTS } from '@/data/products';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      items,
      customerName,
      customerPhone,
      customerEmail,
      deliveryZone,
      district,
      fullAddress,
      paymentMethod,
      transactionId,
      senderPhone,
    } = body;

    // 1. Validate Customer Name
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      return NextResponse.json(
        { error: 'গ্রাহকের সঠিক নাম প্রদান করুন (কমপক্ষে ২ অক্ষর)।' },
        { status: 400 }
      );
    }

    // 2. Validate Bangladeshi Mobile Phone (01XXXXXXXXX)
    const cleanedPhone = (customerPhone || '').toString().trim().replace(/[\s-]/g, '');
    const bdPhoneRegex = /^01[3-9]\d{8}$/;
    if (!cleanedPhone || !bdPhoneRegex.test(cleanedPhone)) {
      return NextResponse.json(
        { error: '১১ ডিজিটের সঠিক মোবাইল নম্বর প্রদান করুন (যেমন: 017XXXXXXXX)।' },
        { status: 400 }
      );
    }

    // 3. Validate Cart Items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'অর্ডারের জন্য কমপক্ষে একটি বই বা পিডিএফ নির্বাচন করুন।' },
        { status: 400 }
      );
    }

    // 4. Server-Authoritative Price Calculation (Trust NO client-submitted totals)
    let calculatedSubtotal = 0;
    let hasPrinted = false;
    let hasPdf = false;
    const validatedItems = [];

    for (const item of items) {
      const trustedProduct = INITIAL_PRODUCTS.find((p) => p.id === item.productId);
      if (!trustedProduct) {
        return NextResponse.json(
          { error: `পণ্যটির তথ্য পাওয়া যায়নি (ID: ${item.productId})।` },
          { status: 400 }
        );
      }

      const quantity = Math.max(1, Math.min(50, Math.floor(Number(item.quantity) || 1)));
      const itemTotal = trustedProduct.price * quantity;
      calculatedSubtotal += itemTotal;

      if (trustedProduct.format === 'printed' || trustedProduct.format === 'combo') {
        hasPrinted = true;
      }
      if (trustedProduct.format === 'pdf' || trustedProduct.format === 'combo') {
        hasPdf = true;
      }

      const isDigitalItem = trustedProduct.format === 'pdf' || trustedProduct.format === 'combo';
      validatedItems.push({
        productId: trustedProduct.id,
        titleBn: trustedProduct.titleBn,
        format: trustedProduct.format,
        unitPrice: trustedProduct.price,
        quantity,
        totalPrice: itemTotal,
        sku: trustedProduct.sku || 'DC-SKU',
        ...(isDigitalItem
          ? {
              pdfFileRef: trustedProduct.pdfFileRef || `private_pdfs/${trustedProduct.id}/${trustedProduct.sku || 'notes'}.pdf`,
              pdfFileName: trustedProduct.pdfFileName || `${trustedProduct.titleEn || 'dishari_notes'}.pdf`,
            }
          : {}),
      });
    }

    // 5. Format-Specific Field Validations
    if (hasPrinted) {
      if (!district || typeof district !== 'string' || district.trim().length < 2) {
        return NextResponse.json(
          { error: 'মুদ্রিত বই ডেলিভারির জন্য জেলা নির্বাচন করুন।' },
          { status: 400 }
        );
      }
      if (!fullAddress || typeof fullAddress !== 'string' || fullAddress.trim().length < 5) {
        return NextResponse.json(
          { error: 'মুদ্রিত বই কুরিয়ারে পাঠানোর জন্য বিস্তারিত ঠিকানা লিখুন।' },
          { status: 400 }
        );
      }
    }

    if (hasPdf) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!customerEmail || !emailRegex.test(customerEmail.trim())) {
        return NextResponse.json(
          { error: 'ডিজিটাল পিডিএফ এক্সেসের জন্য সঠিক ইমেইল ঠিকানা প্রদান করুন।' },
          { status: 400 }
        );
      }
    }

    // 6. Calculate Delivery Fee strictly based on server rules
    let deliveryFee = 0;
    if (hasPrinted) {
      deliveryFee = deliveryZone === 'outside_dhaka' ? 110 : 60;
    } else {
      deliveryFee = 0; // 100% digital PDF orders have no courier fee
    }

    const calculatedTotal = calculatedSubtotal + deliveryFee;

    // 7. Validate Payment Method and Set Initial Statuses
    const validMethods = ['cod', 'bkash', 'nagad'];
    const chosenMethod = validMethods.includes(paymentMethod) ? paymentMethod : hasPrinted ? 'cod' : 'bkash';

    // Per Requirement 4, 5, 8: All digital orders start with pending verification & false downloadPermission
    const paymentStatus = 'pending_verification';
    const orderStatus = 'received';

    const orderType = hasPrinted && hasPdf ? 'mixed' : hasPrinted ? 'printed' : 'pdf';
    const orderYear = new Date().getFullYear();
    const orderRandom = Math.floor(1000 + Math.random() * 9000);
    const orderId = `DC-${orderYear}-${orderRandom}`;

    const orderRecord = {
      orderId,
      customerId: body.customerId ? String(body.customerId).trim() : '',
      customerName: customerName.trim(),
      customerPhone: cleanedPhone,
      customerEmail: customerEmail ? customerEmail.trim() : '',
      orderType,
      items: validatedItems,
      subtotal: calculatedSubtotal,
      deliveryFee,
      total: calculatedTotal,
      deliveryZone: deliveryZone || (hasPrinted ? 'inside_dhaka' : ''),
      deliveryAddress: fullAddress ? fullAddress.trim() : '',
      district: district ? district.trim() : '',
      paymentMethod: chosenMethod,
      paymentStatus,
      orderStatus,
      downloadPermission: false, // Strictly granted ONLY after manual admin verification
      downloadCount: 0,
      downloadLimit: 5, // Reasonable default limit of 5 downloads per order
      downloadHistory: [],
      transactionId: transactionId ? transactionId.trim() : '',
      senderPhone: senderPhone ? senderPhone.trim() : cleanedPhone,
      isDemoSimulation: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 8. Write persistently to Firestore
    try {
      await setDoc(doc(db, 'orders', orderId), orderRecord);
    } catch (dbError) {
      console.error('Failed to write order to Firestore:', dbError);
      handleFirestoreError(dbError, OperationType.CREATE, `orders/${orderId}`);
    }

    return NextResponse.json({
      success: true,
      order: orderRecord,
      message: 'অর্ডারটি সফলভাবে ফায়ারস্টোর ডাটাবেজে সংরক্ষিত হয়েছে।',
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      {
        error: error.message || 'অর্ডার প্রসেস করার সময় একটি সমস্যা দেখা দিয়েছে।',
      },
      { status: 500 }
    );
  }
}
