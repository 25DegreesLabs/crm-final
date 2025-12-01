import { X, Flame, Thermometer, Snowflake, Eye, Send } from 'lucide-react';
import { useState } from 'react';

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  lastContact: string;
}

const mockLeads: Record<string, Lead[]> = {
  HOT: [
    { id: 1, name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '(555) 123-4567', lastContact: '2 days ago' },
    { id: 2, name: 'Michael Chen', email: 'mchen@email.com', phone: '(555) 234-5678', lastContact: '3 days ago' },
    { id: 3, name: 'Emily Rodriguez', email: 'emily.r@email.com', phone: '(555) 345-6789', lastContact: '1 day ago' },
    { id: 4, name: 'David Park', email: 'dpark@email.com', phone: '(555) 456-7890', lastContact: '4 days ago' },
    { id: 5, name: 'Jessica Williams', email: 'jwilliams@email.com', phone: '(555) 567-8901', lastContact: '2 days ago' },
  ],
  WARM: [
    { id: 6, name: 'Robert Taylor', email: 'rtaylor@email.com', phone: '(555) 678-9012', lastContact: '2 weeks ago' },
    { id: 7, name: 'Amanda White', email: 'awhite@email.com', phone: '(555) 789-0123', lastContact: '10 days ago' },
    { id: 8, name: 'Christopher Lee', email: 'clee@email.com', phone: '(555) 890-1234', lastContact: '12 days ago' },
    { id: 9, name: 'Lauren Martinez', email: 'lmartinez@email.com', phone: '(555) 901-2345', lastContact: '8 days ago' },
    { id: 10, name: 'Daniel Brown', email: 'dbrown@email.com', phone: '(555) 012-3456', lastContact: '15 days ago' },
  ],
  COLD: [
    { id: 11, name: 'Michelle Davis', email: 'mdavis@email.com', phone: '(555) 123-9876', lastContact: '2 months ago' },
    { id: 12, name: 'James Wilson', email: 'jwilson@email.com', phone: '(555) 234-8765', lastContact: '3 months ago' },
    { id: 13, name: 'Nicole Anderson', email: 'nanderson@email.com', phone: '(555) 345-7654', lastContact: '1 month ago' },
    { id: 14, name: 'Kevin Thomas', email: 'kthomas@email.com', phone: '(555) 456-6543', lastContact: '45 days ago' },
    { id: 15, name: 'Stephanie Moore', email: 'smoore@email.com', phone: '(555) 567-5432', lastContact: '2 months ago' },
  ],
};

interface StartCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StartCampaignModal({ isOpen, onClose }: StartCampaignModalProps) {
  const [campaignName, setCampaignName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'HOT' | 'WARM' | 'COLD'>('HOT');
  const [showPreview, setShowPreview] = useState(false);

  if (!isOpen) return null;

  const previewLeads = mockLeads[selectedCategory];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="glass dark:glass-dark rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl modal-scale-in"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="sticky top-0 glass dark:glass-dark rounded-t-3xl px-4 sm:px-6 py-5 flex items-center justify-between border-b border-gray-200/30 dark:border-gray-700/30">
          <h2 id="modal-title" className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Start New Campaign</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-xl transition-smooth focus:outline-none focus:ring-2 focus:ring-apple-blue"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          <div>
            <label htmlFor="campaign-name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Campaign Name
            </label>
            <input
              id="campaign-name"
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="e.g., Spring Wedding Special"
              className="w-full px-4 py-3 glass dark:glass-dark rounded-xl focus:ring-2 focus:ring-apple-blue outline-none transition-smooth text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500"
              aria-required="true"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Lead Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="group" aria-label="Lead category selection">
              <button
                onClick={() => setSelectedCategory('HOT')}
                className={`p-5 rounded-2xl transition-smooth hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                  selectedCategory === 'HOT'
                    ? 'glass dark:glass-dark shadow-lg ring-2 ring-red-500'
                    : 'glass dark:glass-dark shadow-md'
                }`}
                aria-pressed={selectedCategory === 'HOT'}
              >
                <Flame className={`w-7 h-7 mx-auto mb-2 ${
                  selectedCategory === 'HOT' ? 'text-red-500' : 'text-gray-400 dark:text-gray-600'
                }`} />
                <div className="text-sm font-bold text-gray-900 dark:text-white">HOT</div>
                <div className="text-xs font-mono text-gray-600 dark:text-gray-400 mt-1">65 leads</div>
              </button>

              <button
                onClick={() => setSelectedCategory('WARM')}
                className={`p-5 rounded-2xl transition-smooth hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${
                  selectedCategory === 'WARM'
                    ? 'glass dark:glass-dark shadow-lg ring-2 ring-amber-500'
                    : 'glass dark:glass-dark shadow-md'
                }`}
                aria-pressed={selectedCategory === 'WARM'}
              >
                <Thermometer className={`w-7 h-7 mx-auto mb-2 ${
                  selectedCategory === 'WARM' ? 'text-amber-500' : 'text-gray-400 dark:text-gray-600'
                }`} />
                <div className="text-sm font-bold text-gray-900 dark:text-white">WARM</div>
                <div className="text-xs font-mono text-gray-600 dark:text-gray-400 mt-1">85 leads</div>
              </button>

              <button
                onClick={() => setSelectedCategory('COLD')}
                className={`p-5 rounded-2xl transition-smooth hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  selectedCategory === 'COLD'
                    ? 'glass dark:glass-dark shadow-lg ring-2 ring-blue-500'
                    : 'glass dark:glass-dark shadow-md'
                }`}
                aria-pressed={selectedCategory === 'COLD'}
              >
                <Snowflake className={`w-7 h-7 mx-auto mb-2 ${
                  selectedCategory === 'COLD' ? 'text-blue-500' : 'text-gray-400 dark:text-gray-600'
                }`} />
                <div className="text-sm font-bold text-gray-900 dark:text-white">COLD</div>
                <div className="text-xs font-mono text-gray-600 dark:text-gray-400 mt-1">82 leads</div>
              </button>
            </div>
          </div>

          {showPreview && (
            <div className="glass dark:glass-dark rounded-2xl p-5 shadow-lg">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                Preview: {selectedCategory} Leads (Showing 5 of {mockLeads[selectedCategory].length})
              </h3>
              <div className="glass dark:glass-dark rounded-xl overflow-hidden shadow-md">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Name</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Email</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Phone</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Last Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/30 dark:divide-gray-700/30">
                    {previewLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-800/30 transition-smooth">
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{lead.name}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{lead.email}</td>
                        <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-400">{lead.phone}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-500">{lead.lastContact}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 glass dark:glass-dark rounded-b-3xl px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 border-t border-gray-200/30 dark:border-gray-700/30">
          <button
            onClick={onClose}
            className="px-5 py-2.5 glass dark:glass-dark rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:scale-[1.02] transition-smooth shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-5 py-2.5 glass dark:glass-dark rounded-xl font-semibold text-gray-900 dark:text-white hover:scale-[1.02] transition-smooth flex items-center justify-center gap-2 shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-expanded={showPreview}
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
          <button
            onClick={() => alert('Campaign started!')}
            className="px-5 py-2.5 bg-apple-blue rounded-xl font-semibold text-white hover:scale-[1.02] hover:opacity-90 transition-smooth flex items-center justify-center gap-2 shadow-lg focus:outline-none focus:ring-2 focus:ring-apple-blue focus:ring-offset-2"
          >
            <Send className="w-4 h-4" />
            Start Campaign
          </button>
        </div>
      </div>
    </div>
  );
}
