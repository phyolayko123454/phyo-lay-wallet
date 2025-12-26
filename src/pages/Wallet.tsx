import React from 'react';
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';

const WalletPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-8 text-center">
          <span className="gold-gradient-text">{t('wallet')}</span>
        </h1>

        <div className="max-w-2xl mx-auto">
          {/* Balance Card */}
          <div className="card-premium p-8 gold-border-glow mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center gold-glow">
                <WalletIcon className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <p className="text-muted-foreground">{t('balance')}</p>
                <h2 className="font-serif text-3xl font-bold gold-gradient-text">฿0.00</h2>
                <p className="text-muted-foreground text-sm">≈ 0 MMK</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button asChild className="gold-gradient text-primary-foreground">
                <Link to="/deposit">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('deposit')}
                </Link>
              </Button>
              <Button variant="outline" className="border-primary/50">
                <ArrowUpRight className="w-4 h-4 mr-2" />
                {t('withdraw')}
              </Button>
            </div>
          </div>

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
