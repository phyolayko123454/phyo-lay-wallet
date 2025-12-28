import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Smartphone, Gamepad2, ShoppingBag, Wallet, ArrowRight, Shield, Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

const Index: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const categories = [
    { icon: Smartphone, title: t('myanmarMobile'), description: 'MPT, ATOM, Ooredoo, Mytel', color: 'from-emerald-500 to-teal-600', link: '/topup' },
    { icon: Smartphone, title: t('thaiMobile'), description: 'AIS, DTAC, TrueMove', color: 'from-blue-500 to-indigo-600', link: '/topup' },
    { icon: Gamepad2, title: t('gameTopUp'), description: 'Free Fire, Mobile Legends', color: 'from-purple-500 to-pink-600', link: '/topup' },
    { icon: ShoppingBag, title: t('onlineShopping'), description: t('shopDescription'), color: 'from-orange-500 to-red-600', link: '/shopping' },
    { icon: Wallet, title: t('walletExchange'), description: 'MMK ↔ THB', color: 'from-primary to-gold-light', link: '/wallet' },
  ];

  const features = [
    { icon: Zap, title: 'Fast Processing', description: 'Instant top-up delivery within minutes' },
    { icon: Shield, title: 'Secure Payments', description: 'Your transactions are fully protected' },
    { icon: Clock, title: '24/7 Support', description: 'Always here to help you' },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-gold-muted/20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-gold" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Logo Badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 mb-8"
            >
              <div className="w-16 h-16 rounded-full gold-gradient gold-glow flex items-center justify-center">
                <span className="text-primary-foreground font-serif font-bold text-3xl">P</span>
              </div>
            </motion.div>

            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="gold-gradient-text">{t('heroTitle')}</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-4">
              {t('heroSubtitle')}
            </p>
            
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('heroDescription')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gold-gradient text-primary-foreground hover:opacity-90 text-lg px-8">
                <Link to={user ? '/topup' : '/auth'}>
                  {t('getStarted')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary/50 hover:bg-primary/10 text-lg px-8">
                <Link to="/topup">
                  {t('topUp')}
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              <span className="gold-gradient-text">{t('categories')}</span>
            </h2>
            <p className="text-muted-foreground">Choose from our wide range of services</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={category.link}
                  className="card-premium p-6 flex flex-col items-center text-center hover:border-primary/50 transition-all duration-300 group gold-border-glow"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <category.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{category.title}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-premium p-8 text-center"
              >
                <div className="w-16 h-16 rounded-full gold-gradient mx-auto mb-6 flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
