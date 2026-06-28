import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Megaphone, Users, Activity, CheckCircle2,
  TrendingUp, ArrowRight, Plus
} from 'lucide-react';
import { campaignsService } from '@/services/campaigns.service';
import type { DashboardStats, Campaign } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/shared/ProgressBar';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

function StatCard({ label, value, icon: Icon, color, bgColor }: StatCardProps) {
  return (
    <Card className="flex items-center gap-5 p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-default">
      <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${bgColor} shadow-sm border border-white/50`}>
        <Icon size={24} className={color} />
      </div>
      <div>
        <p className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</p>
        <p className="text-sm font-medium text-slate-500 mt-0.5">{label}</p>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, c] = await Promise.all([
          campaignsService.getStats(),
          campaignsService.getAll(),
        ]);
        setStats(s);
        setCampaigns(c.slice(0, 5));
      } catch {
        // handled silently — production would log to monitoring
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin h-8 w-8 text-indigo-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Contacts"
          value={stats?.contactCount ?? 0}
          icon={Users}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          label="Total Campaigns"
          value={stats?.total ?? 0}
          icon={Megaphone}
          color="text-indigo-600"
          bgColor="bg-indigo-50"
        />
        <StatCard
          label="Active Now"
          value={stats?.active ?? 0}
          icon={Activity}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <StatCard
          label="Completed"
          value={stats?.completed ?? 0}
          icon={CheckCircle2}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
      </div>

      {/* Recent Campaigns */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-indigo-600" />
              <h2 className="font-semibold text-slate-900">Recent Campaigns</h2>
            </div>
            <Link to="/campaigns">
              <Button variant="ghost" size="sm">
                View all <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 mb-4">No campaigns yet</p>
              <Link to="/campaigns">
                <Button size="sm">
                  <Plus size={14} /> Create Campaign
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {campaigns.map((c) => (
                <div key={c.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{c.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{c.subject}</p>
                  </div>
                  <StatusBadge status={c.status} />
                  {c.total > 0 && (
                    <div className="w-32 hidden sm:block">
                      <ProgressBar value={c.sent} max={c.total} color="indigo" showPercent />
                    </div>
                  )}
                  <span className="text-sm text-slate-500 tabular-nums">
                    {c.sent}/{c.total}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/campaigns">
          <Card className="p-5 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
                <Megaphone size={22} className="text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">New Campaign</p>
                <p className="text-sm text-slate-500">Create and launch an email campaign</p>
              </div>
              <ArrowRight size={16} className="ml-auto text-slate-300 group-hover:text-indigo-500 transition-colors" />
            </div>
          </Card>
        </Link>
        <Link to="/contacts">
          <Card className="p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                <Users size={22} className="text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Import Contacts</p>
                <p className="text-sm text-slate-500">Upload a CSV to add contacts</p>
              </div>
              <ArrowRight size={16} className="ml-auto text-slate-300 group-hover:text-blue-500 transition-colors" />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
