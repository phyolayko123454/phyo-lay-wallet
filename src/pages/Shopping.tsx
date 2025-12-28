import React, { useState } from 'react';
import { ShoppingBag, ExternalLink } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';

interface ShoppingProduct {
  id: string;
  name_en: string;
  name_my: string;
  description_en: string | null;
  description_my: string | null;
  price_thb: number;
  price_mmk: number | null;
  image_url: string | null;
}

const MESSENGER_LINK = 'https://m.me/phyolayhst';

const Shopping: React.FC = () => {
  const { t, language } = useLanguage();
  const [selectedProduct, setSelectedProduct] = useState<ShoppingProduct | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<'THB' | 'MMK'>('THB');

  // Fetch exchange rate
  const { data: exchangeRate } = useQuery({
    queryKey: ['exchange_rate'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  // Fetch shopping products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['shopping_products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shopping_products')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data as ShoppingProduct[];
    }
  });

  const formatPrice = (thb: number, mmk: number | null) => {
    if (selectedCurrency === 'THB') {
      return `${thb.toLocaleString()} ฿`;
    }
    if (mmk) {
      return `${mmk.toLocaleString()} Ks`;
    }
    if (exchangeRate) {
      return `${Math.round(thb * exchangeRate.thb_to_mmk).toLocaleString()} Ks`;
    }
    return `${thb.toLocaleString()} ฿`;
  };

  const handleProductClick = (product: ShoppingProduct) => {
    setSelectedProduct(product);
    setDetailsOpen(true);
  };

  const handleBuyNow = () => {
    if (selectedProduct) {
      const productName = language === 'my' ? selectedProduct.name_my : selectedProduct.name_en;
      const message = encodeURIComponent(`Hi, I want to buy: ${productName}`);
      window.open(`${MESSENGER_LINK}?ref=${message}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-xl gold-gradient flex items-center justify-center">
              <ShoppingBag className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
            <span className="gold-gradient-text">{t('onlineShopping')}</span>
          </h1>
          <p className="text-muted-foreground">{t('shopDescription')}</p>
        </motion.div>

        {/* Currency Toggle */}
        <div className="flex justify-center gap-2 mb-8">
          <Button
            variant={selectedCurrency === 'THB' ? 'default' : 'outline'}
            onClick={() => setSelectedCurrency('THB')}
            className={selectedCurrency === 'THB' ? 'gold-gradient' : ''}
          >
            THB ฿
          </Button>
          <Button
            variant={selectedCurrency === 'MMK' ? 'default' : 'outline'}
            onClick={() => setSelectedCurrency('MMK')}
            className={selectedCurrency === 'MMK' ? 'gold-gradient' : ''}
          >
            MMK Ks
          </Button>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('noData')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleProductClick(product)}
                className="card-premium p-4 cursor-pointer hover:border-primary/50 transition-all duration-300 gold-border-glow group"
              >
                {product.image_url ? (
                  <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-secondary">
                    <img 
                      src={product.image_url} 
                      alt={language === 'my' ? product.name_my : product.name_en}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg bg-secondary flex items-center justify-center mb-3">
                    <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <h3 className="font-semibold text-sm md:text-base mb-1 line-clamp-2">
                  {language === 'my' ? product.name_my : product.name_en}
                </h3>
                <p className="text-primary font-bold">
                  {formatPrice(product.price_thb, product.price_mmk)}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Product Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {t('productDetails')}
            </DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-4">
              {selectedProduct.image_url ? (
                <div className="aspect-video rounded-lg overflow-hidden bg-secondary">
                  <img 
                    src={selectedProduct.image_url} 
                    alt={language === 'my' ? selectedProduct.name_my : selectedProduct.name_en}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video rounded-lg bg-secondary flex items-center justify-center">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
              
              <div>
                <h3 className="font-serif text-xl font-bold mb-2">
                  {language === 'my' ? selectedProduct.name_my : selectedProduct.name_en}
                </h3>
                <p className="text-2xl font-bold text-primary mb-4">
                  {formatPrice(selectedProduct.price_thb, selectedProduct.price_mmk)}
                </p>
                
                {(selectedProduct.description_en || selectedProduct.description_my) && (
                  <p className="text-muted-foreground text-sm mb-4">
                    {language === 'my' ? selectedProduct.description_my : selectedProduct.description_en}
                  </p>
                )}
              </div>

              <Button 
                onClick={handleBuyNow}
                className="w-full gold-gradient text-primary-foreground"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {t('buyNow')} - Messenger
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Shopping;