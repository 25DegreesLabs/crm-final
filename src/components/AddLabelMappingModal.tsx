import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface LabelMapping {
  id: string;
  user_id: string;
  whatsapp_label_name: string;
  crm_segment: 'COLD' | 'WARM' | 'HOT' | 'DEAD' | null;
  crm_status: 'NEW' | 'ACTIVE' | 'INACTIVE' | 'NOT_INTERESTED' | null;
  engagement_level: 'NONE' | 'ENGAGED' | 'DISENGAGED' | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AddLabelMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newLabel: {
    whatsapp_label_name: string;
    crm_segment: 'COLD' | 'WARM' | 'HOT' | 'DEAD' | null;
    crm_status: 'NEW' | 'ACTIVE' | 'INACTIVE' | 'NOT_INTERESTED' | null;
    engagement_level: 'NONE' | 'ENGAGED' | 'DISENGAGED' | null;
  }) => void;
}

export default function AddLabelMappingModal({ isOpen, onClose, onSave }: AddLabelMappingModalProps) {
  const [labelName, setLabelName] = useState('');
  const [segment, setSegment] = useState<'COLD' | 'WARM' | 'HOT' | 'DEAD'>('COLD');
  const [status, setStatus] = useState<'NEW' | 'ACTIVE' | 'INACTIVE' | 'NOT_INTERESTED'>('NEW');
  const [engagementLevel, setEngagementLevel] = useState<'NONE' | 'ENGAGED' | 'DISENGAGED'>('NONE');

  useEffect(() => {
    // Reset form when modal opens
    if (isOpen) {
      setLabelName('');
      setSegment('COLD');
      setStatus('NEW');
      setEngagementLevel('NONE');
    }
  }, [isOpen]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newLabelData = {
      whatsapp_label_name: labelName,
      crm_segment: segment,
      crm_status: status,
      engagement_level: engagementLevel,
    };

    onSave(newLabelData);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)] max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Add New Label Mapping
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* WhatsApp Label Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              WhatsApp Label Name
            </label>
            <input
              type="text"
              value={labelName}
              onChange={(e) => setLabelName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all"
              placeholder="e.g., on going"
              required
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Enter the exact label name as it appears in WhatsApp
            </p>
          </div>

          {/* CRM Segment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              CRM Segment
            </label>
            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value as 'COLD' | 'WARM' | 'HOT' | 'DEAD')}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all"
            >
              <option value="COLD">COLD - New prospects</option>
              <option value="WARM">WARM - Previous clients</option>
              <option value="HOT">HOT - Active clients</option>
              <option value="DEAD">DEAD - Do not contact</option>
            </select>
          </div>

          {/* CRM Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              CRM Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'NEW' | 'ACTIVE' | 'INACTIVE' | 'NOT_INTERESTED')}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all"
            >
              <option value="NEW">NEW - Never contacted</option>
              <option value="ACTIVE">ACTIVE - Currently engaged</option>
              <option value="INACTIVE">INACTIVE - Past clients</option>
              <option value="NOT_INTERESTED">NOT_INTERESTED - Opted out</option>
            </select>
          </div>

          {/* Engagement Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Engagement Level
            </label>
            <select
              value={engagementLevel}
              onChange={(e) => setEngagementLevel(e.target.value as 'NONE' | 'ENGAGED' | 'DISENGAGED')}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all"
            >
              <option value="NONE">NONE - No engagement yet</option>
              <option value="ENGAGED">ENGAGED - Actively replied (counts as replied)</option>
              <option value="DISENGAGED">DISENGAGED - Not interested</option>
            </select>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Set to ENGAGED for labels like "on going" or "Past Clients" to track replied leads
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              How Label Mapping Works
            </h3>
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <p>
                When you upload WhatsApp labels, the CRM will:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Find contacts with this WhatsApp label</li>
                <li>Update their segment, status, and engagement level</li>
                <li>Track replied leads based on engagement level</li>
              </ul>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-3 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-white/15 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-5 py-3 bg-[#007AFF] text-white rounded-xl font-semibold hover:scale-[1.02] hover:brightness-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/50 shadow-[0_4px_12px_rgba(0,122,255,0.2)]"
            >
              Add Label Mapping
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
