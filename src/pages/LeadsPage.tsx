import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { getLeads, LeadListItem } from '../lib/supabase-queries';
import LeadDetailPanel from '../components/LeadDetailPanel';
import { CURRENT_USER_ID } from '../lib/constants';

const segmentColors = {
  HOT: 'bg-red-500/20 text-red-500',
  WARM: 'bg-amber-500/20 text-amber-500',
  COLD: 'bg-blue-500/20 text-blue-500',
  DEAD: 'bg-gray-500/20 text-gray-500',
};

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-apple-green/20 text-apple-green',
  CONTACTED: 'bg-apple-blue/20 text-apple-blue',
  REPLIED: 'bg-purple-500/20 text-purple-500',
  NOT_INTERESTED: 'bg-gray-500/20 text-gray-500',
  NEW: 'bg-cyan-500/20 text-cyan-500',
};

const formatFullName = (first: string | null, last: string | null): string => {
  const firstName = first || '';
  const lastName = last || '';
  return `${firstName} ${lastName}`.trim() || 'N/A';
};

const formatRelativeTime = (dateString: string | null): string => {
  if (!dateString) return 'Never';

  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return '1 day ago';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 14) return '1 week ago';
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 60) return '1 month ago';
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string>('All');
  const [selectedActivity, setSelectedActivity] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const itemsPerPage = 25;

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getLeads({
        userId: CURRENT_USER_ID,
        page: currentPage,
        pageSize: itemsPerPage,
        searchTerm,
        segmentFilter: selectedSegment === 'All' ? 'all' : selectedSegment,
        statusFilter,
        activityFilter: selectedActivity === 'All' ? 'all' : selectedActivity,
      });

      setLeads(result.leads);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (error: any) {
      console.error('═══ LEADS FETCH ERROR ═══');
      console.error('Full error object:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      console.error('═══════════════════════════');
      setError('Failed to load leads. Please try again.');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedSegment, selectedActivity, statusFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSegment, selectedActivity, statusFilter]);

  const handleExport = () => {
    const csvRows = [
      'WhatsApp Number,First Name,Last Name,Icebreaker',
      ...leads.map(lead => {
        const phone = lead.phone_number || '';
        const phoneWithPlus = phone && !phone.startsWith('+') ? '+' + phone : phone;
        const firstName = lead.first_name || '';
        const lastName = lead.last_name || '';
        return `${phoneWithPlus},${firstName},${lastName},`;
      })
    ];

    const csv = csvRows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRowClick = (leadId: string) => {
    setSelectedLeadId(leadId);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="glass dark:glass-dark rounded-2xl p-4 sm:p-6 shadow-lg">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-600" />
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 glass dark:glass-dark rounded-xl focus:ring-2 focus:ring-apple-blue outline-none transition-smooth text-gray-900 dark:text-white placeholder-gray-500"
                aria-label="Search leads"
              />
            </div>
            <button
              onClick={handleExport}
              disabled={leads.length === 0}
              className="px-6 py-3 bg-apple-blue text-white rounded-xl font-semibold hover:scale-[1.02] hover:opacity-90 transition-smooth flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-apple-blue whitespace-nowrap"
              aria-label="Export filtered leads to CSV"
            >
              <Download className="w-5 h-5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass dark:glass-dark rounded-xl p-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Filter by Segment
              </label>
              <div className="flex flex-wrap gap-3">
                {['All', 'HOT', 'WARM', 'COLD'].map((segment) => (
                  <label
                    key={segment}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-smooth hover:scale-[1.02] ${
                      selectedSegment === segment
                        ? 'bg-apple-blue text-white shadow-md'
                        : 'glass dark:glass-dark text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="segment"
                      value={segment}
                      checked={selectedSegment === segment}
                      onChange={(e) => setSelectedSegment(e.target.value)}
                      className="sr-only"
                      aria-label={`Filter by ${segment} segment`}
                    />
                    <span className="text-sm font-semibold">{segment}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="glass dark:glass-dark rounded-xl p-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Filter by Activity
              </label>
              <div className="flex flex-wrap gap-3">
                {['All', 'Never Contacted', 'Contacted', 'Replied'].map((activity) => (
                  <label
                    key={activity}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-smooth hover:scale-[1.02] ${
                      selectedActivity === activity
                        ? 'bg-apple-blue text-white shadow-md'
                        : 'glass dark:glass-dark text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="activity"
                      value={activity}
                      checked={selectedActivity === activity}
                      onChange={(e) => setSelectedActivity(e.target.value)}
                      className="sr-only"
                      aria-label={`Filter by ${activity} activity`}
                    />
                    <span className="text-sm font-semibold">{activity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-600 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-3 glass dark:glass-dark rounded-xl focus:ring-2 focus:ring-apple-blue outline-none transition-smooth text-gray-900 dark:text-white appearance-none cursor-pointer"
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="CONTACTED">Contacted</option>
              <option value="REPLIED">Replied</option>
              <option value="NOT_INTERESTED">Not Interested</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 glass dark:glass-dark rounded-xl p-4 flex items-center gap-3 text-red-500">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue"></div>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full" role="table" aria-label="Leads table">
                <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                  <tr>
                    <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Phone
                    </th>
                    <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Segment
                    </th>
                    <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Last Contact
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/30 dark:divide-gray-700/30">
                  {leads.map((lead, index) => (
                    <tr
                      key={lead.id}
                      onClick={() => handleRowClick(lead.id)}
                      className={`hover:bg-apple-blue/5 dark:hover:bg-apple-blue/10 transition-smooth cursor-pointer ${
                        index % 2 === 0 ? 'bg-gray-50/20 dark:bg-gray-800/10' : ''
                      }`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{formatFullName(lead.first_name, lead.last_name)}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-600 dark:text-gray-400">{lead.phone_number}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${segmentColors[lead.segment as keyof typeof segmentColors] || 'bg-gray-500/20 text-gray-500'}`}>
                          {lead.segment}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${lead.status ? statusColors[lead.status] || 'bg-gray-500/20 text-gray-500' : 'bg-gray-500/20 text-gray-500'}`}>
                          {lead.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-500">{formatRelativeTime(lead.last_contacted_date)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {totalCount > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, totalCount)} of {totalCount} leads
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 glass dark:glass-dark rounded-xl hover:scale-105 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <span className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2 glass dark:glass-dark rounded-xl hover:scale-105 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <LeadDetailPanel
        leadId={selectedLeadId || ''}
        isOpen={selectedLeadId !== null}
        onClose={() => setSelectedLeadId(null)}
      />
    </div>
  );
}
