import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Package, ShoppingCart, Check, X, ArrowLeft,
  Gamepad2, Plus, Trash2, Loader2, Image as ImageIcon, Users, Clock, Landmark,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';


const Admin: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [exchangeRate, setExchangeRate] = useState('95.50');

  // ---- Queries ----
  const ratesQ = useQuery({
    queryKey: ['admin_rate'],
    queryFn: async () => {
      const { data } = await supabase.from('exchange_rates').select('*').eq('is_active', true)
        .order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (data) setExchangeRate(String(data.thb_to_mmk));
      return data;
    },
    enabled: !!user,
  });

  const depositsQ = useQuery({
    queryKey: ['admin_deposits'],
    queryFn: async () => {
      const { data } = await supabase.from('deposit_requests').select('*').order('created_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const ordersQ = useQuery({
    queryKey: ['admin_orders'],
    queryFn: async () => {
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
    refetchInterval: 5000,
  });

  const packagesQ = useQuery({
    queryKey: ['admin_packages'],
    queryFn: async () => {
      const { data } = await supabase.from('game_packages').select('*').order('game_key').order('sort_order');
      return data ?? [];
    },
    enabled: !!user,
  });

  // ---- Mutations ----
  const saveRate = useMutation({
    mutationFn: async () => {
      await supabase.from('exchange_rates').update({ is_active: false }).eq('is_active', true);
      const { error } = await supabase.from('exchange_rates').insert({
        thb_to_mmk: parseFloat(exchangeRate),
        set_by: user?.id, is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast({ title: 'လဲနှုန်း Save ပြီးပါပြီ' }); qc.invalidateQueries({ queryKey: ['admin_rate'] }); },
  });

  const depositAction = useMutation({
    mutationFn: async ({ id, status, amount, currency, userId }: any) => {
      if (status === 'approved') {
        // top-up wallet
        const col = currency === 'MMK' ? 'balance_mmk' : 'balance_thb';
        const { data: w } = await supabase.from('wallets').select(col).eq('user_id', userId).maybeSingle();
        const current = Number((w as any)?.[col] ?? 0);
        const patch: any = { [col]: current + Number(amount) };
        const { error: e1 } = await supabase.from('wallets').update(patch).eq('user_id', userId);
        if (e1) throw e1;
      }
      const { error } = await supabase.from('deposit_requests')
        .update({ status, processed_by: user?.id, processed_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      toast({ title: `Deposit ${v.status}` });
      qc.invalidateQueries({ queryKey: ['admin_deposits'] });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const orderAction = useMutation({
    mutationFn: async ({ id, action, note }: { id: string; action: 'approve' | 'reject'; note?: string }) => {
      const fn = action === 'approve' ? 'approve_order' : 'reject_order';
      const { error } = await supabase.rpc(fn, { p_order_id: id, p_note: note ?? null });
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      toast({ title: `Order ${v.action}d` });
      qc.invalidateQueries({ queryKey: ['admin_orders'] });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const upsertPackage = useMutation({
    mutationFn: async (p: any) => {
      const payload = {
        game_key: p.game_key, name_en: p.name_en, name_my: p.name_my,
        in_game_amount: Number(p.in_game_amount), bonus_amount: Number(p.bonus_amount || 0),
        price_mmk: Number(p.price_mmk), price_thb: Number(p.price_thb || 0),
        sort_order: Number(p.sort_order || 0), is_active: !!p.is_active,
      };
      if (p.id) {
        const { error } = await supabase.from('game_packages').update(payload).eq('id', p.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('game_packages').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast({ title: 'Package saved' }); qc.invalidateQueries({ queryKey: ['admin_packages'] }); },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deletePackage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('game_packages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { toast({ title: 'Deleted' }); qc.invalidateQueries({ queryKey: ['admin_packages'] }); },
  });

  const deleteAllPackages = useMutation({
    mutationFn: async (gameKey: string) => {
      const { error } = await supabase.from('game_packages').delete().eq('game_key', gameKey);
      if (error) throw error;
    },
    onSuccess: () => { toast({ title: 'All demo packages deleted' }); qc.invalidateQueries({ queryKey: ['admin_packages'] }); },
  });


  const paymentsQ = useQuery({
    queryKey: ['admin_payments'],
    queryFn: async () => {
      const { data } = await supabase.from('payment_methods').select('*').order('created_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const savePayment = useMutation({
    mutationFn: async (p: any) => {
      const payload = {
        name: p.name, type: p.type, country: p.country,
        account_info: p.account_info || null, qr_code_url: p.qr_code_url || null,
        is_active: p.is_active !== false,
      };
      if (p.id) {
        const { error } = await supabase.from('payment_methods').update(payload).eq('id', p.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('payment_methods').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast({ title: 'Payment method saved' }); qc.invalidateQueries({ queryKey: ['admin_payments'] }); },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deletePayment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('payment_methods').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { toast({ title: 'Deleted' }); qc.invalidateQueries({ queryKey: ['admin_payments'] }); },
  });

  if (loading) return <Layout><div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div></Layout>;
  if (!user) return <Navigate to="/auth" replace />;
  // NOTE: role gating temporarily disabled — any logged-in user can access admin

  const pendingOrders = (ordersQ.data ?? []).filter((o: any) => o.status === 'pending');
  const pendingDeposits = (depositsQ.data ?? []).filter((d: any) => d.status === 'pending');

  return (
    <Layout>
      <div className="container mx-auto max-w-5xl px-4 pt-3 pb-24 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="w-10 h-10 rounded-xl glass flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-xl font-extrabold">Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground">PHYO LAY · Control Panel</p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={Clock} label="Pending Orders" value={pendingOrders.length} accent="text-warning" />
          <StatCard icon={Package} label="Pending Deposits" value={pendingDeposits.length} accent="text-accent" />
          <StatCard icon={Users} label="Total Orders" value={(ordersQ.data ?? []).length} accent="text-primary" />
        </div>

        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="glass border border-primary/15 flex-wrap h-auto gap-1 p-1 w-full justify-start overflow-x-auto">
            <TabsTrigger value="orders" className="data-[state=active]:neon-gradient data-[state=active]:text-primary-foreground rounded-xl">
              <ShoppingCart className="w-4 h-4 mr-1.5" /> Orders {pendingOrders.length > 0 && <Badge className="ml-2 bg-warning text-warning-foreground">{pendingOrders.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="deposits" className="data-[state=active]:neon-gradient data-[state=active]:text-primary-foreground rounded-xl">
              <Package className="w-4 h-4 mr-1.5" /> Deposits {pendingDeposits.length > 0 && <Badge className="ml-2 bg-warning text-warning-foreground">{pendingDeposits.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="packages" className="data-[state=active]:neon-gradient data-[state=active]:text-primary-foreground rounded-xl">
              <Gamepad2 className="w-4 h-4 mr-1.5" /> Packages
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:neon-gradient data-[state=active]:text-primary-foreground rounded-xl">
              <Landmark className="w-4 h-4 mr-1.5" /> Bank
            </TabsTrigger>
          </TabsList>


          {/* ORDERS */}
          <TabsContent value="orders" className="space-y-3">
            {(ordersQ.data ?? []).length === 0 && <Empty label="No orders yet" />}
            {(ordersQ.data ?? []).map((o: any) => (
              <div key={o.id} className="glass rounded-2xl p-4 border border-primary/10">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-bold text-base">
                        {o.game_key ? o.game_key.toUpperCase() : (o.category_type || '').replace('_', ' ')}
                      </span>
                      {o.in_game_amount && <Badge variant="outline" className="border-primary/40 text-primary">{o.in_game_amount} {o.game_key === 'pubg' ? 'UC' : '💎'}</Badge>}
                      <StatusBadge status={o.status} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                      {o.player_id && <p>Player ID: <span className="font-mono text-foreground">{o.player_id}</span>{o.server_id && <> · Server: <span className="font-mono text-foreground">{o.server_id}</span></>}</p>}
                      {o.phone_number && <p>Phone: <span className="font-mono text-foreground">{o.phone_number}</span></p>}
                      <p>{new Date(o.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display font-extrabold text-lg">{Number(o.amount).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{o.currency}</p>
                  </div>
                </div>
                {o.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" onClick={() => orderAction.mutate({ id: o.id, action: 'approve' })}
                            className="flex-1 bg-success text-success-foreground hover:bg-success/90">
                      <Check className="w-4 h-4 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" className="flex-1"
                            onClick={() => {
                              const note = prompt('Reject reason (optional)') ?? undefined;
                              orderAction.mutate({ id: o.id, action: 'reject', note });
                            }}>
                      <X className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </TabsContent>

          {/* DEPOSITS */}
          <TabsContent value="deposits" className="space-y-3">
            {(depositsQ.data ?? []).length === 0 && <Empty label="No deposits yet" />}
            {(depositsQ.data ?? []).map((d: any) => (
              <div key={d.id} className="glass rounded-2xl p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  {d.receipt_url ? (
                    <a href={d.receipt_url} target="_blank" rel="noopener noreferrer"
                       className="w-16 h-16 rounded-xl bg-secondary overflow-hidden flex items-center justify-center shrink-0">
                      <img src={d.receipt_url} alt="receipt" className="w-full h-full object-cover" />
                    </a>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold">{Number(d.amount).toLocaleString()} {d.currency}</span>
                      <StatusBadge status={d.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(d.created_at).toLocaleString()}</p>
                  </div>
                </div>
                {d.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="flex-1 bg-success text-success-foreground hover:bg-success/90"
                            onClick={() => depositAction.mutate({ id: d.id, status: 'approved', amount: d.amount, currency: d.currency, userId: d.user_id })}>
                      <Check className="w-4 h-4 mr-1" /> Approve & Credit
                    </Button>
                    <Button size="sm" variant="destructive" className="flex-1"
                            onClick={() => depositAction.mutate({ id: d.id, status: 'rejected' })}>
                      <X className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </TabsContent>

          {/* PACKAGES */}
          <TabsContent value="packages" className="space-y-3">
            <PackageEditor onSave={(p) => upsertPackage.mutate(p)} saving={upsertPackage.isPending} />
            {['pubg', 'mlbb'].map((gk) => (
              <div key={gk} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{gk}</p>
                  {(packagesQ.data ?? []).filter((p: any) => p.game_key === gk).length > 0 && (
                    <Button size="sm" variant="ghost" className="text-destructive h-7 text-xs"
                      onClick={() => { if (confirm(`Delete ALL ${gk.toUpperCase()} packages?`)) deleteAllPackages.mutate(gk); }}>
                      <Trash2 className="w-3 h-3 mr-1" /> Delete all demo
                    </Button>
                  )}
                </div>
                {(packagesQ.data ?? []).filter((p: any) => p.game_key === gk).map((p: any) => (
                  <div key={p.id} className="glass rounded-2xl p-3 flex items-center gap-3 border border-primary/10">
                    <div className="w-12 h-12 rounded-xl neon-gradient flex items-center justify-center text-primary-foreground font-bold text-xs">
                      {p.in_game_amount}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{p.name_en}{p.bonus_amount > 0 && <span className="text-success ml-1">+{p.bonus_amount}</span>}</p>
                      <p className="text-xs text-muted-foreground">{Number(p.price_mmk).toLocaleString()} Ks · {Number(p.price_thb).toLocaleString()} ฿</p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => deletePackage.mutate(p.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ))}

          </TabsContent>

          {/* Rate & Shopping tabs removed per request */}


          {/* PAYMENT METHODS (Bank accounts / wallets) */}
          <TabsContent value="payments" className="space-y-3">
            <PaymentMethodEditor onSave={(p) => savePayment.mutate(p)} saving={savePayment.isPending} />
            {(paymentsQ.data ?? []).length === 0 && <Empty label="No payment methods yet" />}
            {(paymentsQ.data ?? []).map((m: any) => (
              <div key={m.id} className="glass rounded-2xl p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl neon-gradient flex items-center justify-center text-primary-foreground shrink-0">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-display font-bold">{m.name}</p>
                      <Badge variant="outline" className="border-primary/40 text-primary text-[10px]">{m.country}</Badge>
                      <Badge variant="outline" className="border-primary/40 text-primary text-[10px]">{m.type}</Badge>
                      {!m.is_active && <Badge variant="outline" className="text-muted-foreground text-[10px]">inactive</Badge>}
                    </div>
                    {m.account_info && <p className="font-mono text-sm mt-1 break-all">{m.account_info}</p>}
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => { if (confirm('Delete?')) deletePayment.mutate(m.id); }}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

const StatCard: React.FC<{ icon: any; label: string; value: number; accent: string }> = ({ icon: Icon, label, value, accent }) => (
  <div className="glass rounded-2xl p-3 border border-primary/15">
    <Icon className={`w-5 h-5 mb-1 ${accent}`} />
    <p className="font-display font-extrabold text-xl">{value}</p>
    <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
  </div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    pending: 'bg-warning/20 text-warning',
    approved: 'bg-success/20 text-success',
    rejected: 'bg-destructive/20 text-destructive',
  };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[status] ?? 'bg-muted'}`}>{status}</span>;
};

const Empty: React.FC<{ label: string }> = ({ label }) => (
  <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">{label}</div>
);

const PackageEditor: React.FC<{ onSave: (p: any) => void; saving: boolean }> = ({ onSave, saving }) => {
  const [form, setForm] = useState({
    game_key: 'pubg', name_en: '', name_my: '', in_game_amount: '',
    bonus_amount: '0', price_mmk: '', price_thb: '0', sort_order: '0', is_active: true,
  });
  return (
    <details className="glass rounded-2xl border border-primary/15">
      <summary className="p-4 cursor-pointer font-semibold flex items-center gap-2">
        <Plus className="w-4 h-4 text-primary" /> Add Package
      </summary>
      <div className="p-4 pt-0 grid grid-cols-2 gap-2">
        <select value={form.game_key} onChange={(e) => setForm({ ...form, game_key: e.target.value })}
                className="col-span-2 h-10 rounded-lg bg-secondary/50 px-3 text-sm border border-border">
          <option value="pubg">PUBG Mobile</option>
          <option value="mlbb">Mobile Legend</option>
        </select>
        <Input placeholder="Name EN (60 UC)" value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} className="bg-secondary/50" />
        <Input placeholder="Name MY" value={form.name_my} onChange={(e) => setForm({ ...form, name_my: e.target.value })} className="bg-secondary/50" />
        <Input type="number" placeholder="In-game amount" value={form.in_game_amount} onChange={(e) => setForm({ ...form, in_game_amount: e.target.value })} className="bg-secondary/50" />
        <Input type="number" placeholder="Bonus" value={form.bonus_amount} onChange={(e) => setForm({ ...form, bonus_amount: e.target.value })} className="bg-secondary/50" />
        <Input type="number" placeholder="Price MMK" value={form.price_mmk} onChange={(e) => setForm({ ...form, price_mmk: e.target.value })} className="bg-secondary/50" />
        <Input type="number" placeholder="Price THB" value={form.price_thb} onChange={(e) => setForm({ ...form, price_thb: e.target.value })} className="bg-secondary/50" />
        <Input type="number" placeholder="Sort order" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="bg-secondary/50 col-span-2" />
        <Button disabled={saving} onClick={() => { onSave(form); setForm({ ...form, name_en: '', name_my: '', in_game_amount: '', price_mmk: '' }); }}
                className="col-span-2 neon-gradient text-primary-foreground h-11 rounded-xl">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Package'}
        </Button>
      </div>
    </details>
  );
};

const PaymentMethodEditor: React.FC<{ onSave: (p: any) => void; saving: boolean }> = ({ onSave, saving }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: '', type: 'bank_mm', country: 'MM', account_info: '', qr_code_url: '', is_active: true,
  });
  const [uploading, setUploading] = useState(false);

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const path = `${user.id}/qr-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('receipts').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('receipts').getPublicUrl(path);
      setForm((f) => ({ ...f, qr_code_url: data.publicUrl }));
      toast({ title: 'QR uploaded' });
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <details className="glass rounded-2xl border border-primary/15">
      <summary className="p-4 cursor-pointer font-semibold flex items-center gap-2">
        <Plus className="w-4 h-4 text-primary" /> Add Bank / Wallet Account
      </summary>
      <div className="p-4 pt-0 grid grid-cols-2 gap-2">
        <Input placeholder="Account holder name (e.g. U Aung)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-secondary/50 col-span-2" />
        <select value={form.country} onChange={(e) => {
          const country = e.target.value;
          const defType = country === 'TH' ? 'scb' : 'bank_mm';
          setForm({ ...form, country, type: defType });
        }} className="h-10 rounded-lg bg-secondary/50 px-3 text-sm border border-border">
          <option value="MM">🇲🇲 Myanmar</option>
          <option value="TH">🇹🇭 Thailand</option>
        </select>
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="h-10 rounded-lg bg-secondary/50 px-3 text-sm border border-border">
          {form.country === 'MM' ? (
            <>
              <option value="kbz_bank">KBZ Bank</option>
              <option value="aya_bank">AYA Bank</option>
              <option value="cb_bank">CB Bank</option>
              <option value="uab_bank">UAB Bank</option>
              <option value="yoma_bank">Yoma Bank</option>
              <option value="kbz_pay">KBZ Pay</option>
              <option value="wave_pay">Wave Pay</option>
              <option value="aya_pay">AYA Pay</option>
              <option value="bank_mm">Other Bank</option>
            </>
          ) : (
            <>
              <option value="scb">SCB (Siam Commercial)</option>
              <option value="kbank">Kasikorn Bank</option>
              <option value="bbl">Bangkok Bank</option>
              <option value="ktb">Krungthai Bank</option>
              <option value="bay">Krungsri (BAY)</option>
              <option value="tmb">TMB / TTB</option>
              <option value="gsb">Government Savings</option>
              <option value="promptpay">PromptPay</option>
              <option value="truemoney">TrueMoney Wallet</option>
              <option value="bank_th">Other Thai Bank</option>
            </>
          )}
        </select>
        <Input placeholder={form.country === 'TH' ? 'Account / PromptPay number' : 'Account number / Phone'} value={form.account_info} onChange={(e) => setForm({ ...form, account_info: e.target.value })} className="bg-secondary/50 col-span-2" />

        <div className="col-span-2 space-y-2">
          <Label className="text-xs text-muted-foreground">QR code image (upload)</Label>
          <div className="flex items-center gap-3">
            {form.qr_code_url && (
              <img src={form.qr_code_url} alt="QR preview" className="w-16 h-16 rounded-lg object-cover border border-primary/20" />
            )}
            <label className="flex-1 cursor-pointer">
              <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
              <div className="h-11 rounded-xl bg-secondary/50 border border-dashed border-primary/30 flex items-center justify-center gap-2 text-sm">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4 text-primary" />}
                <span>{uploading ? 'Uploading…' : form.qr_code_url ? 'Replace QR image' : 'Upload QR image'}</span>
              </div>
            </label>
          </div>
        </div>

        <Button disabled={saving || !form.name || uploading} onClick={() => { onSave(form); setForm({ ...form, name: '', account_info: '', qr_code_url: '' }); }}
                className="col-span-2 neon-gradient text-primary-foreground h-11 rounded-xl">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
        </Button>
      </div>
    </details>
  );
};



export default Admin;
