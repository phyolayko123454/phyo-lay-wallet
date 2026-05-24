import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Receipt, Wallet, User } from 'lucide-react';

const BottomNav: React.FC = () => {
  const items = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/history', icon: Receipt, label: 'Orders' },
    { to: '/wallet', icon: Wallet, label: 'Wallet' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40">
      <div className="mx-3 mb-3 glass rounded-2xl border border-primary/15 shadow-[0_-10px_40px_-10px_hsl(210_100%_60%_/_0.35)]">
        <ul className="grid grid-cols-4 items-center h-16 px-1">
          {items.map((it) => (
            <NavItem key={it.to} {...it} />
          ))}
        </ul>
      </div>
    </nav>
  );
};

const NavItem: React.FC<{ to: string; icon: React.ComponentType<any>; label: string }> = ({
  to, icon: Icon, label,
}) => (
  <li>
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl transition-all ${
          isActive ? 'text-primary' : 'text-muted-foreground'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className={`relative ${isActive ? 'drop-shadow-[0_0_8px_hsl(210_100%_60%_/_0.8)]' : ''}`}>
            <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
          </div>
          <span className="text-[10px] font-medium">{label}</span>
        </>
      )}
    </NavLink>
  </li>
);

export default BottomNav;
