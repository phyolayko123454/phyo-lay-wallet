import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'my';

interface Translations {
  [key: string]: {
    en: string;
    my: string;
  };
}

const translations: Translations = {
  // Navigation
  home: { en: 'Home', my: 'ပင်မ' },
  topUp: { en: 'Top-up', my: 'ဖုန်းဘေလ်' },
  wallet: { en: 'Wallet', my: 'ပိုက်ဆံအိတ်' },
  history: { en: 'History', my: 'မှတ်တမ်း' },
  profile: { en: 'Profile', my: 'ပရိုဖိုင်' },
  admin: { en: 'Admin', my: 'စီမံခန့်ခွဲသူ' },
  login: { en: 'Login', my: 'ဝင်ရောက်ရန်' },
  register: { en: 'Register', my: 'စာရင်းသွင်းရန်' },
  logout: { en: 'Logout', my: 'ထွက်ရန်' },
  
  // Hero section
  heroTitle: { en: 'PHYO LAY Top-up', my: 'PHYO LAY ဖုန်းဘေလ်' },
  heroSubtitle: { en: 'Premium Mobile & Game Top-up Service', my: 'အဆင့်မြင့် ဖုန်းနှင့် ဂိမ်းငွေဖြည့်ဝန်ဆောင်မှု' },
  heroDescription: { en: 'Fast, secure, and reliable top-up for Myanmar & Thai mobile, games, and gift cards.', my: 'မြန်မာနှင့် ထိုင်းဖုန်း၊ ဂိမ်းများနှင့် လက်ဆောင်ကတ်များအတွက် မြန်ဆန်၊ လုံခြုံ၊ ယုံကြည်စိတ်ချရသော ငွေဖြည့်ဝန်ဆောင်မှု။' },
  getStarted: { en: 'Get Started', my: 'စတင်ရန်' },
  
  // Categories
  myanmarMobile: { en: 'Myanmar Mobile', my: 'မြန်မာ ဖုန်း' },
  thaiMobile: { en: 'Thai Mobile', my: 'ထိုင်း ဖုန်း' },
  gameTopUp: { en: 'Game Top-up', my: 'ဂိမ်းငွေဖြည့်' },
  giftCards: { en: 'Gift Cards', my: 'လက်ဆောင်ကတ်' },
  walletExchange: { en: 'Wallet Exchange', my: 'ငွေလဲလှယ်ခြင်း' },
  
  // Wallet
  balance: { en: 'Balance', my: 'လက်ကျန်ငွေ' },
  deposit: { en: 'Deposit', my: 'ငွေသွင်း' },
  withdraw: { en: 'Withdraw', my: 'ငွေထုတ်' },
  addMoney: { en: 'Add Money', my: 'ငွေထည့်ရန်' },
  uploadReceipt: { en: 'Upload Receipt', my: 'ပြေစာတင်ရန်' },
  
  // Status
  pending: { en: 'Pending', my: 'စောင့်ဆိုင်းဆဲ' },
  approved: { en: 'Approved', my: 'အတည်ပြုပြီး' },
  rejected: { en: 'Rejected', my: 'ပယ်ချပြီး' },
  completed: { en: 'Completed', my: 'ပြီးဆုံးပြီး' },
  processing: { en: 'Processing', my: 'ဆောင်ရွက်နေဆဲ' },
  
  // Common
  amount: { en: 'Amount', my: 'ပမာဏ' },
  phone: { en: 'Phone Number', my: 'ဖုန်းနံပါတ်' },
  submit: { en: 'Submit', my: 'တင်သွင်းရန်' },
  cancel: { en: 'Cancel', my: 'ပယ်ဖျက်ရန်' },
  confirm: { en: 'Confirm', my: 'အတည်ပြုရန်' },
  save: { en: 'Save', my: 'သိမ်းဆည်းရန်' },
  edit: { en: 'Edit', my: 'ပြင်ဆင်ရန်' },
  delete: { en: 'Delete', my: 'ဖျက်ရန်' },
  search: { en: 'Search', my: 'ရှာဖွေရန်' },
  loading: { en: 'Loading...', my: 'ခေတ္တစောင့်ပါ...' },
  noData: { en: 'No data available', my: 'ဒေတာမရှိပါ' },
  
  // Auth
  username: { en: 'Username', my: 'အသုံးပြုသူအမည်' },
  password: { en: 'Password', my: 'စကားဝှက်' },
  confirmPassword: { en: 'Confirm Password', my: 'စကားဝှက်အတည်ပြုရန်' },
  email: { en: 'Email', my: 'အီးမေးလ်' },
  forgotPassword: { en: 'Forgot Password?', my: 'စကားဝှက်မေ့နေလား?' },
  dontHaveAccount: { en: "Don't have an account?", my: 'အကောင့်မရှိသေးဘူးလား?' },
  alreadyHaveAccount: { en: 'Already have an account?', my: 'အကောင့်ရှိပြီးသားလား?' },
  
  // Admin
  exchangeRate: { en: 'Exchange Rate', my: 'ငွေလဲနှုန်း' },
  thbToMmk: { en: 'THB to MMK', my: 'ဘတ်မှ ကျပ်' },
  categories: { en: 'Categories', my: 'အမျိုးအစားများ' },
  orders: { en: 'Orders', my: 'အော်ဒါများ' },
  deposits: { en: 'Deposits', my: 'ငွေသွင်းများ' },
  users: { en: 'Users', my: 'အသုံးပြုသူများ' },
  approve: { en: 'Approve', my: 'အတည်ပြုရန်' },
  reject: { en: 'Reject', my: 'ပယ်ချရန်' },
  
  // Payment
  paymentMethods: { en: 'Payment Methods', my: 'ငွေပေးချေနည်းများ' },
  trueMoney: { en: 'True Money', my: 'True Money' },
  kpay: { en: 'KPay', my: 'KPay' },
  wavePay: { en: 'Wave Pay', my: 'Wave Pay' },
  scanQR: { en: 'Scan QR Code', my: 'QR ကုဒ်ဖတ်ပါ' },
  
  // Messages
  successMessage: { en: 'Operation successful!', my: 'အောင်မြင်စွာ ဆောင်ရွက်ပြီးပါပြီ!' },
  errorMessage: { en: 'Something went wrong. Please try again.', my: 'တစ်ခုခု မှားသွားပါပြီ။ ထပ်စမ်းကြည့်ပါ။' },
  loginSuccess: { en: 'Login successful!', my: 'ဝင်ရောက်မှု အောင်မြင်ပါသည်!' },
  registerSuccess: { en: 'Registration successful!', my: 'စာရင်းသွင်းမှု အောင်မြင်ပါသည်!' },
  
  // Footer
  copyright: { en: '© 2024 PHYO LAY Top-up. All rights reserved.', my: '© ၂၀၂၄ PHYO LAY ဖုန်းဘေလ်။ မူပိုင်ခွင့်အားလုံး ပိုင်ဆိုင်သည်။' },
  termsOfService: { en: 'Terms of Service', my: 'ဝန်ဆောင်မှု စည်းကမ်းချက်များ' },
  privacyPolicy: { en: 'Privacy Policy', my: 'ကိုယ်ရေးအချက်အလက် မူဝါဒ' },
  contactUs: { en: 'Contact Us', my: 'ဆက်သွယ်ရန်' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'my')) {
      setLanguage(savedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language] || translation.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
