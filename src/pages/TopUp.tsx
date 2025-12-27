import React, { useState } from 'react';
import { Smartphone, Gamepad2, Gift, Wallet, Phone, X } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Category {
  id: string;
  name_en: string;
  name_my: string;
  type: string;
  icon: string;
}

interface Product {
  id: string;
  name_en: string;
  name_my: string;
  category_id: string;
  price_thb: number;
  price_mmk: number | null;
}

const iconMap: { [key: string]: React.ComponentType<any> } = {
  smartphone: Smartphone,
  phone: Phone,
  'gamepad-2': Gamepad2,
  gift: Gift,
  wallet: Wallet,
};

const TopUp: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<'THB' | 'MMK'>('THB');

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data as Category[];
    }
  });

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data as Product[];
    }
  });

  // Fetch wallet balance
  const { data: wallet } = useQuery({
    queryKey: ['wallet', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user
  });

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

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: {
      product_id: string;
      category_type: string;
      amount: number;
      currency: string;
      phone_number?: string;
      player_id?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          product_id: orderData.product_id,
          category_type: orderData.category_type,
          amount: orderData.amount,
          currency: orderData.currency,
          phone_number: orderData.phone_number,
          player_id: orderData.player_id,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success(language === 'my' ? 'အော်ဒါတင်ပြီးပါပြီ။' : 'Order submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setOrderDialogOpen(false);
      resetOrderForm();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit order');
    }
  });

  const resetOrderForm = () => {
    setSelectedProduct(null);
    setPhoneNumber('');
    setPlayerId('');
    setCustomAmount('');
  };

  const handleProductClick = (product: Product, categoryType: string) => {
    if (!user) {
      toast.error(language === 'my' ? 'အရင်ဝင်ရောက်ပါ' : 'Please login first');
      navigate('/auth');
      return;
    }
    
    setSelectedProduct({ ...product, category_id: product.category_id });
    setOrderDialogOpen(true);
  };

  const handleSubmitOrder = () => {
    if (!selectedProduct) return;
    
    const category = categories.find(c => c.id === selectedProduct.category_id);
    if (!category) return;

    const amount = parseFloat(customAmount) || 0;
    if (amount <= 0) {
      toast.error(language === 'my' ? 'ပမာဏထည့်ပါ' : 'Please enter amount');
      return;
    }

    // Validate based on category type
    if (category.type === 'myanmar_mobile' || category.type === 'thai_mobile') {
      if (!phoneNumber) {
        toast.error(language === 'my' ? 'ဖုန်းနံပါတ်ထည့်ပါ' : 'Please enter phone number');
        return;
      }
    }

    if (category.type === 'game') {
      if (!playerId) {
        toast.error(language === 'my' ? 'Player ID ထည့်ပါ' : 'Please enter Player ID');
        return;
      }
    }

    createOrderMutation.mutate({
      product_id: selectedProduct.id,
      category_type: category.type,
      amount: amount,
      currency: selectedCurrency,
      phone_number: phoneNumber || undefined,
      player_id: playerId || undefined
    });
  };

  const getCategoryProducts = (categoryId: string) => {
    return products.filter(p => p.category_id === categoryId);
  };

  const getIcon = (iconName: string) => {
    return iconMap[iconName] || Smartphone;
  };

  const formatPrice = (thb: number) => {
    if (selectedCurrency === 'THB') {
      return `${thb} ฿`;
    }
    if (exchangeRate) {
      return `${Math.round(thb * exchangeRate.thb_to_mmk)} Ks`;
    }
    return `${thb} ฿`;
  };

  if (categoriesLoading || productsLoading) {
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
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-center">
          <span className="gold-gradient-text">{t('topUp')}</span>
        </h1>
        
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

        {/* Wallet Balance Display */}
        {user && wallet && (
          <div className="max-w-md mx-auto mb-8 p-4 card-premium gold-border-glow text-center">
            <p className="text-sm text-muted-foreground mb-1">{t('balance')}</p>
            <p className="text-2xl font-bold text-primary">
              {selectedCurrency === 'THB' 
                ? `${wallet.balance_thb || 0} ฿` 
                : `${wallet.balance_mmk || 0} Ks`}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const IconComponent = getIcon(category.icon || 'smartphone');
            const categoryProducts = getCategoryProducts(category.id);
            
            return (
              <div key={category.id} className="card-premium p-6 gold-border-glow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h2 className="font-serif text-xl font-semibold">
                    {language === 'my' ? category.name_my : category.name_en}
                  </h2>
                </div>
                
                {categoryProducts.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {categoryProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleProductClick(product, category.type)}
                        className="p-3 bg-secondary hover:bg-primary/20 rounded-lg text-sm transition-all border border-border hover:border-primary/50 hover:scale-105"
                      >
                        <span className="block font-medium">
                          {language === 'my' ? product.name_my : product.name_en}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">{t('noData')}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Dialog */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {selectedProduct && (language === 'my' ? selectedProduct.name_my : selectedProduct.name_en)}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Currency Selection */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                {language === 'my' ? 'ငွေကြေးရွေးပါ' : 'Select Currency'}
              </label>
              <div className="flex gap-2">
                <Button
                  variant={selectedCurrency === 'THB' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCurrency('THB')}
                  className={selectedCurrency === 'THB' ? 'gold-gradient' : ''}
                >
                  THB ฿
                </Button>
                <Button
                  variant={selectedCurrency === 'MMK' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCurrency('MMK')}
                  className={selectedCurrency === 'MMK' ? 'gold-gradient' : ''}
                >
                  MMK Ks
                </Button>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                {t('amount')} ({selectedCurrency})
              </label>
              <Input
                type="number"
                placeholder={selectedCurrency === 'THB' ? '100' : '5000'}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="bg-secondary"
              />
              {exchangeRate && (
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'my' ? 'လဲနှုန်း' : 'Rate'}: 1 THB = {exchangeRate.thb_to_mmk} MMK
                </p>
              )}
            </div>

            {/* Phone Number for Mobile */}
            {selectedProduct && categories.find(c => c.id === selectedProduct.category_id)?.type?.includes('mobile') && (
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  {t('phone')}
                </label>
                <Input
                  type="tel"
                  placeholder="09xxxxxxxxx"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="bg-secondary"
                />
              </div>
            )}

            {/* Player ID for Games */}
            {selectedProduct && categories.find(c => c.id === selectedProduct.category_id)?.type === 'game' && (
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Player ID
                </label>
                <Input
                  type="text"
                  placeholder="Enter Player ID"
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  className="bg-secondary"
                />
              </div>
            )}

            <Button 
              onClick={handleSubmitOrder}
              disabled={createOrderMutation.isPending}
              className="w-full gold-gradient text-primary-foreground"
            >
              {createOrderMutation.isPending 
                ? (language === 'my' ? 'တင်သွင်းနေသည်...' : 'Submitting...') 
                : t('submit')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default TopUp;
