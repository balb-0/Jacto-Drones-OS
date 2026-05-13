import { Bell, Search, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function Header({ title, description, children }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 lg:pl-72">
        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 text-gray-500 hover:text-gray-700">
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            {description && (
              <p className="text-sm text-gray-500 hidden sm:block">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
          </div>
          
          <button className="relative p-2 text-gray-500 hover:text-gray-700">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {children}
        </div>
      </div>
    </header>
  );
}