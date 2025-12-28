import React, { useState } from 'react';
import { Plus, Pencil, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ShoppingProduct {
  id: string;
  name_en: string;
  name_my: string;
  description_en: string | null;
  description_my: string | null;
  price_thb: number;
  price_mmk: number | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
}

const ShoppingManagement: React.FC = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ShoppingProduct | null>(null);
  const [formData, setFormData] = useState({
    name_en: '',
    name_my: '',
    description_en: '',
    description_my: '',
    price_thb: '',
    price_mmk: '',
    image_url: '',
    sort_order: '0'
  });

  // Fetch products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin_shopping_products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shopping_products')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as ShoppingProduct[];
    }
  });

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('shopping_products')
        .insert({
          name_en: data.name_en,
          name_my: data.name_my,
          description_en: data.description_en || null,
          description_my: data.description_my || null,
          price_thb: parseFloat(data.price_thb),
          price_mmk: data.price_mmk ? parseFloat(data.price_mmk) : null,
          image_url: data.image_url || null,
          sort_order: parseInt(data.sort_order) || 0
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: language === 'my' ? 'ပစ္စည်းထည့်ပြီးပါပြီ' : 'Product added successfully' });
      queryClient.invalidateQueries({ queryKey: ['admin_shopping_products'] });
      queryClient.invalidateQueries({ queryKey: ['shopping_products'] });
      resetForm();
      setDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: error.message, variant: 'destructive' });
    }
  });

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('shopping_products')
        .update({
          name_en: data.name_en,
          name_my: data.name_my,
          description_en: data.description_en || null,
          description_my: data.description_my || null,
          price_thb: parseFloat(data.price_thb),
          price_mmk: data.price_mmk ? parseFloat(data.price_mmk) : null,
          image_url: data.image_url || null,
          sort_order: parseInt(data.sort_order) || 0
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: language === 'my' ? 'ပစ္စည်းပြင်ပြီးပါပြီ' : 'Product updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['admin_shopping_products'] });
      queryClient.invalidateQueries({ queryKey: ['shopping_products'] });
      resetForm();
      setDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: error.message, variant: 'destructive' });
    }
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shopping_products')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: language === 'my' ? 'ပစ္စည်းဖျက်ပြီးပါပြီ' : 'Product deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['admin_shopping_products'] });
      queryClient.invalidateQueries({ queryKey: ['shopping_products'] });
    },
    onError: (error: any) => {
      toast({ title: error.message, variant: 'destructive' });
    }
  });

  const resetForm = () => {
    setFormData({
      name_en: '',
      name_my: '',
      description_en: '',
      description_my: '',
      price_thb: '',
      price_mmk: '',
      image_url: '',
      sort_order: '0'
    });
    setEditingProduct(null);
  };

  const handleEdit = (product: ShoppingProduct) => {
    setEditingProduct(product);
    setFormData({
      name_en: product.name_en,
      name_my: product.name_my,
      description_en: product.description_en || '',
      description_my: product.description_my || '',
      price_thb: String(product.price_thb),
      price_mmk: product.price_mmk ? String(product.price_mmk) : '',
      image_url: product.image_url || '',
      sort_order: String(product.sort_order)
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name_en || !formData.name_my || !formData.price_thb) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const activeProducts = products.filter(p => p.is_active);

  return (
    <div className="card-premium p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          {t('onlineShopping')}
        </h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gold-gradient text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              {t('addProduct')}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? t('edit') : t('addProduct')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('productName')} (EN) *</Label>
                  <Input
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    className="bg-secondary mt-1"
                    required
                  />
                </div>
                <div>
                  <Label>{t('productName')} (MY) *</Label>
                  <Input
                    value={formData.name_my}
                    onChange={(e) => setFormData({ ...formData, name_my: e.target.value })}
                    className="bg-secondary mt-1"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('description')} (EN)</Label>
                  <Textarea
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    className="bg-secondary mt-1"
                    rows={2}
                  />
                </div>
                <div>
                  <Label>{t('description')} (MY)</Label>
                  <Textarea
                    value={formData.description_my}
                    onChange={(e) => setFormData({ ...formData, description_my: e.target.value })}
                    className="bg-secondary mt-1"
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('price')} (THB) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price_thb}
                    onChange={(e) => setFormData({ ...formData, price_thb: e.target.value })}
                    className="bg-secondary mt-1"
                    required
                  />
                </div>
                <div>
                  <Label>{t('price')} (MMK)</Label>
                  <Input
                    type="number"
                    value={formData.price_mmk}
                    onChange={(e) => setFormData({ ...formData, price_mmk: e.target.value })}
                    className="bg-secondary mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label>{t('image')} URL</Label>
                <Input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="bg-secondary mt-1"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div>
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                  className="bg-secondary mt-1"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full gold-gradient text-primary-foreground"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) 
                  ? t('loading') 
                  : (editingProduct ? t('save') : t('addProduct'))}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">{t('loading')}</p>
      ) : activeProducts.length === 0 ? (
        <p className="text-muted-foreground">{t('noData')}</p>
      ) : (
        <div className="space-y-3">
          {activeProducts.map((product) => (
            <div key={product.id} className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name_en}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {language === 'my' ? product.name_my : product.name_en}
                </p>
                <p className="text-sm text-primary font-semibold">
                  {product.price_thb} ฿
                  {product.price_mmk && ` / ${product.price_mmk} Ks`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleEdit(product)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(product.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShoppingManagement;