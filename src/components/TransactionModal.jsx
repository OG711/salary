import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useCategories, useCreateTransaction, useUpdateTransaction } from '../hooks/useFinanceData';
import CategoryIcon from './CategoryIcon';

export default function TransactionModal({ isOpen, onClose, initialData = null }) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const amountInputRef = useRef(null);

  const { data: categories = [], isLoading: isLoadingCategories } = useCategories(type);
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setType(initialData.type || 'expense');
        setAmount(String(initialData.amount || ''));
        setCategoryId(String(initialData.category_id || ''));
        setDate(initialData.date ? initialData.date.slice(0, 10) : new Date().toISOString().slice(0, 10));
        setNote(initialData.note || '');
      } else {
        setType('expense');
        setAmount('');
        setDate(new Date().toISOString().slice(0, 10));
        setNote('');
        setCategoryId('');
      }
      setError('');
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialData]);

  // Set default category when categories change or type changes
  useEffect(() => {
    if (categories.length > 0) {
      const exists = categories.some((c) => String(c.id) === String(categoryId));
      if (!exists && !initialData) {
        setCategoryId(String(categories[0].id));
      }
    }
  }, [categories, type]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Введите корректную сумму больше нуля');
      return;
    }

    if (!categoryId) {
      setError('Выберите категорию');
      return;
    }

    if (!date) {
      setError('Укажите дату');
      return;
    }

    try {
      if (initialData?.id) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          data: {
            amount: numAmount,
            type,
            category_id: Number(categoryId),
            date,
            note: note.trim(),
          },
        });
      } else {
        await createMutation.mutateAsync({
          amount: numAmount,
          type,
          category_id: Number(categoryId),
          date,
          note: note.trim(),
        });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Ошибка сохранения операции');
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? 'Редактировать операцию' : 'Новая операция'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-100">
              {error}
            </div>
          )}

          {/* Type switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              Расход
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Доход
            </button>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Сумма (₽)
            </label>
            <div className="relative">
              <input
                ref={amountInputRef}
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full text-3xl font-extrabold px-4 py-3 rounded-2xl border transition focus:outline-none focus:ring-4 ${
                  type === 'expense'
                    ? 'text-rose-600 border-rose-200 focus:ring-rose-100'
                    : 'text-emerald-600 border-emerald-200 focus:ring-emerald-100'
                }`}
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Категория
            </label>
            <div className="relative">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={isLoadingCategories}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                {isLoadingCategories && <option>Загрузка категорий...</option>}
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Дата
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Комментарий (необязательно)
            </label>
            <textarea
              rows={2}
              placeholder="На что потрачено или источник дохода..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 px-4 rounded-xl text-white font-semibold text-base shadow-lg transition active:scale-[0.99] disabled:opacity-60 ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
              }`}
            >
              {isSubmitting
                ? 'Сохранение...'
                : initialData
                ? 'Обновить операцию'
                : 'Добавить операцию'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
