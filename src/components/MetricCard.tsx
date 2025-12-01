import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: 'blue' | 'red' | 'amber' | 'slate' | 'green' | 'purple';
  subtitle?: string;
}

const colorClasses = {
  blue: 'bg-apple-blue',
  red: 'bg-red-500',
  amber: 'bg-amber-500',
  slate: 'bg-gray-700',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
};

const borderColors = {
  blue: 'border-l-apple-blue',
  red: 'border-l-red-500',
  amber: 'border-l-amber-500',
  slate: 'border-l-gray-700',
  green: 'border-l-green-500',
  purple: 'border-l-purple-500',
};

export default function MetricCard({ title, value, icon: Icon, color, subtitle }: MetricCardProps) {
  return (
    <div className={`glass dark:glass-dark rounded-2xl p-6 hover:scale-[1.01] transition-smooth shadow-lg border-l-4 ${borderColors[color]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-3">{title}</p>
          <p className="text-5xl font-bold font-mono text-gray-900 dark:text-white tabular-nums">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{subtitle}</p>
          )}
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-2xl shadow-md`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
