import React, { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow-md py-4 px-6">
        {/* Header content goes here */}
        <div className="container mx-auto">
          Header
        </div>
      </header>

      <main className="flex-grow container mx-auto px-6 py-8">
        {children}
      </main>

      <footer className="bg-gray-800 text-white py-6 px-6">
        {/* Footer content goes here */}
        <div className="container mx-auto text-center">
          Footer &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Layout;