import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Eye, EyeOff, Plus, ArrowDownLeft, ArrowUpRight, Headphones, Gift, Sparkles,
  Gamepad2, Smartphone, ShoppingBag, Tv, CreditCard, Flame, Search, Bell,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const categories = [
  { key: 'all', label: 'All', icon: Flame },
  { key: 'mobile', label: 'Mobile Games', icon: Gamepad2 },
  { key: 'pc', label: 'PC Games', icon: Tv },
  { key: 'gift', label: 'Gift Cards', icon: Gift },
  { key: 'shop', label: 'Ecommerce', icon: ShoppingBag },
  { key: 'streaming', label: 'Streaming', icon: Tv },
];

const games = [
  { name: 'Mobile Legends', tag: 'Diamonds', cat: 'mobile', color: 'from-blue-500 to-indigo-600', emoji: '⚔️' },
  { name: 'PUBG Mobile', tag: 'UC', cat: 'mobile', color: 'from-amber-500 to-orange-600', emoji: '🎯' },
  { name: 'Free Fire', tag: 'Diamonds', cat: 'mobile', color: 'from-rose-500 to-red-600', emoji: '🔥' },
  { name: 'Honor of Kings', tag: 'Tokens', cat: 'mobile', color: 'from-purple-500 to-fuchsia-600', emoji: '👑' },
  { name: 'Genshin Impact', tag: 'Genesis', cat: 'mobile', color: 'from-cyan-500 to-blue-600', emoji: '✨' },
  { name: 'Valorant', tag: 'VP Points', cat: 'pc', color: 'from-pink-500 to-rose-600', emoji: '🎮' },
  { name: 'Steam Wallet', tag: 'Top-up', cat: 'pc', color: 'from-slate-600 to-slate-800', emoji: '🕹️' },
  { name: 'Bigo Live', tag: 'Diamonds', cat: 'streaming', color: 'from-violet-500 to-purple-600', emoji: '📺' },
  { name: 'TikTok Coins', tag: 'Coins', cat: 'streaming', color: 'from-pink-400 to-fuchsia-600', emoji: '🎵' },
];

