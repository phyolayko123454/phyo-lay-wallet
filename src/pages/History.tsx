import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Loader2, AlertCircle, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import OrderReceipt from '@/components/OrderReceipt';

interface Order {
  id: string;
  amount: number;
  currency: string;
  category_type: string;
  status: string;
  created_at: string;
  processed_at: string | null;
  phone_number: string | null;
  player_id: string | null;
}

interface Deposit {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  receipt_url: string;
}

const History: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const fetchHistory = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [ordersRes, depositsRes] = await Promise.all([
        supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('deposit_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      if (ordersRes.data) setOrders(ordersRes.data);
      if (depositsRes.data) setDeposits(depositsRes.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchHistory();
  }, [user, fetchHistory]);

  // Live updates: when admin approves an order, user sees it immediately
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`orders:user:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const next = payload.new as Order;

            setOrders((prev) => {
              const exists = prev.some((o) => o.id === next.id);
              const merged = exists
                ? prev.map((o) => (o.id === next.id ? { ...o, ...next } : o))
                : [next, ...prev];
              return merged;
            });

            if (next.status === 'approved' || next.status === 'completed') {
              toast({
                title: language === 'my' ? 'အော်ဒါအောင်မြင်ပါသည်' : 'Order approved',
                description:
                  language === 'my'
                    ? 'History ထဲကနေ ပြေစာကို ကြည့်ပြီး သိမ်းနိုင်ပါပြီ။'
                    : 'You can now view and save your receipt from History.',
              });
            }
          }

          if (payload.eventType === 'DELETE') {
            const oldRow = payload.old as { id?: string };
            if (oldRow?.id) setOrders((prev) => prev.filter((o) => o.id !== oldRow.id));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast, language]);

  const getStatusBadge = (status: string) => {
    const approvedLabel = language === 'my' ? 'အောင်မြင်' : 'Approved';
    const rejectedLabel = language === 'my' ? 'ပယ်ချ' : 'Rejected';
    const pendingLabel = language === 'my' ? 'စောင့်ဆိုင်းဆဲ' : 'Pending';

    switch (status) {
      case 'approved':
      case 'completed':
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" /> {approvedLabel}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <XCircle className="w-3 h-3 mr-1" /> {rejectedLabel}
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <AlertCircle className="w-3 h-3 mr-1" /> {pendingLabel}
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-serif text-3xl font-bold gold-gradient-text mb-8">
            {t('history')}
          </h1>

          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-secondary/50">
              <TabsTrigger value="orders">Top-up Orders</TabsTrigger>
              <TabsTrigger value="deposits">Deposits</TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Order History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No orders yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-4 rounded-lg bg-secondary/30 border border-border/50"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <p className="font-semibold text-foreground capitalize">
                                {order.category_type.replace('_', ' ')} Top-up
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {order.phone_number || order.player_id || 'N/A'}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDate(order.created_at)}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-bold text-lg gold-gradient-text">
                                  {order.amount.toLocaleString()} {order.currency}
                                </p>
                              </div>
                              {getStatusBadge(order.status)}
                            </div>
                          </div>
                          {(order.status === 'approved' || order.status === 'completed') && (
                            <div className="mt-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setReceiptOrder(order)}
                                className="text-xs"
                              >
                                <FileText className="w-3 h-3 mr-1" />
                                {language === 'my' ? 'ပြေစာကြည့်မည်' : 'View Receipt'}
                              </Button>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="deposits">
              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-primary" />
                    Deposit History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {deposits.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Download className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No deposits yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {deposits.map((deposit) => (
                        <motion.div
                          key={deposit.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-4 rounded-lg bg-secondary/30 border border-border/50"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <p className="font-semibold text-foreground">
                                Wallet Deposit
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDate(deposit.created_at)}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-bold text-lg gold-gradient-text">
                                  {deposit.amount.toLocaleString()} {deposit.currency}
                                </p>
                              </div>
                              {getStatusBadge(deposit.status || 'pending')}
                            </div>
                          </div>
                          {deposit.receipt_url && (
                            <div className="mt-3">
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="text-xs"
                              >
                                <a href={deposit.receipt_url} target="_blank" rel="noopener noreferrer">
                                  View Receipt
                                </a>
                              </Button>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Order Receipt Dialog */}
      {receiptOrder && (
        <OrderReceipt
          open={!!receiptOrder}
          onOpenChange={(open) => !open && setReceiptOrder(null)}
          order={receiptOrder}
        />
      )}
    </Layout>
  );
};

export default History;
