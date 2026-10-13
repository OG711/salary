import React from 'react';
import { ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';

export default function SummaryCards({ totalIncome = 0, totalExpense = 0, netBalance = 0, isLoading }) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Income Card */}
      <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-500">Общий доход</span>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-bold text-emerald-600">
          {isLoading ? (
            <div className="h-8 bg-slate-200 animate-pulse rounded w-32" />
          ) : (
            `+ ${formatCurrency(totalIncome)}`
          )}
        </div>
      </div>

      {/* Total Expense Card */}
      <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-500">Общий расход</span>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-bold text-rose-600">
          {isLoading ? (
            <div className="h-8 bg-slate-200 animate-pulse rounded w-32" />
          ) : (
            `- ${formatCurrency(totalExpense)}`
          )}
        </div>
      </div>

      {/* Net Balance Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-500">Чистый остаток</span>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            netBalance >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
          }`}>
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className={`text-2xl font-bold ${
          netBalance >= 0 ? 'text-slate-900' : 'text-amber-600'
        }`}>
          {isLoading ? (
            <div className="h-8 bg-slate-200 animate-pulse rounded w-32" />
          ) : (
            formatCurrency(netBalance)
          )}
        </div>
      </div>
    </div>
  );
}
