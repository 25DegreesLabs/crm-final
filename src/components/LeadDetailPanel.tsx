import { X, Mail, Phone, MapPin, Calendar, MessageSquare, Users, AlertCircle, Info, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getLeadDetail, LeadDetail } from '../lib/supabase-queries';

interface LeadDetailPanelProps {
  leadId: string;
  isOpen: boolean;
  onClose: () => void;
}

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

export default function LeadDetailPanel({ leadId, isOpen, onClose }: LeadDetailPanelProps) {
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && leadId) {
      setLoading(true);
      setError(null);

      getLeadDetail(leadId)
        .then((data) => {
          setLead(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error loading lead details:', err);
          setError('Failed to load lead details');
          setLoading(false);
        });
    }
  }, [leadId, isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-detail-title"
    >
      <div
        className="glass dark:glass-dark rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl modal-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 glass dark:glass-dark rounded-t-3xl px-6 py-5 flex items-center justify-between border-b border-gray-200/30 dark:border-gray-700/30 z-10">
          <h2 id="lead-detail-title" className="text-2xl font-bold text-gray-900 dark:text-white">
            Lead Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-xl transition-smooth focus:outline-none focus:ring-2 focus:ring-apple-blue"
            aria-label="Close panel"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue"></div>
            </div>
          )}

          {error && (
            <div className="glass dark:glass-dark rounded-xl p-4 flex items-center gap-3 text-red-500">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && lead && (
            <div className="space-y-6">
              <div className="glass dark:glass-dark rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {formatFullName(lead.first_name, lead.last_name)}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${segmentColors[lead.segment as keyof typeof segmentColors] || 'bg-gray-500/20 text-gray-500'}`}>
                        {lead.segment}
                      </span>
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${lead.status ? statusColors[lead.status] || 'bg-gray-500/20 text-gray-500' : 'bg-gray-500/20 text-gray-500'}`}>
                        {lead.status || 'N/A'}
                      </span>
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-gray-500/20 text-gray-500">
                        Score: {lead.lead_score}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400 dark:text-gray-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Phone</p>
                      <p className="text-sm font-mono text-gray-900 dark:text-white">{lead.phone_number}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400 dark:text-gray-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Email</p>
                      <p className="text-sm text-gray-900 dark:text-white break-all">
                        {lead.email || <span className="text-gray-500 dark:text-gray-500 italic">— (Not provided)</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-400 dark:text-gray-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Source</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {lead.scrape_source || <span className="text-gray-500 dark:text-gray-500 italic">— (Not tracked)</span>}
                      </p>
                    </div>
                  </div>

                  {lead.nationality && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-500">Nationality</p>
                        <p className="text-sm text-gray-900 dark:text-white">{lead.nationality}</p>
                      </div>
                    </div>
                  )}

                  {lead.preferred_language && (
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-gray-400 dark:text-gray-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-500">Language</p>
                        <p className="text-sm text-gray-900 dark:text-white">{lead.preferred_language}</p>
                      </div>
                    </div>
                  )}
                </div>

                {lead.bio_snippet && (
                  <div className="mt-4 pt-4 border-t border-gray-200/30 dark:border-gray-700/30">
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Bio</p>
                    <p className="text-sm text-gray-900 dark:text-white">{lead.bio_snippet}</p>
                  </div>
                )}
              </div>

              <div className="glass dark:glass-dark rounded-2xl p-6">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Contact History
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">First Contact</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatRelativeTime(lead.first_contacted_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Last Contact</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatRelativeTime(lead.last_contacted_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Contact Count</p>
                    <p className="text-sm text-gray-900 dark:text-white">{lead.contact_count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Reply Status</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {lead.reply_received ? `Yes (${formatRelativeTime(lead.last_reply_date)})` : 'No'}
                    </p>
                  </div>
                </div>
              </div>

              {(lead.positive_signal_groups && lead.positive_signal_groups.length > 0) && (
                <div className="glass dark:glass-dark rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    WhatsApp Groups
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {lead.positive_signal_groups.map((group, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-xs font-semibold rounded-full bg-apple-green/20 text-apple-green"
                      >
                        {group}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {lead.do_not_contact && (
                <div className="glass dark:glass-dark rounded-2xl p-6 border-2 border-red-500/30">
                  <h4 className="text-lg font-bold text-red-500 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Do Not Contact
                  </h4>
                  {lead.do_not_contact_reason && (
                    <p className="text-sm text-gray-900 dark:text-white">{lead.do_not_contact_reason}</p>
                  )}
                </div>
              )}

              {lead.notes && (
                <div className="glass dark:glass-dark rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Notes
                  </h4>
                  <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{lead.notes}</p>
                </div>
              )}

              <div className="glass dark:glass-dark rounded-2xl p-6">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Technical Details</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className="text-gray-500 dark:text-gray-500">First Seen</p>
                    <p className="text-gray-900 dark:text-white">{formatRelativeTime(lead.first_seen_date)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-500">Scrape Count</p>
                    <p className="text-gray-900 dark:text-white">{lead.scrape_appearance_count}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-500">Contact Status</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {lead.last_contacted_date
                        ? (lead.reply_received
                            ? <span className="text-green-400 font-semibold">Replied</span>
                            : <span className="text-blue-400 font-semibold">Contacted</span>)
                        : <span className="text-gray-400">Not Contacted</span>
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-500">Send Failures</p>
                    <p className="text-gray-900 dark:text-white">{lead.send_failures}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-500">Total Groups</p>
                    <p className="text-gray-900 dark:text-white">{lead.total_groups_count}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-500">Group Score</p>
                    <p className="text-gray-900 dark:text-white">{lead.group_net_score}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
