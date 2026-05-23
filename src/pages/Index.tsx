import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Eye, EyeOff, Wallet as WalletIcon, History as HistoryIcon, Receipt,
  Calendar, Headphones, Pin, ArrowLeftRight, Flame, Gamepad2, Sparkles,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import pubgLogo from '@/assets/pubg-logo.png';
import mlbbLogo from '@/assets/mlbb-logo.png';

const categories = [
  { key: 'all', label: 'All', icon: Flame },
  { key: 'mobile', label: 'Mobile Games', icon: Gamepad2 },
  { key: 'pc', label: 'PC Games', icon: Sparkles },
];

const games = [
  { key: 'mlbb', name: 'Mobile Legend', tag: 'Diamonds', cat: 'mobile', logo: mlbbLogo },
  { key: 'pubg', name: 'PUBG Mobile', tag: 'UC', cat: 'mobile', logo: pubgLogo },
];

const Index: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [activeCat, setActiveCat] = useState('all');

  const { data: wallet } = useQuery({
    queryKey: ['wallet-home', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('wallets')
        .select('balance_mmk, balance_thb')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const mmk = wallet?.balance_mmk ?? 0;

  const filtered = activeCat === 'all' ? games : games.filter((g) => g.cat === activeCat);

  if (!user) {
    return (
      <Layout>
        <section className="container mx-auto px-4 pt-10 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto"
          >
            <h1 className="font-display text-4xl font-extrabold mb-4">
              <span className="neon-text">Top-Up</span> Center
            </h1>
            <p className="text-muted-foreground mb-8">
              {language === 'my' ? 'အကောင့်ဝင်ပြီး ဂိမ်းငွေဖြည့်ပါ' : 'Sign in to top-up your games'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="neon-gradient text-primary-foreground neon-glow">
                <Link to="/auth?mode=register">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary/40">
                <Link to="/auth">Login</Link>
              </Button>
            </div>
          </motion.div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 max-w-md md:max-w-3xl pt-3 pb-8 space-y-4">
        {/* Wallet card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl glass-strong p-4 border border-primary/30"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex flex-col items-center gap-1">
                <div className="w-9 h-6 rounded-sm overflow-hidden border border-white/20 flex flex-col">
                  <div className="flex-1 bg-yellow-400" />
                  <div className="flex-1 bg-green-600" />
                  <div className="flex-1 bg-red-600" />
                </div>
                <ArrowLeftRight className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground/90">သင့်ပိုက်ဆံအိတ်</span>
                  <button onClick={() => setShowBalance((v) => !v)} className="text-muted-foreground">
                    {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
                <p className="font-display text-2xl font-extrabold mt-1">
                  {showBalance ? mmk.toLocaleString() : '••••'}
                  <span className="text-sm font-semibold text-muted-foreground ml-1">ks</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/deposit')}
              className="flex flex-col items-center gap-1"
              aria-label="Deposit"
            >
              <div className="w-14 h-14 rounded-full neon-gradient neon-glow flex items-center justify-center">
                <WalletIcon className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-[11px] text-foreground/80">ငွေဖြည့်ရန်</span>
            </button>
          </div>

          {/* Two history buttons inside the same card */}
          <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-primary/20">
            <button
              onClick={() => navigate('/history')}
              className="flex items-center justify-center gap-2 h-11 rounded-xl bg-secondary/60 text-sm font-medium"
            >
              <HistoryIcon className="w-4 h-4 text-primary" />
              အော်ဒါမှတ်တမ်း
            </button>
            <button
              onClick={() => navigate('/wallet')}
              className="flex items-center justify-center gap-2 h-11 rounded-xl bg-secondary/60 text-sm font-medium"
            >
              <Receipt className="w-4 h-4 text-primary" />
              ငွေဖြည့် မှတ်တမ်း
            </button>
          </div>
        </motion.div>

        {/* Events / Support */}
        <div className="grid grid-cols-2 gap-3">
          <button className="glass rounded-2xl h-16 flex items-center justify-center gap-2 text-sm font-medium">
            <Calendar className="w-5 h-5 text-primary" />
            ပွဲသတင်းများ
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="glass rounded-2xl h-16 flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Headphones className="w-5 h-5 text-primary" />
            အကူအညီ
          </button>
        </div>

        {/* Marquee notice */}
        <div className="overflow-hidden">
          <div className="whitespace-nowrap animate-[marquee_22s_linear_infinite] text-warning text-sm font-medium">
            ⚠️ ငွေဖြည့်ချိန် မနက် 8 နာရီမှ ည 12 နာရီ ကြား ဖြစ်ပါတယ်။ PUBG Uc ဝယ်မရဖြစ်နေရင် Support ကိုဆက်သွယ်ပါ။
          </div>
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-sm text-muted-foreground mb-2">ဂိမ်းအမျိုးအစားများ</h2>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {categories.map((c) => {
              const active = activeCat === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setActiveCat(c.key)}
                  className={`shrink-0 px-6 h-11 rounded-2xl text-sm font-semibold transition-all border ${
                    active
                      ? 'neon-gradient text-primary-foreground border-transparent neon-ring'
                      : 'glass border-primary/15 text-foreground/80'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Games */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm text-muted-foreground">ဂိမ်းများ</h2>
            <Pin className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((g, i) => (
              <motion.button
                key={g.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/topup')}
                className="glass rounded-2xl p-3 flex items-center gap-3 border border-primary/30 hover:border-primary/60 transition"
              >
                <img
                  src={g.logo}
                  alt={g.name}
                  width={64}
                  height={64}
                  loading="lazy"
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
                <div className="text-left">
                  <p className="text-sm font-bold leading-tight">{g.name}</p>
                  <p className="text-[11px] text-muted-foreground">{g.tag}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </Layout>
  );
};

export default Index;
