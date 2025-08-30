
// myco-react-app/src/app/business/layout.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const navLinks = [
    { href: '/business/overview', label: 'Overview' },
    { href: '/business/team', label: 'Team' },
    { href: '/business/technology', label: 'Technology' },
    { href: '/business/partnerships', label: 'Partnerships' },
    { href: '/business/financials', label: 'Financials' },
  ];

  return (
    <div>
      <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-center space-x-2 lg:space-x-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  href={link.href} 
                  key={link.href}
                  className={`text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-teal-600 text-white shadow-md' 
                      : 'text-slate-600 hover:text-teal-600 hover:bg-teal-50/50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
