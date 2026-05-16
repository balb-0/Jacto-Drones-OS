import { Bell, Search, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function Header({ title, description, children }: HeaderProps) {
  return (
    <header className="bg-white border-b-[6px] border-black sticky top-0 z-10">
      <div className="flex items-center justify-between h-24 px-6 sm:px-10">
        <div className="flex items-center gap-6">
          <button className="lg:hidden p-3 border-[3px] border-black bg-primary shadow-[3px_3px_0px_000000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all">
            <Menu className="w-6 h-6 text-black" />
          </button>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <h1 className="text-3xl font-black text-black leading-none uppercase italic tracking-tighter">{title}</h1>
            {description && (
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1 italic">{description}</p>
            )}
          </motion.div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
              <input
                type="text"
                placeholder="BUSCAR MÉTRICAS..."
                className="pl-12 pr-6 py-3 bg-[#f0f0f0] border-[4px] border-black font-black uppercase italic text-sm focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_000000] transition-all w-80 placeholder:text-gray-400"
              />
            </div>
          </div>
          
          <button className="relative p-3 border-[3px] border-black bg-white shadow-[3px_3px_0px_000000] hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[4px_4px_0px_000000] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200">
            <Bell className="w-6 h-6 text-black" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-error border-[2px] border-black rounded-full"></span>
          </button>
          
          {children}
        </div>
      </div>
    </header>
  );
}