import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Settings, DollarSign, Package, ShoppingCart, ShoppingBag, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import ShoppingManagement from '@/components/admin/ShoppingManagement';

const Admin: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [exchangeRate, setExchangeRate] = useState('95.50');
  const [deposits, setDeposits] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    const { data: rateData } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (rateData?.[0]) setExchangeRate(String(rateData[0].thb_to_mmk));

    const { data: depositData } = await supabase
      .from('deposit_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (depositData) setDeposits(depositData);

    const { data: orderData } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (orderData) setOrders(orderData);
  };

  const updateExchangeRate = async () => {
    const { error } = await supabase
      .from('exchange_rates')
      .update({ is_active: false })
      .eq('is_active', true);

    await supabase.from('exchange_rates').insert({
      thb_to_mmk: parseFloat(exchangeRate),
      set_by: user?.id,
      is_active: true,
    });

    toast({ title: 'Exchange rate updated!' });
  };

  const handleDepositAction = async (id: string, status: 'approved' | 'rejected') => {
    await supabase
      .from('deposit_requests')
      .update({ status, processed_by: user?.id, processed_at: new Date().toISOString() })
      .eq('id', id);
    
    toast({ title: `Deposit ${status}` });
    fetchData();
  };

  const handleOrderAction = async (id: string, status: 'approved' | 'rejected') => {
    await supabase
      .from('orders')
      .update({ status, processed_by: user?.id, processed_at: new Date().toISOString() })
      .eq('id', id);
    
    toast({ title: `Order ${status}` });
    fetchData();
  };

  // Wait for both auth loading AND admin check to complete
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">{t('loading')}</div>
      </Layout>
    );
  }
  
  // Only redirect after loading is complete
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-8">
          <span className="gold-gradient-text">{t('admin')}</span>
        </h1>

        <Tabs defaultValue="exchange" className="space-y-6">
          <TabsList className="bg-secondary flex-wrap h-auto gap-1">
            <TabsTrigger value="exchange"><DollarSign className="w-4 h-4 mr-2" />{t('exchangeRate')}</TabsTrigger>
            <TabsTrigger value="deposits"><Package className="w-4 h-4 mr-2" />{t('deposits')}</TabsTrigger>
            <TabsTrigger value="orders"><ShoppingCart className="w-4 h-4 mr-2" />{t('orders')}</TabsTrigger>
            <TabsTrigger value="shopping"><ShoppingBag className="w-4 h-4 mr-2" />{t('shopping')}</TabsTrigger>
          </TabsList>

          <TabsContent value="exchange">
            <div className="card-premium p-6 max-w-md">
              <h2 className="font-semibold mb-4">{t('thbToMmk')}</h2>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>1 THB = ? MMK</Label>
                  <Input
                    type="number"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(e.target.value)}
                    className="bg-secondary mt-1"
                  />
                </div>
                <Button onClick={updateExchangeRate} className="gold-gradient text-primary-foreground self-end">
                  {t('save')}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="deposits">
            <div className="card-premium p-6">
              <h2 className="font-semibold mb-4">{t('deposits')}</h2>
              {deposits.length === 0 ? (
                <p className="text-muted-foreground">{t('noData')}</p>
              ) : (
                <div className="space-y-4">
                  {deposits.map((deposit) => (
                    <div key={deposit.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                      <div>
                        <p className="font-medium">{deposit.amount} {deposit.currency}</p>
                        <p className="text-sm text-muted-foreground">{deposit.status}</p>
                      </div>
                      {deposit.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleDepositAction(deposit.id, 'approved')} className="bg-success">
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDepositAction(deposit.id, 'rejected')}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="card-premium p-6">
              <h2 className="font-semibold mb-4">{t('orders')}</h2>
              {orders.length === 0 ? (
                <p className="text-muted-foreground">{t('noData')}</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                      <div>
                        <p className="font-medium">{order.amount} {order.currency}</p>
                        <p className="text-sm text-muted-foreground capitalize">{order.category_type?.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground">{order.phone_number || order.player_id || ''}</p>
                        <p className="text-xs text-muted-foreground">{order.status}</p>
                      </div>
                      {order.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleOrderAction(order.id, 'approved')} className="bg-success">
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleOrderAction(order.id, 'rejected')}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="shopping">
            <ShoppingManagement />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