const Index: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
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
  const thb = wallet?.balance_thb ?? 0;

  const filtered = activeCat === 'all' ? games : games.filter((g) => g.cat === activeCat);

  // Guest view stays close to original but lighter
  if (!user) {
    return (
      <Layout>
        <section className="container mx-auto px-4 pt-6 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-strong text-xs text-primary mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Premium Gaming Top-up
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
              <span className="neon-text">Level Up</span> Instantly
            </h1>
            <p className="text-muted-foreground mb-8">
              Mobile Legends, PUBG, Free Fire, Steam, gift cards — fast, secure top-ups in MMK & THB.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="neon-gradient text-primary-foreground neon-glow">
                <Link to="/auth?mode=register">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary/40">
                <Link to="/auth">Login</Link>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-12">
              {games.slice(0, 6).map((g) => (
                <div key={g.name} className="glass rounded-2xl p-4 text-center">
                  <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${g.color} flex items-center justify-center text-2xl mb-2`}>{g.emoji}</div>
                  <p className="text-xs font-medium truncate">{g.name}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 max-w-md md:max-w-3xl pt-2 pb-8 space-y-5">
        {/* Top greeting bar (mobile) */}
        <div className="flex items-center justify-between md:hidden">
          <div>
            <p className="text-xs text-muted-foreground">
              {language === 'my' ? 'မင်္ဂလာပါ' : 'Hello'} 👋
            </p>
            <p className="font-semibold text-sm">{user.email?.split('@')[0]}</p>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-xl glass flex items-center justify-center">
              <Search className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 rounded-xl glass flex items-center justify-center relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" />
            </button>
          </div>
        </div>

        {/* Wallet Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl p-5 neon-glow"
          style={{
            background: 'linear-gradient(135deg, hsl(220 90% 30%) 0%, hsl(210 100% 45%) 50%, hsl(190 100% 40%) 100%)',
          }}
        >
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-cyan-400/20 blur-2xl" />

          <div className="relative flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-5 rounded-sm overflow-hidden border border-white/30 flex flex-col">
                <div className="flex-1 bg-yellow-400" />
                <div className="flex-1 bg-green-600" />
                <div className="flex-1 bg-red-600" />
              </div>
              <span className="text-xs text-white/90 font-medium">Myanmar</span>
            </div>
            <button onClick={() => setShowBalance((v) => !v)} className="text-white/80 hover:text-white">
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>

          <div className="relative">
            <p className="text-white/80 text-xs uppercase tracking-wider">Wallet Balance</p>
            <p className="font-display text-3xl md:text-4xl font-extrabold text-white mt-1">
              {showBalance ? mmk.toLocaleString() : '••••••'}
              <span className="text-base font-semibold text-white/80 ml-2">MMK</span>
            </p>
            <p className="text-xs text-white/70 mt-1">≈ {showBalance ? thb.toLocaleString() : '•••'} THB</p>
          </div>

          <div className="relative grid grid-cols-3 gap-2 mt-5">
            <Button onClick={() => navigate('/deposit')} className="bg-white text-blue-700 hover:bg-white/90 rounded-xl h-10 font-semibold">
              <Plus className="w-4 h-4 mr-1" /> Deposit
            </Button>
            <Button onClick={() => navigate('/history')} variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-xl h-10">
              <ArrowDownLeft className="w-4 h-4 mr-1" /> History
            </Button>
            <Button onClick={() => navigate('/history')} variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-xl h-10">
              <ArrowUpRight className="w-4 h-4 mr-1" /> Withdraw
            </Button>
          </div>
        </motion.div>

        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Plus, label: 'Deposit', to: '/deposit', color: 'from-blue-500 to-cyan-500' },
            { icon: Headphones, label: 'Support', to: '/profile', color: 'from-violet-500 to-purple-600' },
            { icon: Sparkles, label: 'Promos', to: '/topup', color: 'from-pink-500 to-rose-500' },
            { icon: Gift, label: 'Gifts', to: '/topup', color: 'from-amber-500 to-orange-600' },
          ].map((q) => (
            <Link key={q.label} to={q.to} className="flex flex-col items-center gap-1.5">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${q.color} flex items-center justify-center shadow-lg`}>
                <q.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] text-muted-foreground">{q.label}</span>
            </Link>
          ))}
        </div>

        {/* Promo banner */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="relative overflow-hidden rounded-2xl glass-strong p-4 flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-700 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Daily Bonus 5% Cashback</p>
            <p className="text-xs text-muted-foreground">On all game top-ups today</p>
          </div>
          <Button size="sm" className="neon-gradient text-primary-foreground h-8 rounded-xl">Claim</Button>
        </motion.div>

        {/* Category Tabs */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-bold">Categories</h2>
            <Link to="/topup" className="text-xs text-primary">See all</Link>
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 -mx-1 px-1">
            {categories.map((c) => {
              const active = activeCat === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setActiveCat(c.key)}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-4 h-9 rounded-full text-xs font-medium transition-all border ${
                    active
                      ? 'neon-gradient text-primary-foreground border-transparent neon-ring'
                      : 'glass border-primary/15 text-muted-foreground'
                  }`}
                >
                  <c.icon className="w-3.5 h-3.5" />
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Game grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-bold">Top Games</h2>
            <Link to="/topup" className="text-xs text-primary">View all</Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {filtered.map((g, i) => (
              <motion.button
                key={g.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/topup')}
                className="relative glass rounded-2xl p-3 text-left overflow-hidden group"
              >
                <div className={`w-full aspect-square rounded-xl bg-gradient-to-br ${g.color} flex items-center justify-center text-4xl mb-2 shadow-lg group-hover:scale-105 transition-transform`}>
                  {g.emoji}
                </div>
                <p className="text-xs font-semibold truncate">{g.name}</p>
                <p className="text-[10px] text-muted-foreground">{g.tag}</p>
                <div className="absolute inset-0 ring-1 ring-inset ring-primary/0 group-hover:ring-primary/40 rounded-2xl transition" />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Bottom hint */}
        <div className="glass rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Secure Payments</p>
            <p className="text-xs text-muted-foreground">KBZPay · WavePay · Binance · PromptPay</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
