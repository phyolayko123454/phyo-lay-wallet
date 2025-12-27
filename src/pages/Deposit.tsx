import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, QrCode, Copy, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Deposit: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'THB' | 'MMK'>('THB');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      const { data } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true);
      
      if (data) setPaymentMethods(data);
    };
    fetchPaymentMethods();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || !receipt) {
      toast({ title: 'Error', description: 'Please fill all fields and upload receipt', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      // Upload receipt to storage
      const fileExt = receipt.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('receipts')
        .upload(fileName, receipt);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);

      // Create deposit request
      const { error } = await supabase.from('deposit_requests').insert({
        user_id: user.id,
        amount: parseFloat(amount),
        currency,
        receipt_url: publicUrl,
        status: 'pending',
      });

      if (error) throw error;

      toast({ title: t('success'), description: 'Deposit request submitted! Waiting for approval.' });
      navigate('/wallet');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const thbMethods = paymentMethods.filter(m => m.country === 'TH');
  const mmkMethods = paymentMethods.filter(m => m.country === 'MM');

  if (authLoading) {
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
          className="max-w-2xl mx-auto"
        >
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/wallet">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <h1 className="font-serif text-3xl font-bold gold-gradient-text">
              {t('deposit')}
            </h1>
          </div>

          <Tabs value={currency} onValueChange={(v) => setCurrency(v as 'THB' | 'MMK')} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
              <TabsTrigger value="THB">฿ THB (Thai Baht)</TabsTrigger>
              <TabsTrigger value="MMK">K MMK (Myanmar Kyat)</TabsTrigger>
            </TabsList>

            <TabsContent value="THB">
              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-primary" />
                    Thai Payment Methods
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {thbMethods.length === 0 ? (
                    <div className="p-4 bg-secondary/30 rounded-lg text-center">
                      <p className="text-muted-foreground">Payment methods coming soon</p>
                      <div className="mt-4 p-4 border border-dashed border-primary/30 rounded-lg">
                        <p className="font-semibold">PromptPay</p>
                        <p className="text-lg font-mono">000-000-0000</p>
                        <Button size="sm" variant="outline" className="mt-2" onClick={() => handleCopy('0000000000')}>
                          {copied ? <CheckCircle className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                          Copy
                        </Button>
                      </div>
                    </div>
                  ) : (
                    thbMethods.map((method) => (
                      <div key={method.id} className="p-4 bg-secondary/30 rounded-lg">
                        <p className="font-semibold">{method.name}</p>
                        {method.account_info && (
                          <div className="flex items-center gap-2 mt-2">
                            <p className="text-lg font-mono">{method.account_info}</p>
                            <Button size="sm" variant="ghost" onClick={() => handleCopy(method.account_info)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        {method.qr_code_url && (
                          <img src={method.qr_code_url} alt="QR Code" className="w-48 h-48 mt-4 rounded-lg" />
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="MMK">
              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-primary" />
                    Myanmar Payment Methods
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mmkMethods.length === 0 ? (
                    <div className="p-4 bg-secondary/30 rounded-lg text-center">
                      <p className="text-muted-foreground">Payment methods coming soon</p>
                      <div className="mt-4 space-y-3">
                        <div className="p-4 border border-dashed border-primary/30 rounded-lg">
                          <p className="font-semibold">KBZ Pay</p>
                          <p className="text-lg font-mono">09-xxx-xxx-xxx</p>
                          <Button size="sm" variant="outline" className="mt-2" onClick={() => handleCopy('09xxxxxxxxx')}>
                            {copied ? <CheckCircle className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                            Copy
                          </Button>
                        </div>
                        <div className="p-4 border border-dashed border-primary/30 rounded-lg">
                          <p className="font-semibold">Wave Pay</p>
                          <p className="text-lg font-mono">09-xxx-xxx-xxx</p>
                          <Button size="sm" variant="outline" className="mt-2" onClick={() => handleCopy('09xxxxxxxxx')}>
                            {copied ? <CheckCircle className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                            Copy
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    mmkMethods.map((method) => (
                      <div key={method.id} className="p-4 bg-secondary/30 rounded-lg">
                        <p className="font-semibold">{method.name}</p>
                        {method.account_info && (
                          <div className="flex items-center gap-2 mt-2">
                            <p className="text-lg font-mono">{method.account_info}</p>
                            <Button size="sm" variant="ghost" onClick={() => handleCopy(method.account_info)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        {method.qr_code_url && (
                          <img src={method.qr_code_url} alt="QR Code" className="w-48 h-48 mt-4 rounded-lg" />
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Deposit Form */}
          <Card className="card-premium mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Submit Deposit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Amount ({currency})</Label>
                  <Input
                    type="number"
                    placeholder={`Enter amount in ${currency}`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-secondary"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Upload Receipt / Screenshot</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                      className="hidden"
                      id="receipt-upload"
                    />
                    <label htmlFor="receipt-upload" className="cursor-pointer">
                      {receipt ? (
                        <div className="flex items-center justify-center gap-2 text-primary">
                          <CheckCircle className="w-5 h-5" />
                          <span>{receipt.name}</span>
                        </div>
                      ) : (
                        <div className="text-muted-foreground">
                          <Upload className="w-8 h-8 mx-auto mb-2" />
                          <p>Click to upload receipt</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full gold-gradient text-primary-foreground"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Submit Deposit Request
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Deposit;
