import React, { useState } from 'react';
import Layout from './components/Layout';
import DateFilter from './components/DateFilter';
import SummaryCards from './components/SummaryCards';
import ExpensePieChart from './components/ExpensePieChart';
import TransactionList from './components/TransactionList';
import TransactionModal from './components/TransactionModal';
import { useAnalyticsSummary, useTransactions } from './hooks/useFinanceData';

export default function App() {
  const getInitialMonthRange = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const start = new Date(year, month, 1).toISOString().slice(0, 10);
    const end = new Date(year, month + 1, 0).toISOString().slice(0, 10);
    return { preset: 'current-month', startDate: start, endDate: end };
  };

  const [dateRange, setDateRange] = useState(getInitialMonthRange);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Queries
  const { data: summary, isLoading: isLoadingSummary } = useAnalyticsSummary({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  const { data: transactions = [], isLoading: isLoadingTransactions } = useTransactions({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (tx) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  return (
    <Layout onOpenModal={handleOpenAddModal}>
      <div className="space-y-6">
        {/* Date Filter Bar */}
        <DateFilter dateRange={dateRange} onChange={setDateRange} />

        {/* 3 Summary Cards */}
        <SummaryCards
          totalIncome={summary?.totalIncome ?? 0}
          totalExpense={summary?.totalExpense ?? 0}
          netBalance={summary?.netBalance ?? 0}
          isLoading={isLoadingSummary}
        />

        {/* Analytics & Transactions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Chart Widget */}
          <div className="lg:col-span-1">
            <ExpensePieChart
              data={summary?.byCategory ?? []}
              isLoading={isLoadingSummary}
            />
          </div>

          {/* Transactions List */}
          <div className="lg:col-span-2">
            <TransactionList
              transactions={transactions}
              isLoading={isLoadingTransactions}
              onEdit={handleEditTransaction}
            />
          </div>
        </div>
      </div>

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={editingTransaction}
      />
    </Layout>
  );
}
