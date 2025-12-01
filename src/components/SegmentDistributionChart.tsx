import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { SegmentDistribution } from '../lib/supabase-queries';

interface SegmentDistributionChartProps {
  data: SegmentDistribution[];
  loading: boolean;
}

const SEGMENT_COLORS: Record<string, string> = {
  HOT: '#EF4444',
  WARM: '#F97316',
  COLD: '#3B82F6',
  DEAD: '#6B7280',
};

const SEGMENT_ICONS: Record<string, string> = {
  HOT: '🔥',
  WARM: '🟠',
  COLD: '🔵',
  DEAD: '⚫',
};

export default function SegmentDistributionChart({ data, loading }: SegmentDistributionChartProps) {
  const totalLeads = data.reduce((sum, item) => sum + item.count, 0);

  if (loading) {
    return (
      <div className="glass dark:glass-dark rounded-2xl p-6 shadow-lg">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-6">
          Segment Distribution
        </h2>
        <div className="flex flex-col items-center justify-center py-8 animate-pulse">
          <div className="w-64 h-64 rounded-full bg-gray-300 dark:bg-gray-700 mb-6"></div>
          <div className="flex gap-4 flex-wrap justify-center">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (totalLeads === 0) {
    return (
      <div className="glass dark:glass-dark rounded-2xl p-6 shadow-lg">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-6">
          Segment Distribution
        </h2>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No leads to analyze
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upload leads to see segment distribution
          </p>
        </div>
      </div>
    );
  }

  const chartData = data.filter(item => item.count > 0);

  const renderCustomLabel = (entry: any) => {
    return `${entry.percentage.toFixed(1)}%`;
  };

  const CustomLegend = () => (
    <div className="flex flex-wrap gap-4 justify-center mt-6">
      {data.map((item) => (
        <div
          key={item.segment}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800/50"
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: SEGMENT_COLORS[item.segment] }}
          ></div>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            {SEGMENT_ICONS[item.segment]} {item.segment}
          </span>
          <span className="text-xs font-bold text-gray-900 dark:text-white">
            {item.count}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({item.percentage.toFixed(1)}%)
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="glass dark:glass-dark rounded-2xl p-6 shadow-lg">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-6">
        Segment Distribution
      </h2>

      <div className="flex flex-col items-center">
        <div className="w-full lg:w-3/5 relative">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={2}
                dataKey="count"
                label={renderCustomLabel}
                labelLine={false}
                animationBegin={0}
                animationDuration={800}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.segment}
                    fill={SEGMENT_COLORS[entry.segment]}
                    stroke="none"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {totalLeads}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Leads
              </div>
            </div>
          </div>
        </div>

        <CustomLegend />
      </div>
    </div>
  );
}
