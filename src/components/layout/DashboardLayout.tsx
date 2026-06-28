import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#eff6ff] to-[#f4f7fb] selection:bg-indigo-100 selection:text-indigo-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-indigo-400/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-purple-400/10 blur-[100px] rounded-full pointer-events-none" />
        <Header />
        <main className="flex-1 overflow-y-auto p-8 z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
