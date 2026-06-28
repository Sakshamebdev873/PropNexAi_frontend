import { useState, useEffect, useCallback } from 'react';
import { Users, Trash2, Search, Building2, Phone, Mail } from 'lucide-react';
import { contactsService } from '@/services/contacts.service';
import type { Contact, PaginationMeta, CsvImportResult } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CsvUpload } from '@/components/shared/CsvUpload';

function ContactRow({
  contact,
  onDelete,
}: {
  contact: Contact;
  onDelete: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await contactsService.delete(contact.id);
      onDelete(contact.id);
    } catch {
      setDeleting(false);
    }
  };

  return (
    <tr className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold flex-shrink-0">
            {contact.name[0]?.toUpperCase()}
          </div>
          <span className="font-medium text-slate-800 text-sm">{contact.name}</span>
        </div>
      </td>
      <td className="px-6 py-3 text-sm text-slate-600">
        <span className="flex items-center gap-1.5">
          <Mail size={13} className="text-slate-400" />{contact.email}
        </span>
      </td>
      <td className="px-6 py-3 text-sm text-slate-500">
        {contact.phone ? (
          <span className="flex items-center gap-1.5">
            <Phone size={13} className="text-slate-400" />{contact.phone}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>
      <td className="px-6 py-3 text-sm text-slate-500">
        {contact.company ? (
          <span className="flex items-center gap-1.5">
            <Building2 size={13} className="text-slate-400" />{contact.company}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>
      <td className="px-6 py-3">
        <div className="flex gap-1 flex-wrap">
          {contact.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">
              {tag}
            </span>
          ))}
        </div>
      </td>
      <td className="px-6 py-3">
        <button
          onClick={() => void handleDelete()}
          disabled={deleting}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  const fetchContacts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const result = await contactsService.getAll({ page, limit: 20, search: search || undefined });
      setContacts(result.contacts);
      setPagination(result.pagination);
    } catch {
      // no-op
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void fetchContacts(1);
  }, [fetchContacts]);

  const handleSearch = () => {
    setSearch(searchInput);
  };

  const handleUpload = async (file: File): Promise<CsvImportResult> => {
    return contactsService.uploadCsv(file);
  };

  const handleUploadSuccess = (_result: CsvImportResult) => {
    setShowUpload(false);
    void fetchContacts(1);
  };

  const handleDelete = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Contacts</h2>
          <p className="text-sm text-slate-500 mt-0.5">{pagination.total} total</p>
        </div>
        <Button onClick={() => setShowUpload((v) => !v)}>
          Import CSV
        </Button>
      </div>

      {showUpload && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-slate-900">Import Contacts from CSV</h3>
          </CardHeader>
          <CardContent>
            <CsvUpload onUpload={handleUpload} onSuccess={handleUploadSuccess} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Search contacts..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button variant="secondary" size="sm" onClick={handleSearch}>Search</Button>
            {search && (
              <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setSearchInput(''); }}>
                Clear
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <svg className="animate-spin h-6 w-6 text-indigo-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
              </svg>
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-16">
              <Users size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">
                {search ? 'No contacts found' : 'No contacts yet'}
              </p>
              {!search && (
                <p className="text-slate-400 text-sm mt-1">Upload a CSV file to import contacts</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tags</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <ContactRow key={contact.id} contact={contact} onDelete={handleDelete} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>

        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Page {pagination.page} of {pagination.totalPages} · {pagination.total} contacts
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => void fetchContacts(pagination.page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => void fetchContacts(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
