import Link from 'next/link'; // Using Next.js Link for navigation

function Header() {
  return (
    <header className="bg-teal-700 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo Placeholder */}
        <div className="text-xl font-bold">
          <Link href="/">
            MYCOgenesis
          </Link>
        </div>

        {/* Navigation */}
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="/" className="hover:text-teal-200 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-teal-200 transition-colors">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/shop" className="hover:text-teal-200 transition-colors">
                Shop
              </Link>
            </li>
            <li>
              <Link href="/business/overview" className="hover:text-teal-200 transition-colors">
                Business
              </Link>
            </li>
          </ul>
        </nav>

        {/* User Auth Placeholder (optional) */}
        {/* <div className="text-sm">
          <Link href="/login" className="hover:text-teal-200 transition-colors">
            Login
          </Link>
        </div> */}
      </div>
    </header>
  );
}

export default Header;