import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-900 text-center">
      <div className="max-w-md space-y-4">
        <h2 className="text-4xl font-extrabold text-cyan-800">৪০৪</h2>
        <h3 className="text-xl font-bold text-slate-800">পৃষ্ঠাটি পাওয়া যায়নি</h3>
        <p className="text-sm text-slate-600">
          আপনি যে পৃষ্ঠাটি খুঁজছেন তা স্থানান্তরিত হয়েছে অথবা মুছে ফেলা হয়েছে।
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            মূল পাতায় ফিরে যান
          </Link>
        </div>
      </div>
    </div>
  );
}
