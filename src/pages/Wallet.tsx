import React, { useEffect, useState } from 'react';
import { Wallet as WalletIcon, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const WalletPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [balanceThb, setBalanceThb] = useState(0);
  const [balanceMmk, setBalanceMmk] = useState(0);
  const [country, setCountry] = useState<'MM' | 'TH'>('MM');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [{ data: w }, { data: p }] = await Promise.all([
        supabase.from('wallets').select('balance_thb, balance_mmk').eq('user_id', user.id).maybeSingle(),
        supabase.from('profiles').select('country').eq('id', user.id).maybeSingle(),
      ]);
      setBalanceThb(Number(w?.balance_thb ?? 0));
      setBalanceMmk(Number(w?.balance_mmk ?? 0));
      if ((p as any)?.country) setCountry((p as any).country);
      setLoading(false);
    };
    load();
  }, [user]);

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-8 text-center">
          <span className="gold-gradient-text">{t('wallet')}</span>
        </h1>

        <div className="max-w-2xl mx-auto space-y-6">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : (
            <>
              {/* MMK Balance */}
              <div className="card-premium p-6 gold-border-glow">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full gold-gradient flex items-center justify-center gold-glow">
                    <WalletIcon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-muted-foreground text-sm">Myanmar Kyat (MMK)</p>
                    <h2 className="font-serif text-3xl font-bold gold-gradient-text">
                      {balanceMmk.toLocaleString()} Ks
                    </h2>
                  </div>
                </div>
              </div>

              {/* THB Balance */}
              <div className="card-premium p-6 gold-border-glow">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full gold-gradient flex items-center justify-center gold-glow">
                    <WalletIcon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-muted-foreground text-sm">Thai Baht (THB)</p>
                    <h2 className="font-serif text-3xl font-bold gold-gradient-text">
                      ฿{balanceThb.toLocaleString()}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="text-center text-xs text-muted-foreground">
                Country: <span className="text-primary font-semibold">{country === 'MM' ? '🇲🇲 Myanmar' : '🇹🇭 Thailand'}</span>
              </div>

              <Button asChild className="w-full gold-gradient text-primary-foreground">
                <Link to="/deposit">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('deposit')}
                </Link>
              </Button>
            </>
          )}

          {/* Recent Transactions */}
          <div className="card-premium p-6">
            <h3 className="font-semibold mb-4">{t('history')}</h3>
            <div className="text-center py-8 text-muted-foreground">
              {t('noData')}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WalletPage;
