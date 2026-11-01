import type { Metadata, Viewport } from 'next';
import { Hind_Siliguri, Outfit } from 'next/font/google';
import './globals.css';

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-bengali',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'দিশারী কেমিস্ট্রি | Dishari Chemistry - SSC Chemistry Books & Notes',
  description: 'দিশারী কেমিস্ট্রি - এসএসসি রসায়ন বিষয়ের মুদ্রিত বই ও ডিজিটাল পিডিএফ হ্যান্ডনোটের প্ল্যাটফর্ম। সহজ বাংলায় রসায়নের বিভিন্ন অধ্যায়ের স্পষ্ট ধারণা ও প্রস্তুতি সহায়িকা।',
  openGraph: {
    title: 'দিশারী কেমিস্ট্রি | Dishari Chemistry',
    description: 'এসএসসি রসায়ন বিষয়ের মুদ্রিত বই ও ডিজিটাল পিডিএফ হ্যান্ডনোট।',
    type: 'website',
    locale: 'bn_BD',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'দিশারী কেমিস্ট্রি | Dishari Chemistry',
    description: 'এসএসসি রসায়ন বিষয়ের মুদ্রিত বই ও ডিজিটাল পিডিএফ হ্যান্ডনোট।',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f2b48',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className={`${hindSiliguri.variable} ${outfit.variable} scroll-smooth`}>
      <body className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-cyan-500 selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

