import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_PRODUCTS } from '@/data/products';

/**
 * Builds a valid, multi-page (3-page) standard PDF-1.4 binary
 * with exact cross-reference (xref) table offsets.
 * Designed specifically for instant client-side preview in react-pdf.
 */
function createThreePageSamplePdf(productId: string, title?: string, sku?: string): Uint8Array {
  const product = INITIAL_PRODUCTS.find((p) => p.id === productId);
  const bookTitle = title || product?.titleBn || 'SSC Chemistry Comprehensive Notes';
  const bookSku = sku || product?.sku || 'DC-CHEM-SAMPLE';
  const pagesTotal = product?.pages || 96;

  // Clean ASCII for PDF stream text
  const cleanTitle = bookTitle.replace(/[^\x20-\x7E]/g, ' ');
  const dateStr = new Date().toISOString().split('T')[0];

  // PAGE 1: Title, Verification, Chapter 1 Overview
  const stream1 = `BT
/F1 18 Tf
50 740 Td
(DISHARI CHEMISTRY - OFFICIAL 3-PAGE SAMPLE PREVIEW) Tj
/F2 10 Tf
0 -22 Td
(Verified Student Preview - SSC Chemistry NCTB Curriculum) Tj
0 -16 Td
(Date: ${dateStr} | SKU: ${bookSku} | Total Book Pages: ${pagesTotal} Pages) Tj
/F1 13 Tf
0 -30 Td
(${cleanTitle.substring(0, 55)}) Tj
/F2 10 Tf
0 -20 Td
(=============================================================================) Tj
/F1 12 Tf
0 -24 Td
([PAGE 1 OF 3] CHAPTER 1 & 2: FUNDAMENTALS OF CHEMISTRY) Tj
/F2 10 Tf
0 -18 Td
(1. Scope of Chemistry & Scientific Investigation Methods) Tj
0 -15 Td
(   - Matter states: Solid, Liquid, Gas - Kinetic Molecular Theory) Tj
0 -15 Td
(   - Diffusion & Effusion: Graham's Law & real laboratory examples) Tj
0 -15 Td
(   - Distillation, Sublimation & Melting/Boiling point analysis) Tj
0 -22 Td
(2. Atomic Structure & Subatomic Particles) Tj
0 -15 Td
(   - Rutherford Alpha Particle Scattering Experiment & Bohr Atomic Model) Tj
0 -15 Td
(   - Quantum Numbers: Principal (n), Azimuthal (l), Magnetic (m), Spin (s)) Tj
0 -15 Td
(   - Aufbau Principle: Order of orbital energy: 1s < 2s < 2p < 3s < 3p < 4s < 3d) Tj
0 -15 Td
(   - Exceptions in Electronic Configuration: Chromium (24) and Copper (29)) Tj
0 -22 Td
(/F3 10 Tf) Tj
(3. Electronic Configuration of Cr (24) & Cu (29)) Tj
0 -15 Td
(   Cr (24): 1s2 2s2 2p6 3s2 3p6 3d5 4s1  [Stable half-filled d-orbital]) Tj
0 -15 Td
(   Cu (29): 1s2 2s2 2p6 3s2 3p6 3d10 4s1 [Stable completely-filled d-orbital]) Tj
0 -26 Td
/F2 9 Tf
(-----------------------------------------------------------------------------) Tj
0 -14 Td
(* Dishari Chemistry Quality Assurance: Verified for SSC & HSC Exam Preparation) Tj
0 -14 Td
(Page 1 of 3 - Sample Preview License | Next: Mole Calculation & Limiting Reactant) Tj
ET`;

  // PAGE 2: Mole Calculation & Chemical Reaction Analysis
  const stream2 = `BT
/F1 18 Tf
50 740 Td
(DISHARI CHEMISTRY - CHAPTER ANALYSIS & CORE FORMULAS) Tj
/F2 10 Tf
0 -22 Td
(Interactive Educational Guide - Page 2 of 3 Preview) Tj
0 -16 Td
(Course: SSC Chemistry | Chapter 6: Concept of Mole & Chemical Calculation) Tj
/F1 12 Tf
0 -30 Td
([PAGE 2 OF 3] ESSENTIAL EQUATIONS & PROBLEM-SOLVING TECHNIQUES) Tj
/F2 10 Tf
0 -20 Td
(=============================================================================) Tj
0 -18 Td
(1. Fundamental Mole Relationships:) Tj
0 -15 Td
(   Formula 1: n = W / M  (Mole = Given mass in grams / Molar mass in g/mol)) Tj
0 -15 Td
(   Formula 2: n = V / 22.4 L  (Mole = Volume of gas at STP in Liters / 22.4)) Tj
0 -15 Td
(   Formula 3: n = N / (6.023 x 10^23)  (Mole = Particle count / Avogadro's No)) Tj
0 -15 Td
(   Formula 4: S = n / V_L = (W x 1000) / (M x V_mL)  (Molarity calculation)) Tj
0 -24 Td
(2. Limiting Reactant Shortcut Technique:) Tj
0 -15 Td
(   Equation: 2H2 + O2 -> 2H2O) Tj
0 -15 Td
(   Rule: Divide the given mole of each reactant by its stoichiometric coefficient.) Tj
0 -15 Td
(   The reactant with the smallest quotient is the limiting reactant and) Tj
0 -15 Td
(   dictates the maximum product amount produced in the reaction.) Tj
0 -24 Td
(3. Chapter 7: Oxidation-Reduction (Redox) Simultaneous Occurrence) Tj
0 -15 Td
(   - Oxidation Half-Reaction: Zn -> Zn2+ + 2e-  (Electron Loss)) Tj
0 -15 Td
(   - Reduction Half-Reaction: Cu2+ + 2e- -> Cu  (Electron Gain)) Tj
0 -15 Td
(   - Overall Redox Reaction:  Zn + Cu2+ -> Zn2+ + Cu) Tj
0 -26 Td
/F2 9 Tf
(-----------------------------------------------------------------------------) Tj
0 -14 Td
(* Dishari Chemistry Quality Assurance: Clear Board-Standard Explanations) Tj
0 -14 Td
(Page 2 of 3 - Sample Preview License | Next: Organic Chemistry Conversions) Tj
ET`;

  // PAGE 3: Organic Chemistry, Hydrocarbons & Conversion Flowcharts
  const stream3 = `BT
/F1 18 Tf
50 740 Td
(DISHARI CHEMISTRY - ORGANIC CONVERSIONS & SUMMARY) Tj
/F2 10 Tf
0 -22 Td
(Final Sample Page - Student Quality Verification - Page 3 of 3) Tj
0 -16 Td
(Chapter 11: Mineral Resources: Fossils & Hydrocarbon Chemistry) Tj
/F1 12 Tf
0 -30 Td
([PAGE 3 OF 3] ORGANIC REACTION CONVERSION FLOWCHART) Tj
/F2 10 Tf
0 -20 Td
(=============================================================================) Tj
0 -18 Td
(1. Alkane, Alkene & Alkine Conversions:) Tj
0 -15 Td
(   Alkene (CH2=CH2) + Br2 (Red Solution in CCl4) -> CH2Br-CH2Br (Colorless)) Tj
0 -15 Td
(   * Unsaturation Test: Decolorization confirms double/triple bond presence.) Tj
0 -15 Td
(   Baeyer's Test: CH2=CH2 + [O] + H2O --(Alkaline KMnO4)--> Ethylene Glycol) Tj
0 -22 Td
(2. Step-by-Step Organic Oxidation Cascade:) Tj
0 -15 Td
(   Ethanol (CH3CH2OH) + [O] --(K2Cr2O7 + H2SO4)--> Ethanal (CH3CHO) + H2O) Tj
0 -15 Td
(   Ethanal (CH3CHO) + [O] --(K2Cr2O7 + H2SO4)--> Ethanoic Acid (CH3COOH)) Tj
0 -22 Td
(3. Addition Polymerization:) Tj
0 -15 Td
(   n(CH2=CH2) -----[200 deg C, 1000-1200 atm, O2 trace]-----> (-CH2-CH2-)n) Tj
0 -15 Td
(   Monomer: Ethene gas | Polymer: Polyethylene (Everyday Plastic)) Tj
0 -28 Td
/F1 11 Tf
(=============================================================================) Tj
0 -16 Td
(*** SAMPLE PREVIEW LIMIT REACHED: FIRST 3 PAGES CONCLUDED ***) Tj
/F2 9 Tf
0 -14 Td
(You have verified the first 3 pages of this study material.) Tj
0 -13 Td
(To access the full ${pagesTotal}-page comprehensive curriculum, complete chapter guides,) Tj
0 -13 Td
(solved board questions, and printable high-res charts, please order your copy now!) Tj
0 -18 Td
(Official Support: Dishari Chemistry | https://dishari-chemistry.edu) Tj
ET`;

  const len1 = Buffer.byteLength(stream1);
  const len2 = Buffer.byteLength(stream2);
  const len3 = Buffer.byteLength(stream3);

  // Object templates
  const obj1 = `1 0 obj\n<<\n  /Type /Catalog\n  /Pages 2 0 R\n>>\nendobj\n`;
  const obj2 = `2 0 obj\n<<\n  /Type /Pages\n  /Kids [3 0 R 4 0 R 5 0 R]\n  /Count 3\n>>\nendobj\n`;
  const obj3 = `3 0 obj\n<<\n  /Type /Page\n  /Parent 2 0 R\n  /MediaBox [0 0 612 792]\n  /Contents 6 0 R\n  /Resources <<\n    /Font <<\n      /F1 9 0 R\n      /F2 10 0 R\n      /F3 11 0 R\n    >>\n  >>\n>>\nendobj\n`;
  const obj4 = `4 0 obj\n<<\n  /Type /Page\n  /Parent 2 0 R\n  /MediaBox [0 0 612 792]\n  /Contents 7 0 R\n  /Resources <<\n    /Font <<\n      /F1 9 0 R\n      /F2 10 0 R\n      /F3 11 0 R\n    >>\n  >>\n>>\nendobj\n`;
  const obj5 = `5 0 obj\n<<\n  /Type /Page\n  /Parent 2 0 R\n  /MediaBox [0 0 612 792]\n  /Contents 8 0 R\n  /Resources <<\n    /Font <<\n      /F1 9 0 R\n      /F2 10 0 R\n      /F3 11 0 R\n    >>\n  >>\n>>\nendobj\n`;

  const obj6 = `6 0 obj\n<< /Length ${len1} >>\nstream\n${stream1}\nendstream\nendobj\n`;
  const obj7 = `7 0 obj\n<< /Length ${len2} >>\nstream\n${stream2}\nendstream\nendobj\n`;
  const obj8 = `8 0 obj\n<< /Length ${len3} >>\nstream\n${stream3}\nendstream\nendobj\n`;

  const obj9 = `9 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`;
  const obj10 = `10 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`;
  const obj11 = `11 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold >>\nendobj\n`;

  const header = `%PDF-1.4\n`;
  const objects = [obj1, obj2, obj3, obj4, obj5, obj6, obj7, obj8, obj9, obj10, obj11];

  let currentOffset = Buffer.byteLength(header);
  const offsets = [0]; // 0th entry is free

  for (const obj of objects) {
    offsets.push(currentOffset);
    currentOffset += Buffer.byteLength(obj);
  }

  const startxref = currentOffset;
  let xref = `xref\n0 ${offsets.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i++) {
    const pad = String(offsets[i]).padStart(10, '0');
    xref += `${pad} 00000 n \n`;
  }

  const trailer = `trailer\n<<\n  /Size ${offsets.length}\n  /Root 1 0 R\n>>\nstartxref\n${startxref}\n%%EOF\n`;

  const fullPdf = header + objects.join('') + xref + trailer;
  return Buffer.from(fullPdf, 'utf-8');
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('id') || searchParams.get('productId') || 'dishari-organic-chem-pdf';
    const title = searchParams.get('title') || undefined;
    const sku = searchParams.get('sku') || undefined;

    const pdfBuffer = createThreePageSamplePdf(productId, title, sku);

    return new Response(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="sample-${productId}-preview.pdf"`,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (error) {
    console.error('Error generating sample preview PDF:', error);
    return NextResponse.json(
      { error: 'নমুনা পিডিএফ প্রস্তুত করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
