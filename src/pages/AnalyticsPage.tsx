import { BarChart3, Users, Flame, MessageCircle, TrendingUp, Database } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getLeadPipelineMetrics, LeadPipelineMetrics, getSegmentDistribution, SegmentDistribution } from '../lib/supabase-queries';
import SegmentDistributionChart from '../components/SegmentDistributionChart';
import { CURRENT_USER_ID } from '../lib/constants';

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<LeadPipelineMetrics | null>(null);
  const [segmentData, setSegmentData] = useState<SegmentDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [segmentLoading, setSegmentLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
    loadSegmentData();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLeadPipelineMetrics(CURRENT_USER_ID);
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load metrics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const loadSegmentData = async () => {
    try {
      setSegmentLoading(true);
      const data = await getSegmentDistribution(CURRENT_USER_ID);
      setSegmentData(data);
    } catch (err) {
      console.error('Failed to load segment distribution:', err);
    } finally {
      setSegmentLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'from-green-500 to-emerald-600';
    if (score >= 40) return 'from-amber-500 to-orange-600';
    return 'from-blue-500 to-blue-600';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-blue-500';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 sm:mb-8">
        <div className="bg-apple-blue p-2 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-lg">
          <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Real-time insights from your lead database
          </p>
        </div>
      </div>

      {/* Lead Pipeline Section */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
          Lead Pipeline
        </h2>

        {/* Error State */}
        {error && (
          <div className="glass dark:glass-dark rounded-2xl p-6 shadow-lg text-center">
            <p className="text-red-500 dark:text-red-400 font-semibold mb-2">Error</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
            <button
              onClick={loadMetrics}
              className="mt-4 px-4 py-2 bg-apple-blue text-white rounded-lg hover:bg-blue-600 transition-smooth text-sm font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="glass dark:glass-dark rounded-2xl p-6 shadow-lg animate-pulse"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-3"></div>
                    <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-2xl"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Metric Cards */}
        {!loading && !error && metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            {/* Card 1: Total Leads */}
            <div className="glass dark:glass-dark rounded-2xl p-6 hover:scale-[1.01] transition-smooth shadow-lg border-l-4 border-l-gray-500">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-3">
                    Total Leads
                  </p>
                  <p className="text-5xl font-bold font-mono text-gray-900 dark:text-white tabular-nums">
                    {metrics.totalLeads}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    All leads in database
                  </p>
                </div>
                <div className="bg-gray-500 p-3 rounded-2xl shadow-md">
                  <Database className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Card 2: Contactable Leads */}
            <div className="glass dark:glass-dark rounded-2xl p-6 hover:scale-[1.01] transition-smooth shadow-lg border-l-4 border-l-apple-blue">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-3">
                    Contactable Leads
                  </p>
                  <p className="text-5xl font-bold font-mono text-gray-900 dark:text-white tabular-nums">
                    {metrics.totalActiveLeads}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Excludes Do Not Contact
                  </p>
                </div>
                <div className="bg-apple-blue p-3 rounded-2xl shadow-md">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Card 3: HOT Leads */}
            <div className="glass dark:glass-dark rounded-2xl p-6 hover:scale-[1.01] transition-smooth shadow-lg border-l-4 border-l-red-500">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-3">
                    HOT Leads
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-bold font-mono text-gray-900 dark:text-white tabular-nums">
                      {metrics.hotLeads}
                    </p>
                    <span className="px-2 py-1 bg-red-500/20 text-red-500 text-xs font-bold rounded-full">
                      HOT
                    </span>
                  </div>
                </div>
                <div className="bg-red-500 p-3 rounded-2xl shadow-md">
                  <Flame className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Card 4: Reply Rate */}
            <div className="glass dark:glass-dark rounded-2xl p-6 hover:scale-[1.01] transition-smooth shadow-lg border-l-4 border-l-green-500">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-3">
                    Reply Rate
                  </p>
                  <p className="text-5xl font-bold font-mono text-gray-900 dark:text-white tabular-nums">
                    {metrics.replyRate.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-green-500 p-3 rounded-2xl shadow-md">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Card 5: Average Lead Score */}
            <div className="glass dark:glass-dark rounded-2xl p-6 hover:scale-[1.01] transition-smooth shadow-lg border-l-4 border-l-gradient-to-br">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-3">
                    Average Lead Score
                  </p>
                  <p className="text-5xl font-bold font-mono text-gray-900 dark:text-white tabular-nums">
                    {metrics.averageScore.toFixed(1)}
                    <span className="text-2xl text-gray-500 dark:text-gray-500">/100</span>
                  </p>
                </div>
                <div className={`bg-gradient-to-br ${getScoreColor(metrics.averageScore)} p-3 rounded-2xl shadow-md`}>
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${getScoreBarColor(metrics.averageScore)} transition-all duration-500`}
                  style={{ width: `${Math.min(metrics.averageScore, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && metrics && metrics.totalActiveLeads === 0 && (
          <div className="glass dark:glass-dark rounded-2xl p-12 shadow-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No leads yet
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload leads to see analytics
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Segment Distribution - Donut Chart */}
      <SegmentDistributionChart data={segmentData} loading={segmentLoading} />

      {/* Section 3: Recent Activity - Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass dark:glass-dark rounded-2xl p-4 sm:p-6 shadow-lg">
          {/* TODO: Add performance by segment chart */}
          {/* Will use Recharts BarChart with real campaign data */}
        </div>

        <div className="glass dark:glass-dark rounded-2xl p-4 sm:p-6 shadow-lg">
          {/* TODO: Add top leads table */}
          {/* Query: SELECT * FROM leads ORDER BY lead_score DESC LIMIT 5 */}
        </div>
      </div>
    </div>
  );
}
