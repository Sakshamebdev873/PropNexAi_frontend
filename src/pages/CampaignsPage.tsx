import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Play, Pause, Trash2, Megaphone,
  Mail, Eye, MousePointer, Calendar
} from 'lucide-react';
import { campaignsService } from '@/services/campaigns.service';
import { useSocket } from '@/hooks/useSocket';
import type { Campaign, CampaignProgressEvent, CampaignCompletedEvent } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/shared/ProgressBar';
import axios from 'axios';

interface CreateForm {
  name: string;
  subject: string;
  body: string;
}

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: (c: Campaign) => void }) {
  const [form, setForm] = useState<CreateForm>({ name: '', subject: '', body: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.name || !form.subject || !form.body) {
      setError('All fields are required');
      return;
    }
    setLoading(true);
    try {
      const campaign = await campaignsService.create(form);
      onCreated(campaign);
      onClose();
    } catch (err) {
      setError(axios.isAxiosError(err) ? (err.response?.data?.message ?? 'Failed') : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900 text-lg">New Campaign</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Campaign Name</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Q4 Property Launch"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Email Subject</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Exclusive Properties Now Available!"
              value={form.subject}
              onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Email Body</label>
            <textarea
              rows={5}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Dear {{name}}, we are excited to share..."
              value={form.body}
              onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => void handleSubmit()} loading={loading}>Create Campaign</Button>
        </div>
      </div>
    </div>
  );
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const socket = useSocket();

  const fetchCampaigns = useCallback(async () => {
    try {
      const data = await campaignsService.getAll();
      setCampaigns(data);
    } catch {
      // no-op
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCampaigns();
  }, [fetchCampaigns]);

  // Join WebSocket rooms for active campaigns
  useEffect(() => {
    if (!socket) return;
    campaigns
      .filter((c) => c.status === 'ACTIVE')
      .forEach((c) => socket.emit('campaign:join', c.id));
  }, [socket, campaigns]);

  // Listen for live progress updates
  useEffect(() => {
    if (!socket) return;

    const onProgress = (event: CampaignProgressEvent) => {
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === event.campaignId
            ? { ...c, sent: event.sent, opened: event.opened, clicked: event.clicked }
            : c
        )
      );
    };

    const onCompleted = (event: CampaignCompletedEvent) => {
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === event.campaignId
            ? { ...c, status: 'COMPLETED', sent: event.sent, opened: event.opened, clicked: event.clicked }
            : c
        )
      );
    };

    socket.on('campaign:progress', onProgress);
    socket.on('campaign:completed', onCompleted);

    return () => {
      socket.off('campaign:progress', onProgress);
      socket.off('campaign:completed', onCompleted);
    };
  }, [socket]);

  const handleStart = async (id: string) => {
    setActionLoading(id);
    try {
      const updated = await campaignsService.start(id);
      setCampaigns((prev) => prev.map((c) => (c.id === id ? updated : c)));
      socket?.emit('campaign:join', id);
    } catch {
      // no-op
    } finally {
      setActionLoading(null);
    }
  };

  const handlePause = async (id: string) => {
    setActionLoading(id);
    try {
      const updated = await campaignsService.pause(id);
      setCampaigns((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch {
      // no-op
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this campaign?')) return;
    setActionLoading(id);
    try {
      await campaignsService.delete(id);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // no-op
    } finally {
      setActionLoading(null);
    }
  };

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
    <div className="space-y-6">
      {showModal && (
        <CreateModal
          onClose={() => setShowModal(false)}
          onCreated={(c) => setCampaigns((prev) => [c, ...prev])}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Campaigns</h2>
          <p className="text-sm text-slate-500 mt-0.5">{campaigns.length} total</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Campaign
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Megaphone size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium mb-2">No campaigns yet</p>
            <p className="text-slate-400 text-sm mb-6">Create your first campaign to get started</p>
            <Button onClick={() => setShowModal(true)}>
              <Plus size={16} /> Create Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => {
            const percentage = campaign.total > 0
              ? Math.round((campaign.sent / campaign.total) * 100)
              : 0;
            const isLoading = actionLoading === campaign.id;

            return (
              <Card key={campaign.id} className={campaign.status === 'ACTIVE' ? 'border-emerald-200 ring-1 ring-emerald-100' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-slate-900 truncate">{campaign.name}</h3>
                        <StatusBadge status={campaign.status} />
                      </div>
                      <p className="text-sm text-slate-500 mt-1 truncate flex items-center gap-1.5">
                        <Mail size={13} /> {campaign.subject}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {campaign.status === 'DRAFT' || campaign.status === 'PAUSED' ? (
                        <Button
                          size="sm"
                          onClick={() => void handleStart(campaign.id)}
                          loading={isLoading}
                        >
                          <Play size={13} /> Start
                        </Button>
                      ) : campaign.status === 'ACTIVE' ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => void handlePause(campaign.id)}
                          loading={isLoading}
                        >
                          <Pause size={13} /> Pause
                        </Button>
                      ) : null}
                      {(campaign.status === 'DRAFT' || campaign.status === 'COMPLETED' || campaign.status === 'FAILED') && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void handleDelete(campaign.id)}
                          disabled={isLoading}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={13} />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress bar */}
                  <ProgressBar
                    value={campaign.sent}
                    max={campaign.total}
                    showPercent
                    label={`${campaign.sent} of ${campaign.total} sent`}
                    color={campaign.status === 'ACTIVE' ? 'emerald' : campaign.status === 'COMPLETED' ? 'blue' : 'indigo'}
                  />

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                      <Mail size={14} className="text-indigo-500" />
                      <div>
                        <p className="text-xs text-slate-400">Sent</p>
                        <p className="text-sm font-semibold text-slate-800">{campaign.sent}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                      <Eye size={14} className="text-emerald-500" />
                      <div>
                        <p className="text-xs text-slate-400">Opened</p>
                        <p className="text-sm font-semibold text-slate-800">
                          {campaign.opened}
                          <span className="text-xs font-normal text-slate-400 ml-1">
                            ({campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0}%)
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                      <MousePointer size={14} className="text-purple-500" />
                      <div>
                        <p className="text-xs text-slate-400">Clicked</p>
                        <p className="text-sm font-semibold text-slate-800">
                          {campaign.clicked}
                          <span className="text-xs font-normal text-slate-400 ml-1">
                            ({campaign.sent > 0 ? Math.round((campaign.clicked / campaign.sent) * 100) : 0}%)
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {campaign.status === 'ACTIVE' && (
                    <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Live — {percentage}% complete · updating in real-time via WebSocket
                    </div>
                  )}

                  {campaign.createdAt && (
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar size={11} />
                      Created {new Date(campaign.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
