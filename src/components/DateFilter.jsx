import React from 'react';
import { Calendar } from 'lucide-react';

export default function DateFilter({ dateRange, onChange }) {
  const getToday = () => new Date();
  
  const formatDate = (date) => {
    return date.toISOString().slice(0, 10);
  };

  const handleSelectPreset = (preset) => {
    const today = getToday();
    const year = today.getFullYear();
    const month = today.getMonth();

    if (preset === 'current-month') {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      onChange({
        preset: 'current-month',
        startDate: formatDate(start),
        endDate: formatDate(end),
      });
    } else if (preset === 'prev-month') {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      onChange({
        preset: 'prev-month',
        startDate: formatDate(start),
        endDate: formatDate(end),
      });
    } else if (preset === 'all-time') {
      onChange({
        preset: 'all-time',
        startDate: '',
        endDate: '',
      });
    } else if (preset === 'custom') {
      onChange({
        preset: 'custom',
        startDate: dateRange.startDate || formatDate(new Date(year, month, 1)),
        endDate: dateRange.endDate || formatDate(today),
      });
    }
  };

  return (
    <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
        <Calendar className="w-4 h-4 text-indigo-500" />
        <span>Период:</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => handleSelectPreset('current-month')}
          className={`px-3 py-1.5 text-xs md:text-sm rounded-lg font-medium transition ${
            dateRange.preset === 'current-month'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Текущий месяц
        </button>

        <button
          type="button"
          onClick={() => handleSelectPreset('prev-month')}
          className={`px-3 py-1.5 text-xs md:text-sm rounded-lg font-medium transition ${
            dateRange.preset === 'prev-month'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Прошлый месяц
        </button>

        <button
          type="button"
          onClick={() => handleSelectPreset('all-time')}
          className={`px-3 py-1.5 text-xs md:text-sm rounded-lg font-medium transition ${
            dateRange.preset === 'all-time'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Все время
        </button>

        <button
          type="button"
          onClick={() => handleSelectPreset('custom')}
          className={`px-3 py-1.5 text-xs md:text-sm rounded-lg font-medium transition ${
            dateRange.preset === 'custom'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Произвольный
        </button>
      </div>

      {dateRange.preset === 'custom' && (
        <div className="flex items-center gap-2 text-sm w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => onChange({ ...dateRange, startDate: e.target.value })}
            className="border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="text-slate-400">—</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => onChange({ ...dateRange, endDate: e.target.value })}
            className="border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}
    </div>
  );
}
