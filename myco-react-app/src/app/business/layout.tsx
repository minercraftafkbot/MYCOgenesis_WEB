
// myco-react-app/src/app/business/layout.tsx
import Link from 'next/link';

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navLinks = [
    { href: '/business/overview', label: 'Overview' },
    { href: '/business/team', label: 'Team' },
    { href: '/business/technology', label: 'Technology' },
    { href: '/business/partnerships', label: 'Partnerships' },
    { href: '/business/financials', label: 'Financials' },
  ];

  return (
    <div>
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-center space-x-4 lg:space-x-8">
            {navLinks.map((link) => (
              <Link href={link.href} key={link.href} legacyBehavior>
                <a className="text-sm font-medium text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md">
                  {link.label}
                </a>
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
