import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Wallet, User, LogOut, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'my' : 'en');
  };

  const navItems = [
    { label: t('home'), href: '/' },
    { label: t('topUp'), href: '/topup' },
    ...(user ? [{ label: t('wallet'), href: '/wallet' }] : []),
    ...(user ? [{ label: t('history'), href: '/history' }] : []),
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
              <span className="text-primary-foreground font-serif font-bold text-lg">P</span>
            </div>
            <span className="hidden sm:block font-serif text-xl font-bold gold-gradient-text">
              PHYO LAY
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="text-muted-foreground hover:text-foreground"
            >
              <Globe className="w-5 h-5" />
            </Button>

            {user ? (
              <>
                {isAdmin && (
                  <Button variant="ghost" asChild className="text-primary">
                    <Link to="/admin">
                      <Shield className="w-4 h-4 mr-2" />
                      {t('admin')}
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" asChild>
                  <Link to="/wallet">
                    <Wallet className="w-4 h-4 mr-2" />
                    {t('wallet')}
                  </Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/profile">
                    <User className="w-4 h-4 mr-2" />
                    {t('profile')}
                  </Link>
                </Button>
                <Button variant="ghost" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('logout')}
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">{t('login')}</Link>
                </Button>
                <Button variant="default" asChild className="gold-gradient text-primary-foreground">
                  <Link to="/auth?mode=register">{t('register')}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="text-muted-foreground"
            >
              <Globe className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card border-b border-border"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              
              <div className="border-t border-border my-2 pt-2">
                {user ? (
                  <>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-primary hover:bg-secondary rounded-lg"
                      >
                        <Shield className="w-4 h-4" />
                        {t('admin')}
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-foreground hover:bg-secondary rounded-lg"
                    >
                      <User className="w-4 h-4" />
                      {t('profile')}
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-2 px-4 py-3 text-foreground hover:bg-secondary rounded-lg w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/auth"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 text-foreground hover:bg-secondary rounded-lg"
                    >
                      {t('login')}
                    </Link>
                    <Link
                      to="/auth?mode=register"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 mt-2 text-center gold-gradient text-primary-foreground rounded-lg"
                    >
                      {t('register')}
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
