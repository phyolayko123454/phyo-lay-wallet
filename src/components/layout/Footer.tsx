import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
                <span className="text-primary-foreground font-serif font-bold text-lg">P</span>
              </div>
              <span className="font-serif text-xl font-bold gold-gradient-text">
                PHYO LAY Top-up
              </span>
            </div>
            <p className="text-muted-foreground text-sm max-w-md">
              Fast, secure, and reliable top-up services for Myanmar & Thai mobile, games, and gift cards.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link to="/topup" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  {t('topUp')}
                </Link>
              </li>
              <li>
                <Link to="/wallet" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  {t('wallet')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  {t('termsOfService')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  {t('privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  {t('contactUs')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">{t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
