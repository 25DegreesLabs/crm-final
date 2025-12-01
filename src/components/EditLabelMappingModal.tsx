import { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

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

interface EditLabelMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  label: LabelMapping | null;
  onSave: (updatedLabel: LabelMapping, nameChanged: boolean) => void;
}

export default function EditLabelMappingModal({ isOpen, onClose, label, onSave }: EditLabelMappingModalProps) {
  const [labelName, setLabelName] = useState('');
  const [segment, setSegment] = useState<'COLD' | 'WARM' | 'HOT' | 'DEAD' | null>('COLD');
  const [status, setStatus] = useState<'NEW' | 'ACTIVE' | 'INACTIVE' | 'NOT_INTERESTED' | null>('NEW');
  const [engagementLevel, setEngagementLevel] = useState<'NONE' | 'ENGAGED' | 'DISENGAGED' | null>('NONE');

  const originalName = label?.whatsapp_label_name || '';
  const nameChanged = labelName !== originalName;

  useEffect(() => {
    // Load label data when modal opens
    if (label) {
      setLabelName(label.whatsapp_label_name);
      setSegment(label.crm_segment);
      setStatus(label.crm_status);
      setEngagementLevel(label.engagement_level);
    }
  }, [label]);

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

  if (!isOpen || !label) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedLabel: LabelMapping = {
      ...label,
      whatsapp_label_name: labelName,
      crm_segment: segment,
      crm_status: status,
      engagement_level: engagementLevel,
      updated_at: new Date().toISOString()
    };

    onSave(updatedLabel, nameChanged);
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
            Edit Label Mapping
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
          {/* Name Change Warning */}
          {nameChanged && (
            <div className="bg-amber-50 dark:bg-amber-500/10 border-2 border-amber-500/50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-amber-900 dark:text-amber-500 mb-1">
                    Warning: Label Name Change Detected
                  </h3>
                  <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
                    Changing the label name from "<strong>{originalName}</strong>" to "<strong>{labelName}</strong>"
                    means future uploads with the old name won't match this mapping. Make sure this label name
                    matches exactly how it appears in WhatsApp.
                  </p>
                </div>
              </div>
            </div>
          )}

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
              Must match the exact label name in WhatsApp
            </p>
          </div>

          {/* CRM Segment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              CRM Segment
            </label>
            <select
              value={segment || ''}
              onChange={(e) => setSegment(e.target.value as 'COLD' | 'WARM' | 'HOT' | 'DEAD' | null)}
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
              value={status || ''}
              onChange={(e) => setStatus(e.target.value as 'NEW' | 'ACTIVE' | 'INACTIVE' | 'NOT_INTERESTED' | null)}
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
              value={engagementLevel || ''}
              onChange={(e) => setEngagementLevel(e.target.value as 'NONE' | 'ENGAGED' | 'DISENGAGED' | null)}
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

          {/* Status Badge */}
          <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Label Status:
              </span>
              {label.is_active ? (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-600 dark:text-green-400">
                  ACTIVE
                </span>
              ) : (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-500/20 text-gray-600 dark:text-gray-400">
                  ARCHIVED
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {label.is_active
                ? 'This label is active and will be processed during label uploads'
                : 'This label is archived and will be ignored during label uploads'}
            </p>
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
