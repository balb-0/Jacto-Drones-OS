import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Activity, 
  Settings, 
  GitBranch,
  BarChart3,
  Zap
} from 'lucide-react';

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
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-slate-900">
      <div className="flex items-center h-16 px-6 bg-slate-950">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold text-lg">Jacto Drones OS</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
            <span className="text-white text-sm font-medium">G4</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Grupo 04</p>
            <p className="text-xs text-slate-400 truncate">Jacto Drones</p>
          </div>
        </div>
      </div>
    </div>
  );
}