import { Sidebar } from './sidebar';
import { Header } from './header';
import { motion } from 'framer-motion';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f0f0f0]">
      <Sidebar />
      
      <div className="flex-1 lg:ml-72 flex flex-col min-w-0">
        <Header title={title} description={description} />
        
        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 sm:p-8 lg:p-10 flex-1"
        >
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </motion.main>
        
        <footer className="p-6 border-t-[4px] border-black bg-white flex justify-between items-center">
          <p className="text-sm font-black uppercase italic">© 2026 BRUTAL DASHBOARD v1.0.0</p>
          <div className="flex gap-4">
            <div className="w-4 h-4 bg-primary border-[2px] border-black shadow-[2px_2px_0px_000000]"></div>
            <div className="w-4 h-4 bg-secondary border-[2px] border-black shadow-[2px_2px_0px_000000]"></div>
            <div className="w-4 h-4 bg-warning border-[2px] border-black shadow-[2px_2px_0px_000000]"></div>
          </div>
        </footer>
      </div>
    </div>
  );
}