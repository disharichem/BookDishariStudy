# দিশারী কেমিস্ট্রি - Netlify পাবলিশ ও ডিপ্লয়মেন্ট গাইড 🚀

এই প্রজেক্টটি Next.js 15 (App Router), Firebase এবং Tailwind CSS দিয়ে তৈরি। Netlify-তে সফলভাবে পাবলিশ (Deploy) করার জন্য প্রয়োজনীয় কনফিগারেশন (`netlify.toml` এবং `@netlify/plugin-nextjs`) ইতোমধ্যে যুক্ত করা হয়েছে।

---

## পদ্ধতি ১: GitHub-এর মাধ্যমে Netlify-তে ডিপ্লয় (সবচেয়ে সহজ ও অটোমেটেড)

১. **GitHub-এ রিপোজিটরি তৈরি ও পুশ করুন**:
   - আপনার এই প্রজেক্টের কোড GitHub-এ একটি নতুন রিপোজিটরিতে (Public বা Private) পুশ করুন।

২. **Netlify-তে লগইন করুন**:
   - [netlify.com](https://www.netlify.com/)-এ যান এবং আপনার GitHub একাউন্ট দিয়ে **Sign In / Log In** করুন।

৩. **নতুন সাইট ইমপোর্ট করুন**:
   - Netlify Dashboard থেকে **"Add new site"** > **"Import an existing project"** বাটনে ক্লিক করুন।
   - **GitHub** সিলেক্ট করুন এবং আপনার রিপোজিটরিটি সিলেক্ট করুন।

৪. **বিল্ড সেটিংস যাচাই করুন** (অটোমেটিক ডিটেক্ট হবে):
   - **Base directory**: খালি রাখুন (অথবা `/`)
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - Netlify স্বয়ংক্রিয়ভাবে `netlify.toml` ফাইলটি রিড করবে এবং `@netlify/plugin-nextjs` প্লাগিন লোড করবে।

৫. **Environment Variables (এনভায়রনমেন্ট ভ্যারিয়েবল) সেট করুন**:
   - **Site configuration** > **Environment variables** সেকশনে যান।
   - `GEMINI_API_KEY`: আপনার জেমিনি এপিআই কি (প্রযোজ্য ক্ষেত্রে)।
   - `APP_URL`: আপনার Netlify সাইটের URL (যেমন: `https://your-site.netlify.app`)।

৬. **Deploy বাটন চাপুন**:
   - **"Deploy site"** বাটনে ক্লিক করলেই ২-৩ মিনিটের মধ্যে আপনার সাইট লাইভ হয়ে যাবে! 🎉

---

## পদ্ধতি ২: Netlify CLI ব্যবহার করে সরাসরি টার্মিনাল থেকে ডিপ্লয়

যদি GitHub ছাড়াও সরাসরি টার্মিনাল থেকে ডিপ্লয় করতে চান:

```bash
# ১. গ্লোবাল Netlify CLI ইন্সটল করুন
npm install -g netlify-cli

# ২. Netlify-তে লগইন করুন
netlify login

# ৩. বিল্ড তৈরি করুন
npm run build

# ৪. লাইভ প্রোডাকশনে ডিপ্লয় করুন
netlify deploy --prod
```

---

## গুরুত্বপূর্ণ শেষ ধাপ: Firebase-এ Netlify ডোমেইন যুক্ত করা

যেহেতু সাইটটিতে Firebase Authentication এবং Firestore ডেটাবেজ রয়েছে, তাই Netlify-তে ডিপ্লয় করার পর:

১. [Firebase Console](https://console.firebase.google.com/)-এ যান।
২. আপনার প্রজেক্ট (`gen-lang-client-0258057042`) সিলেক্ট করুন।
৩. বামের মেনু থেকে **Authentication** > **Settings** > **Authorized domains**-এ যান।
৪. **"Add domain"** বাটনে ক্লিক করে আপনার Netlify ডোমেইনটি (যেমন: `your-site-name.netlify.app` বা আপনার নিজস্ব কাস্টম ডোমেইন) যুক্ত করুন।

ব্যাস! আপনার পুরো ই-কমার্স ও স্টাডি প্ল্যাটফর্ম Netlify-তে সম্পূর্ণ সুরক্ষিত ও লাইভ চলবে।
