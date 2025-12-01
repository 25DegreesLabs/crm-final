import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface WhatsAppGroup {
  id: string;
  user_id: string;
  group_name: string;
  score_value: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: WhatsAppGroup | null;
  onSave: (updatedGroup: WhatsAppGroup) => void;
  currentTotal: number;
}

export default function EditGroupModal({ isOpen, onClose, group, onSave, currentTotal }: EditGroupModalProps) {
  const [groupName, setGroupName] = useState('');
  const [scoreValue, setScoreValue] = useState(20);
  const [description, setDescription] = useState('');

  const maxBudget = 50;

  // For edit mode, we subtract the original score first, then add the new score
  const originalScore = group?.score_value || 0;
  const budgetWithoutThisGroup = currentTotal - originalScore;
  const newTotal = budgetWithoutThisGroup + scoreValue;
  const budgetPercentage = (newTotal / maxBudget) * 100;

  const getBudgetColor = () => {
    if (newTotal < 40) return 'text-green-500';
    if (newTotal <= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getBudgetBarColor = () => {
    if (newTotal < 40) return 'bg-green-500';
    if (newTotal <= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Impact preview calculations
  const exceedsBy = newTotal - 50;
  const maxAllowed = 50 - budgetWithoutThisGroup;

  const getImpactColor = () => {
    if (newTotal < 40) return 'text-green-500';
    if (newTotal <= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  useEffect(() => {
    // Load group data when modal opens
    if (group) {
      setGroupName(group.group_name);
      setScoreValue(group.score_value);
      setDescription(group.description || '');
    }
  }, [group]);

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

  if (!isOpen || !group) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent saving if budget exceeded
    if (newTotal > 50) {
      return;
    }

    // Update group with new values
    const updatedGroup: WhatsAppGroup = {
      ...group,
      group_name: groupName,
      score_value: scoreValue,
      description: description,
      updated_at: new Date().toISOString()
    };

    onSave(updatedGroup);
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
            Edit WhatsApp Group
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
          {/* Budget Display */}
          <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Group Score Budget
              </span>
              <span className={`text-lg font-bold ${getBudgetColor()}`}>
                {budgetWithoutThisGroup} + {scoreValue} = {newTotal}/{maxBudget}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getBudgetBarColor()} transition-all duration-300`}
                style={{ width: `${budgetPercentage}%` }}
              />
            </div>
          </div>

          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all"
              placeholder="e.g., Wedding Planning 2025"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all"
              placeholder="e.g., Active paying clients - highest priority"
            />
          </div>

          {/* Score Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Score Value
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setScoreValue(Math.max(1, scoreValue - 5))}
                className="flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl text-gray-700 dark:text-white font-bold text-xl hover:bg-gray-200 dark:hover:bg-white/15 transition-all focus:outline-none focus:ring-2 focus:ring-apple-blue"
              >
                −
              </button>
              <input
                type="number"
                value={scoreValue}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setScoreValue(Math.max(1, Math.min(50, value)));
                }}
                min="1"
                max="50"
                placeholder="Enter score (1-50)"
                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-center font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setScoreValue(Math.min(50, scoreValue + 5))}
                className="flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl text-gray-700 dark:text-white font-bold text-xl hover:bg-gray-200 dark:hover:bg-white/15 transition-all focus:outline-none focus:ring-2 focus:ring-apple-blue"
              >
                +
              </button>
            </div>
          </div>

          {/* Helper Text */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            💡 Most groups score +5 to +30. Max total: 50 points
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Use the 'Do Not Contact' checkbox on individual leads for exclusions
          </p>

          {/* Impact Preview */}
          <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Impact Preview
            </h3>
            <div className="space-y-2">
              <p className={`text-sm font-semibold ${getImpactColor()}`}>
                Adding this group: {budgetWithoutThisGroup} + {scoreValue} = {newTotal}
              </p>
              {newTotal > 50 && (
                <>
                  <p className="text-sm font-semibold text-red-500">
                    ⚠️ Exceeds 50-point budget by {exceedsBy} pts
                  </p>
                  <p className="text-sm text-red-500 font-semibold">
                    Cannot save. Total would be {newTotal}/50. Reduce score or delete other groups.
                  </p>
                </>
              )}
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
              disabled={budgetWithoutThisGroup + scoreValue > 50}
              className="flex-1 px-5 py-3 bg-[#007AFF] text-white rounded-xl font-semibold hover:scale-[1.02] hover:brightness-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/50 shadow-[0_4px_12px_rgba(0,122,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}