import React, { useState } from 'react';
import { Trash2, Edit2, ArrowDownRight, ArrowUpRight, Search } from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import { useDeleteTransaction } from '../hooks/useFinanceData';

export default function TransactionList({ transactions = [], isLoading, onEdit }) {
  const [filterType, setFilterType] = useState('all'); // all, expense, income
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const deleteMutation = useDeleteTransaction();

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту операцию?')) {
      try {
        setDeletingId(id);
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        alert('Не удалось удалить операцию: ' + err.message);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchCat = t.category_name?.toLowerCase().includes(term);
      const matchNote = t.note?.toLowerCase().includes(term);
      const matchAmount = String(t.amount).includes(term);
      return matchCat || matchNote || matchAmount;
    }
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* List Header & Controls */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-800 text-base">История операций</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {filteredTransactions.length} записей найдено
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-32 sm:w-40"
            />
          </div>

          {/* Type filter */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-medium text-slate-600">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md transition ${
                filterType === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              Все
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-2.5 py-1 rounded-md transition ${
                filterType === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              Расходы
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-2.5 py-1 rounded-md transition ${
                filterType === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              Доходы
            </button>
          </div>
        </div>
      </div>

      {/* List Content */}
      <div className="divide-y divide-slate-100">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-2" />
            <p className="text-xs text-slate-400">Загрузка операций...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-slate-400">Операций пока нет</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isExpense = tx.type === 'expense';
            return (
              <div
                key={tx.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition group"
              >
                {/* Left side: Icon + Category + Note + Date */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                    style={{
                      backgroundColor: `${tx.category_color || '#6B7280'}18`,
                      color: tx.category_color || '#6B7280',
                    }}
                  >
                    <CategoryIcon name={tx.category_icon} className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 text-sm truncate">
                        {tx.category_name || 'Без категории'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal shrink-0">
                        {formatDate(tx.date)}
                      </span>
                    </div>
                    {tx.note && (
                      <p className="text-xs text-slate-500 truncate mt-0.5 max-w-xs md:max-w-md">
                        {tx.note}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right side: Amount + Actions */}
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span
                    className={`font-bold text-sm sm:text-base whitespace-nowrap ${
                      isExpense ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {isExpense ? '-' : '+'} {formatCurrency(tx.amount)}
                  </span>

                  <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => onEdit(tx)}
                      title="Редактировать"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(tx.id)}
                      disabled={deletingId === tx.id}
                      title="Удалить"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
