import React from 'react';
import { Smartphone, Gamepad2, Gift, Wallet } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';

const TopUp: React.FC = () => {
  const { t } = useLanguage();

  const categories = [
    { icon: Smartphone, title: t('myanmarMobile'), items: ['MPT', 'ATOM', 'Ooredoo', 'Mytel'] },
    { icon: Smartphone, title: t('thaiMobile'), items: ['AIS', 'DTAC', 'TrueMove'] },
    { icon: Gamepad2, title: t('gameTopUp'), items: ['Free Fire', 'Mobile Legends', 'PUBG'] },
    { icon: Gift, title: t('giftCards'), items: ['Google Play', 'iTunes', 'Steam'] },
    { icon: Wallet, title: t('walletExchange'), items: ['MMK to THB', 'THB to MMK'] },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-8 text-center">
          <span className="gold-gradient-text">{t('topUp')}</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <div key={index} className="card-premium p-6 gold-border-glow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center">
                  <category.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h2 className="font-serif text-xl font-semibold">{category.title}</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {category.items.map((item, idx) => (
                  <button
                    key={idx}
                    className="p-3 bg-secondary hover:bg-primary/20 rounded-lg text-sm transition-colors border border-border hover:border-primary/50"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default TopUp;
