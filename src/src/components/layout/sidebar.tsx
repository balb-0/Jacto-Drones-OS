import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Activity, 
  Settings, 
  GitBranch,
  BarChart3,
  Zap,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const navigation = [
  { name: 'Visão Geral', href: '/', icon: LayoutDashboard },
  { name: 'QoS - Qualidade de Serviço', href: '/qos', icon: Zap },
  { name: 'QoP - Qualidade de Processo', href: '/qop', icon: BarChart3 },
  { name: 'Pipeline', href: '/pipeline', icon: GitBranch },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 bg-white border-r-[6px] border-black z-20">
      <div className="flex items-center h-24 px-8 border-b-[6px] border-black bg-primary">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ rotate: 180 }}
            className="w-12 h-12 bg-black border-[4px] border-white shadow-[4px_4px_0px_000000] flex items-center justify-center"
          >
            <Activity className="w-6 h-6 text-primary" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-black font-black text-xl uppercase italic leading-none">JACTO</span>
            <span className="text-black font-black text-sm uppercase italic tracking-tighter">DRONES OS</span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-8 space-y-3 overflow-y-auto bg-[#f9f9f9]">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-4 px-4 py-4 font-black uppercase italic tracking-tight transition-all border-[4px] border-transparent',
                isActive 
                  ? 'bg-black text-white border-black shadow-[4px_4px_0px_var(--color-primary)]' 
                  : 'text-black hover:bg-white hover:border-black hover:shadow-[3px_3px_0px_000000]'
              )}
            >
              <Icon className={cn("w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-black")} />
              <span className="flex-1">{item.name}</span>
              {isActive && <ChevronRight className="w-5 h-5 text-primary" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t-[6px] border-black bg-secondary">
        <div className="flex items-center gap-4 p-4 bg-white border-[4px] border-black shadow-[4px_4px_0px_000000]">
          <div className="w-12 h-12 border-[3px] border-black bg-primary flex items-center justify-center font-black text-xl italic">
            G4
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-black truncate uppercase italic">Grupo 04</p>
            <p className="text-[10px] font-bold text-gray-600 truncate uppercase tracking-widest">SISTEMA ATIVO</p>
          </div>
        </div>
      </div>
    </div>
  );
}