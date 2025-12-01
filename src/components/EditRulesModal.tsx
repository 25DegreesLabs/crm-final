import { useState, useEffect } from 'react';
import { X, Plus, Minus, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { updateEngagementRule } from '../lib/supabase-queries';

interface EngagementRule {
  id: string;
  name: string;
  score: number;
  condition: string;
  type: 'bonus' | 'penalty';
}

interface EditRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: EngagementRule[];
  onSave: (updatedRules: EngagementRule[]) => void;
}

export default function EditRulesModal({ isOpen, onClose, rules, onSave }: EditRulesModalProps) {
  const [editedRules, setEditedRules] = useState<EngagementRule[]>([]);

  useEffect(() => {
    setEditedRules([...rules]);
  }, [rules]);

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

  const handleScoreChange = (ruleId: string, newScore: number) => {
    setEditedRules(prev => 
      prev.map(rule => 
        rule.id === ruleId ? { ...rule, score: newScore } : rule
      )
    );
  };

  const adjustScore = (ruleId: string, adjustment: number) => {
    setEditedRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, score: Math.max(-100, Math.min(100, rule.score + adjustment)) }
          : rule
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const updatePromises = editedRules.map(rule =>
        updateEngagementRule(rule.id, {
          points: rule.score
        })
      );
      await Promise.all(updatePromises);
      onSave(editedRules);
    } catch (error) {
      console.error('Error saving rules:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 0) return 'text-apple-green';
    if (score < 0) return 'text-red-500';
    return 'text-gray-500 dark:text-gray-400';
  };

  // Calculate summary statistics
  const bonusRules = editedRules.filter(rule => rule.type === 'bonus');
  const penaltyRules = editedRules.filter(rule => rule.type === 'penalty');
  
  const totalBonuses = bonusRules.reduce((sum, rule) => sum + rule.score, 0);
  const totalPenalties = penaltyRules.reduce((sum, rule) => sum + rule.score, 0);
  const totalScore = totalBonuses + totalPenalties;
  
  const getScoreStatus = (total: number) => {
    if (total <= 40) return { 
      color: 'text-apple-green', 
      bgColor: 'bg-apple-green/10 border-apple-green/20', 
      icon: CheckCircle, 
      label: '✓ Optimal engagement weight',
      barColor: 'bg-apple-green'
    };
    if (total <= 50) return { 
      color: 'text-amber-500', 
      bgColor: 'bg-amber-500/10 border-amber-500/20', 
      icon: AlertTriangle, 
      label: '⚠️ High engagement weight',
      barColor: 'bg-amber-500'
    };
    return { 
      color: 'text-red-500', 
      bgColor: 'bg-red-500/10 border-red-500/20', 
      icon: XCircle, 
      label: '❌ Exceeds 50-point engagement limit',
      barColor: 'bg-red-500'
    };
  };
  
  const scoreStatus = getScoreStatus(totalScore);
  const progressPercentage = Math.min((totalScore / 50) * 100, 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)] max-w-4xl w-full max-h-[90vh] overflow-y-auto modal-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Engagement Rules
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score Summary Bar */}
        <div className={`sticky top-0 z-10 mb-8 p-4 sm:p-5 rounded-xl border transition-all duration-300 ${scoreStatus.bgColor}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Total Engagement Score
                </div>
                <div className={`text-2xl font-bold ${scoreStatus.color}`}>
                  {totalScore > 0 ? '+' : ''}{totalScore}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-6 text-sm">
              <div className="text-center">
                <div className="text-gray-600 dark:text-gray-400 mb-1">Bonuses</div>
                <div className="font-semibold text-apple-green">+{totalBonuses}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600 dark:text-gray-400 mb-1">Penalties</div>
                <div className="font-semibold text-red-500">{totalPenalties}</div>
              </div>
              <div className="text-center sm:text-right">
                <div className="text-gray-600 dark:text-gray-400 mb-1">Progress</div>
                <div className="font-semibold text-gray-900 dark:text-white">{totalScore}/50</div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${scoreStatus.barColor}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className={`text-sm font-medium ${scoreStatus.color}`}>
              {scoreStatus.label}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Engagement scores are capped at 50 points
            </div>
          </div>
          
          {(totalBonuses > 50 || totalPenalties < -25) && (
            <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                ⚠️ For balanced scoring, keep engagement between -25 and +50
              </div>
              {totalBonuses > 50 && (
                <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  • Total bonuses exceed +50 limit
                </div>
              )}
              {totalPenalties < -25 && (
                <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  • Total penalties exceed -25 limit
                </div>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Bonuses Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-apple-green rounded-full"></span>
              Bonuses
            </h3>
            <div className="space-y-4">
              {bonusRules.map((rule) => (
                <div key={rule.id} className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {rule.name}
                        </label>
                        <code className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-400 break-all">
                          {rule.condition}
                        </code>
                      </div>
                      <div className="md:hidden">
                        <span className={`text-lg font-bold ${getScoreColor(rule.score)}`}>
                          {rule.score > 0 ? '+' : ''}{rule.score}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => adjustScore(rule.id, -5)}
                          className="p-2.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors active:scale-95"
                        >
                          <Minus className="w-5 h-5 text-gray-500" />
                        </button>
                        <input
                          type="number"
                          value={rule.score}
                          onChange={(e) => handleScoreChange(rule.id, parseInt(e.target.value) || 0)}
                          className="w-20 px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-center font-mono focus:outline-none focus:ring-2 focus:ring-apple-blue text-base"
                          min="-100"
                          max="100"
                        />
                        <button
                          type="button"
                          onClick={() => adjustScore(rule.id, 5)}
                          className="p-2.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors active:scale-95"
                        >
                          <Plus className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>

                      <div className="hidden md:block text-right">
                        <span className={`text-lg font-bold ${getScoreColor(rule.score)}`}>
                          {rule.score > 0 ? '+' : ''}{rule.score}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Penalties Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              Penalties
            </h3>
            <div className="space-y-4">
              {penaltyRules.map((rule) => (
                <div key={rule.id} className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {rule.name}
                        </label>
                        <code className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-400 break-all">
                          {rule.condition}
                        </code>
                      </div>
                      <div className="md:hidden">
                        <span className={`text-lg font-bold ${getScoreColor(rule.score)}`}>
                          {rule.score > 0 ? '+' : ''}{rule.score}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => adjustScore(rule.id, -5)}
                          className="p-2.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors active:scale-95"
                        >
                          <Minus className="w-5 h-5 text-gray-500" />
                        </button>
                        <input
                          type="number"
                          value={rule.score}
                          onChange={(e) => handleScoreChange(rule.id, parseInt(e.target.value) || 0)}
                          className="w-20 px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-center font-mono focus:outline-none focus:ring-2 focus:ring-apple-blue text-base"
                          min="-100"
                          max="100"
                        />
                        <button
                          type="button"
                          onClick={() => adjustScore(rule.id, 5)}
                          className="p-2.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors active:scale-95"
                        >
                          <Plus className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>

                      <div className="hidden md:block text-right">
                        <span className={`text-lg font-bold ${getScoreColor(rule.score)}`}>
                          {rule.score > 0 ? '+' : ''}{rule.score}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-3.5 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-white/15 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-5 py-3.5 bg-[#007AFF] text-white rounded-xl font-semibold hover:scale-[1.02] hover:brightness-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/50 shadow-[0_4px_12px_rgba(0,122,255,0.2)] active:scale-[0.98]"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}