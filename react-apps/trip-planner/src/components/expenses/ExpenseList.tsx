import React, { useState } from 'react';
import { CreditCard, Search, Filter, Download, ChevronRight, Plus, Share2 } from 'lucide-react';
import { Expense, User } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../common/Button';

interface ExpenseListProps {
  expenses: Expense[];
  users: User[];
  currentUserId: string;
  onCreateExpense: () => void;
  onViewExpense: (expense: Expense) => void;
  onGenerateReport: () => void;
  onShareReport: () => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  users,
  currentUserId,
  onCreateExpense,
  onViewExpense,
  onGenerateReport,
  onShareReport
}) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'food', name: 'Food & Drinks' },
    { id: 'accommodation', name: 'Accommodation' },
    { id: 'transportation', name: 'Transportation' },
    { id: 'activities', name: 'Activities & Entertainment' },
    { id: 'shopping', name: 'Shopping' },
    { id: 'other', name: 'Other' }
  ];
  
  const filteredExpenses = expenses.filter(expense => {
    // Apply search filter
    const matchesSearch = searchQuery === '' || 
      expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply category filter
    const matchesCategory = !filterCategory || filterCategory === 'all' || 
      expense.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  const sortedExpenses = [...filteredExpenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Group expenses by date
  const groupedExpenses: { [date: string]: Expense[] } = {};
  
  sortedExpenses.forEach(expense => {
    const date = expense.date;
    if (!groupedExpenses[date]) {
      groupedExpenses[date] = [];
    }
    groupedExpenses[date].push(expense);
  });
  
  // Get currency symbol
  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$',
      INR: '₹',
      CNY: '¥'
    };
    
    return symbols[currency] || currency;
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });
    }
  };
  
  // Get user by ID
  const getUserById = (id: string): User => {
    return users.find(user => user.id === id) || {
      id,
      name: 'Unknown User'
    };
  };
  
  // Calculate total expenses
  const calculateTotal = () => {
    return filteredExpenses.reduce((total, expense) => {
      // Only count expenses where the current user is a participant
      const userShare = expense.participants.find(p => p.userId === currentUserId)?.share || 0;
      return total + userShare;
    }, 0);
  };
  
  // Calculate what you owe others
  const calculateOwed = () => {
    return filteredExpenses.reduce((total, expense) => {
      // Only count expenses where the current user is NOT the payer but is a participant
      if (expense.paidBy !== currentUserId) {
        const userShare = expense.participants.find(p => p.userId === currentUserId)?.share || 0;
        return total + userShare;
      }
      return total;
    }, 0);
  };
  
  // Calculate what others owe you
  const calculateOwing = () => {
    return filteredExpenses.reduce((total, expense) => {
      // Only count expenses where the current user IS the payer
      if (expense.paidBy === currentUserId) {
        const otherShares = expense.participants
          .filter(p => p.userId !== currentUserId)
          .reduce((sum, p) => sum + p.share, 0);
        return total + otherShares;
      }
      return total;
    }, 0);
  };
  
  const totalExpenses = calculateTotal();
  const youOwe = calculateOwed();
  const youAreOwed = calculateOwing();
  
  // Determine the balance color
  const getBalanceColor = (balance: number) => {
    if (balance > 0) {
      return theme === 'dark' ? 'text-green-400' : 'text-green-600';
    } else if (balance < 0) {
      return theme === 'dark' ? 'text-red-400' : 'text-red-600';
    }
    return '';
  };
  
  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-xl ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold">Expense Summary</h2>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Share2 size={16} />}
              onClick={onShareReport}
            >
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Download size={16} />}
              onClick={onGenerateReport}
            >
              Download Report
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={16} />}
              onClick={onCreateExpense}
            >
              New Expense
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Expenses</p>
            <p className="text-xl font-semibold">
              {getCurrencySymbol('USD')}{totalExpenses.toFixed(2)}
            </p>
          </div>
          
          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">You owe</p>
            <p className={`text-xl font-semibold ${getBalanceColor(-youOwe)}`}>
              {getCurrencySymbol('USD')}{youOwe.toFixed(2)}
            </p>
          </div>
          
          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">You are owed</p>
            <p className={`text-xl font-semibold ${getBalanceColor(youAreOwed)}`}>
              {getCurrencySymbol('USD')}{youAreOwed.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      
      <div className={`p-6 rounded-xl ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'
      }`}>
        <h2 className="text-xl font-bold mb-4">Recent Expenses</h2>
        
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className={`flex-1 relative rounded-lg ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              className={`w-full py-2 pl-10 pr-4 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white placeholder-gray-400'
                  : 'bg-gray-100 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Search expenses"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-500 dark:text-gray-400" />
            <select
              value={filterCategory || 'all'}
              onChange={(e) => setFilterCategory(e.target.value === 'all' ? null : e.target.value)}
              className={`px-3 py-2 rounded-lg ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white border-gray-600'
                  : 'bg-gray-100 text-gray-900 border-gray-200'
              } border focus:outline-none focus:ring-1 focus:ring-teal-500`}
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {Object.keys(groupedExpenses).length === 0 ? (
          <div className="text-center py-10">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No expenses found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchQuery || filterCategory
                ? "No expenses match your search or filter criteria."
                : "You haven't added any expenses yet."}
            </p>
            <Button variant="primary" onClick={onCreateExpense}>
              Add Your First Expense
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(groupedExpenses).sort((a, b) => {
              return new Date(b).getTime() - new Date(a).getTime();
            }).map(date => (
              <div key={date}>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {formatDate(date)}
                </h3>
                <div className="space-y-2">
                  {groupedExpenses[date].map(expense => (
                    <button
                      key={expense.id}
                      onClick={() => onViewExpense(expense)}
                      className={`w-full text-left p-4 rounded-lg ${
                        theme === 'dark'
                          ? 'bg-gray-700 hover:bg-gray-650'
                          : 'bg-white hover:bg-gray-50 border border-gray-200'
                      } transition-colors`}
                    >
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{expense.title}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Paid by {getUserById(expense.paidBy).name}
                            {expense.paidBy === currentUserId ? ' (You)' : ''}
                          </p>
                        </div>
                        
                        <div className="flex flex-col items-end">
                          <div className="font-medium">
                            {getCurrencySymbol(expense.currency)}
                            {expense.amount.toFixed(2)}
                          </div>
                          <div className="flex items-center mt-1">
                            <span className={`text-xs ${
                              expense.paidBy === currentUserId
                                ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                                : theme === 'dark' ? 'text-red-400' : 'text-red-600'
                            }`}>
                              {expense.paidBy === currentUserId ? 'You paid' : 'You owe'}
                            </span>
                            <ChevronRight size={16} className="ml-1 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseList;