import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Wallet as WalletIcon, Loader2, ShieldCheck, Zap } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import pubgLogo from '@/assets/pubg-logo.png';
import mlbbLogo from '@/assets/mlbb-logo.png';

type GameKey = 'pubg' | 'mlbb';

const GAMES: Record<GameKey, {
  name: string; tag: string; unit: string; logo: string;
  fields: { player: string; server?: string };
  hint_my: string;
}> = {
  pubg: {
    name: 'PUBG Mobile', tag: 'UC', unit: 'UC', logo: pubgLogo,
    fields: { player: 'Player ID' },
    hint_my: 'PUBG Mobile မှ Player ID ကို Profile မှာ ကြည့်နိုင်ပါတယ်။',
  },
  mlbb: {
    name: 'Mobile Legend', tag: 'Diamonds', unit: '💎', logo: mlbbLogo,
    fields: { player: 'User ID', server: 'Server ID' },
    hint_my: 'MLBB မှ User ID နဲ့ Server ID (ဥပမာ — 12345678 (1234)) ထည့်ပါ။',
  },
};

const TopUpGame: React.FC = () => {
  const { gameKey = 'pubg' } = useParams<{ gameKey: GameKey }>();
  const game = GAMES[gameKey as GameKey] ?? GAMES.pubg;
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState('');
  const [serverId, setServerId] = useState('');

  React.useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['game_packages', gameKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('game_packages')
        .select('*')
        .eq('game_key', gameKey)
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const { data: wallet } = useQuery({
    queryKey: ['wallet', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('wallets').select('balance_mmk, balance_thb')
        .eq('user_id', user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const balance = wallet?.balance_mmk ?? 0;
  const selected = useMemo(() => packages.find((p) => p.id === selectedId), [packages, selectedId]);
  const canSubmit = selected && playerId.trim().length >= 3 && (!game.fields.server || serverId.trim().length >= 1);
  const insufficient = selected && balance < Number(selected.price_mmk);

  const placeOrder = useMutation({
    mutationFn: async () => {
      if (!user || !selected) throw new Error('no selection');
      const { error } = await supabase.from('orders').insert({
        user_id: user.id,
        category_type: 'game',
        amount: Number(selected.price_mmk),
        currency: 'MMK',
        package_id: selected.id,
        game_key: gameKey,
        player_id: playerId.trim(),
        server_id: serverId.trim() || null,
        in_game_amount: selected.in_game_amount,
        status: 'pending',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(language === 'my' ? 'အော်ဒါတင်ပြီးပါပြီ! Admin ခွင့်ပြုချက်စောင့်ပါ။' : 'Order submitted! Awaiting admin approval.');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      navigate('/history');
    },
    onError: (e: any) => toast.error(e.message || 'Failed'),
  });

  if (authLoading || !user) {
    return (
      <Layout><div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div></Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-md md:max-w-3xl px-4 pt-3 pb-32 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl glass flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-lg font-bold">{game.name} Top-up</h1>
        </div>

        {/* Game banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-2xl p-4 flex items-center gap-4 border border-primary/30"
        >
          <img src={game.logo} alt={game.name} width={72} height={72}
               className="w-18 h-18 w-[72px] h-[72px] rounded-2xl object-cover" />
          <div className="flex-1">
            <p className="font-display font-bold text-lg">{game.name}</p>
            <p className="text-xs text-muted-foreground">{language === 'my' ? 'တိုက်ရိုက် ဂိမ်းအတွင်း ပို့ပေးပါမည်' : 'Direct in-game delivery'}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/20 text-success flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Official
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary flex items-center gap-1">
                <Zap className="w-3 h-3" /> Fast
              </span>
            </div>
          </div>
        </motion.div>

        {/* Player info */}
        <div className="space-y-3 glass rounded-2xl p-4">
          <p className="text-sm font-semibold">1. {language === 'my' ? 'အကောင့်အချက်အလက်' : 'Account info'}</p>
          <div>
            <Label className="text-xs text-muted-foreground">{game.fields.player}</Label>
            <Input value={playerId} onChange={(e) => setPlayerId(e.target.value)}
                   placeholder={game.fields.player} className="bg-secondary/50 mt-1 h-11" />
          </div>
          {game.fields.server && (
            <div>
              <Label className="text-xs text-muted-foreground">{game.fields.server}</Label>
              <Input value={serverId} onChange={(e) => setServerId(e.target.value)}
                     placeholder="e.g. 1234" className="bg-secondary/50 mt-1 h-11" />
            </div>
          )}
          <p className="text-[11px] text-muted-foreground">{game.hint_my}</p>
        </div>

        {/* Packages */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">2. {language === 'my' ? 'ပက်ကေ့ဂျ်ရွေးပါ' : 'Select package'}</p>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <WalletIcon className="w-3.5 h-3.5 text-primary" />
              {balance.toLocaleString()} Ks
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 glass rounded-2xl shimmer" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {packages.map((p) => {
                const active = selectedId === p.id;
                return (
                  <motion.button
                    key={p.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedId(p.id)}
                    className={`relative rounded-2xl p-3 text-left border transition-all ${
                      active
                        ? 'neon-gradient text-primary-foreground border-transparent neon-glow'
                        : 'glass border-primary/15 hover:border-primary/40'
                    }`}
                  >
                    {active && (
                      <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white text-primary flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <div className="text-2xl mb-1">{game.unit}</div>
                    <p className={`font-bold text-sm ${active ? 'text-primary-foreground' : ''}`}>
                      {p.in_game_amount.toLocaleString()}
                      {p.bonus_amount > 0 && (
                        <span className={`text-[10px] ml-1 ${active ? 'text-primary-foreground/90' : 'text-success'}`}>
                          +{p.bonus_amount}
                        </span>
                      )}
                    </p>
                    <p className={`text-xs ${active ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>
                      {Number(p.price_mmk).toLocaleString()} Ks
                    </p>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Sticky checkout */}
        <div className="fixed bottom-20 md:bottom-4 inset-x-0 z-30 px-4">
          <div className="max-w-md md:max-w-3xl mx-auto glass-strong rounded-2xl p-3 border border-primary/30 flex items-center gap-3">
            <div className="flex-1">
              <p className="text-[11px] text-muted-foreground">{language === 'my' ? 'စုစုပေါင်း' : 'Total'}</p>
              <p className="font-display font-extrabold text-lg">
                {selected ? `${Number(selected.price_mmk).toLocaleString()} Ks` : '— Ks'}
              </p>
              {insufficient && (
                <p className="text-[10px] text-destructive">{language === 'my' ? 'ပိုက်ဆံမလောက်ပါ' : 'Insufficient balance'}</p>
              )}
            </div>
            {insufficient ? (
              <Button onClick={() => navigate('/deposit')} className="neon-gradient text-primary-foreground h-11 px-5 rounded-xl">
                ငွေဖြည့်ရန်
              </Button>
            ) : (
              <Button
                disabled={!canSubmit || placeOrder.isPending}
                onClick={() => placeOrder.mutate()}
                className="neon-gradient text-primary-foreground h-11 px-5 rounded-xl disabled:opacity-50"
              >
                {placeOrder.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (language === 'my' ? 'ဝယ်ယူမည်' : 'Buy Now')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TopUpGame;
