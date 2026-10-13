import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

const FALLBACK_COLORS = [
  '#EF4444', '#F97316', '#8B5CF6', '#3B82F6', '#EC4899',
  '#10B981', '#6B7280', '#06B6D4', '#F59E0B', '#84CC16',
];

export default function ExpensePieChart({ data = [], isLoading }) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const chartData = data
    .filter((item) => Number(item.total) > 0)
    .map((item, index) => ({
      name: item.name,
      value: Number(item.total),
      color: item.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
    }));

  const totalExpense = chartData.reduce((acc, curr) => acc + curr.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percentage = totalExpense > 0 ? ((item.value / totalExpense) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-xs">
          <div className="font-semibold text-slate-800 flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: item.payload.color }}
            />
            {item.name}
          </div>
          <div className="text-slate-600 font-medium">
            {formatCurrency(item.value)} ({percentage}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800 text-base flex items-center gap-2">
          <PieChartIcon className="w-4 h-4 text-indigo-500" />
          Расходы по категориям
        </h3>
        {totalExpense > 0 && (
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
            Всего: {formatCurrency(totalExpense)}
          </span>
        )}
      </div>

      <div className="flex-1 min-h-[260px] flex items-center justify-center">
        {isLoading ? (
          <div className="w-full flex justify-center items-center h-48">
            <div className="w-36 h-36 rounded-full border-4 border-slate-200 border-t-indigo-500 animate-spin" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-400 py-8">
            <PieChartIcon className="w-12 h-12 text-slate-300 mb-2 stroke-1" />
            <p className="text-sm">Нет расходов за выбранный период</p>
          </div>
        ) : (
          <div className="w-full h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
