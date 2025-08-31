import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer: React.FC = () => {
  // Use a static year to avoid hydration mismatch
  const currentYear = 2025;
  
  return (
    <footer className="bg-slate-800 text-white py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <Image
                src="/images/logo/MYCOgenesis.svg"
                alt="MYCOgenesis Logo"
                width={32}
                height={32}
                className="h-8 w-8 mr-2"
              />
              <span className="font-bold text-lg">MYCOGenesis</span>
            </div>
            <p className="text-slate-300 mb-4 max-w-md">
              Cultivating tomorrow&apos;s flavors today through sustainable mushroom farming 
              with cutting-edge IoT technology and professional content management.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-slate-300">
            <li><Link href="/business/technology" className="hover:text-teal-400 transition-colors">About Us</Link></li>
            <li><Link href="/products" className="hover:text-teal-400 transition-colors">Our Mushrooms</Link></li>
              <li><Link href="/blog" className="hover:text-teal-400 transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2 text-slate-300">
              <li><Link href="/contact" className="hover:text-teal-400 transition-colors">Contact Us</Link></li>
              <li><Link href="/shop" className="hover:text-teal-400 transition-colors">Shop</Link></li>
              <li><Link href="/careers" className="hover:text-teal-400 transition-colors">Careers</Link></li>
              <li><Link href="/team" className="hover:text-teal-400 transition-colors">Our Team</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-8 text-center">
          <p className="text-slate-400 text-sm">
            &copy; {currentYear} MYCOgenesis. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;