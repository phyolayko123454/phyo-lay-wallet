import React from 'react';
import Header from './Header';
import Footer from './Footer';
import BottomNav from './BottomNav';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideFooter }) => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16 md:pt-20 pb-28 md:pb-0">
        {children}
      </main>
      {!hideFooter && <div className="hidden md:block"><Footer /></div>}
      {user && <BottomNav />}
    </div>
  );
};

export default Layout;
