import { useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/campaigns': 'Campaigns',
  '/contacts': 'Contacts',
};

export function Header() {
  const { pathname } = useLocation();
  const user = useAuthStore((state) => state.user);
  const title = pageTitles[pathname] ?? 'PropNexAi';

  return (
    <header className="h-16 glass border-b border-white/40 flex items-center justify-between px-8 z-20 relative shadow-sm sticky top-0">
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-5">
        <button className="relative p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="h-6 w-[1px] bg-slate-200"></div>
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-md group-hover:shadow-lg transition-all duration-200">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">{user?.name}</span>
            <span className="block text-xs text-slate-400">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
