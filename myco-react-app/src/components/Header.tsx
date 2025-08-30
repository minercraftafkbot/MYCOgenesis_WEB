import Link from 'next/link';
import Image from 'next/image';

function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 transition-all duration-300">
      <nav className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <Image 
            src="/images/logo/MYCOgenesis.svg" 
            alt="MYCOgenesis Logo" 
            width={48} 
            height={48}
            className="h-10 w-10 sm:h-12 sm:w-12 mr-2 sm:mr-3"
          />
          <span className="font-bold text-lg sm:text-xl text-slate-700">MYCOGenesis</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-2 xl:space-x-6">
          <Link href="/" className="text-slate-600 hover:text-teal-600 px-1 py-2 rounded-md text-sm font-medium hover:bg-teal-50/50 transition-all duration-200">
            Home
          </Link>
          <Link href="/about" className="text-slate-600 hover:text-teal-600 px-1 py-2 rounded-md text-sm font-medium hover:bg-teal-50/50 transition-all duration-200">
            About Us
          </Link>
          <Link href="/products" className="text-slate-600 hover:text-teal-600 px-1 py-2 rounded-md text-sm font-medium hover:bg-teal-50/50 transition-all duration-200">
            Our Mushrooms
          </Link>
          <Link href="/business/technology" className="text-slate-600 hover:text-teal-600 px-1 py-2 rounded-md text-sm font-medium hover:bg-teal-50/50 transition-all duration-200">
            Smart Farm
          </Link>
          <Link href="/shop" className="text-slate-600 hover:text-teal-600 px-1 py-2 rounded-md text-sm font-medium hover:bg-teal-50/50 transition-all duration-200">
            Shop
          </Link>
          <Link href="/blog" className="text-slate-600 hover:text-teal-600 px-1 py-2 rounded-md text-sm font-medium hover:bg-teal-50/50 transition-all duration-200">
            Blog
          </Link>
          <Link href="/contact" className="text-slate-600 hover:text-teal-600 px-1 py-2 rounded-md text-sm font-medium hover:bg-teal-50/50 transition-all duration-200">
            Contact
          </Link>
        </div>

        {/* Authentication Section */}
        <div className="hidden lg:flex items-center space-x-4 ml-4 pl-4 border-l border-slate-200">
          <Link href="/auth/login" className="text-slate-600 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-50/50 transition-all duration-200">
            Login
          </Link>
          <Link href="/auth/signup" className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md">
            Sign Up
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button className="text-slate-600 hover:text-teal-600 p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Header;