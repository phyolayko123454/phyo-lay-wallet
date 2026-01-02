import React, { useRef } from 'react';
import { Download, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import html2canvas from 'html2canvas';
import { useLanguage } from '@/contexts/LanguageContext';

interface OrderReceiptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: {
    id: string;
    amount: number;
    currency: string;
    category_type: string;
    phone_number: string | null;
    player_id: string | null;
    created_at: string;
    processed_at: string | null;
  };
}

const OrderReceipt: React.FC<OrderReceiptProps> = ({ open, onOpenChange, order }) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSaveReceipt = async () => {
    if (!receiptRef.current) return;
    
    try {
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#1a1a2e',
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = `PHYOLAY-TopUp-Receipt-${order.id.slice(0, 8)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to save receipt:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {language === 'my' ? 'ပြေစာ' : 'Receipt'}
          </DialogTitle>
        </DialogHeader>
        
        <div 
          ref={receiptRef} 
          className="p-6 rounded-lg"
          style={{ 
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-serif font-bold gold-gradient-text">
              PHYO LAY Top-up
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {language === 'my' ? 'ငွေဖြည့်ပြေစာ' : 'Top-up Receipt'}
            </p>
          </div>

          {/* Success Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <p className="text-center text-green-400 font-semibold mb-6">
            {language === 'my' ? 'အောင်မြင်ပါသည်' : 'Successful'}
          </p>

          {/* Details */}
          <div className="space-y-3 border-t border-b border-border/50 py-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {language === 'my' ? 'အမျိုးအစား' : 'Type'}
              </span>
              <span className="text-foreground capitalize">
                {order.category_type.replace('_', ' ')}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {language === 'my' ? 'ပမာဏ' : 'Amount'}
              </span>
              <span className="text-foreground font-bold gold-gradient-text">
                {order.amount.toLocaleString()} {order.currency}
              </span>
            </div>

            {order.phone_number && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {language === 'my' ? 'ဖုန်းနံပါတ်' : 'Phone'}
                </span>
                <span className="text-foreground">{order.phone_number}</span>
              </div>
            )}

            {order.player_id && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Player ID</span>
                <span className="text-foreground">{order.player_id}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {language === 'my' ? 'ရက်စွဲ' : 'Date'}
              </span>
              <span className="text-foreground text-xs">
                {formatDate(order.processed_at || order.created_at)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {language === 'my' ? 'ပြေစာနံပါတ်' : 'Receipt No.'}
              </span>
              <span className="text-foreground font-mono text-xs">
                #{order.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            {language === 'my' 
              ? 'ကျေးဇူးတင်ပါသည်' 
              : 'Thank you for using PHYO LAY Top-up'}
          </p>
        </div>

        <Button 
          onClick={handleSaveReceipt} 
          className="w-full gold-gradient text-primary-foreground mt-4"
        >
          <Download className="w-4 h-4 mr-2" />
          {language === 'my' ? 'ပြေစာသိမ်းမည်' : 'Save Receipt'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default OrderReceipt;
