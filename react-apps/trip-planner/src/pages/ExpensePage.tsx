import React, { useState } from 'react';
import { DollarSign, Plus } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import Button from '../components/common/Button';
import ExpenseList from '../components/expenses/ExpenseList';
import ExpenseForm from '../components/expenses/ExpenseForm';
import Modal from '../components/common/Modal';
import { Expense } from '../types';
import { downloadPDF } from '../utils/pdfGenerator';

const ExpensePage: React.FC = () => {
  const { theme } = useTheme();
  const { expenses, addExpense, updateExpense, currentUser } = useApp();
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [activeExpense, setActiveExpense] = useState<Expense | null>(null);
  const [viewExpenseOpen, setViewExpenseOpen] = useState(false);
  
  // Mock users for demo
  const mockUsers = [
    currentUser,
    { id: '2', name: 'Alex Johnson' },
    { id: '3', name: 'Sam Williams' },
    { id: '4', name: 'Taylor Smith' },
  ];
  
  const handleCreateExpense = () => {
    setActiveExpense(null);
    setExpenseModalOpen(true);
  };
  
  const handleEditExpense = (expense: Expense) => {
    setActiveExpense(expense);
    setExpenseModalOpen(true);
  };
  
  const handleViewExpense = (expense: Expense) => {
    setActiveExpense(expense);
    setViewExpenseOpen(true);
  };
  
  const handleSubmitExpense = (expense: Expense) => {
    if (activeExpense) {
      updateExpense(expense);
    } else {
      addExpense(expense);
    }
    setExpenseModalOpen(false);
  };
  
  const handleDownloadReport = async () => {
    try {
      await downloadPDF(expenses, 'expenses');
    } catch (error) {
      console.error('Error downloading expense report:', error);
      alert('Failed to download expense report. Please try again.');
    }
  };
  
  const handleShareReport = () => {
    // In a real implementation, this would integrate with the chat functionality
    console.log('Sharing expense report to chat');
    alert('Sharing to chat is not implemented in this demo.');
  };
  
  // Helper to get user name by ID
  const getUserName = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };
  
  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
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
    
    const symbol = symbols[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  };
  
  return (
    <>
      <Modal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        title={activeExpense ? "Edit Expense" : "Add New Expense"}
        size="lg"
      >
        <ExpenseForm
          users={mockUsers}
          onSubmit={handleSubmitExpense}
          onCancel={() => setExpenseModalOpen(false)}
          initialExpense={activeExpense || undefined}
        />
      </Modal>
      
      <Modal
        isOpen={viewExpenseOpen}
        onClose={() => setViewExpenseOpen(false)}
        title="Expense Details"
      >
        {activeExpense && (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-semibold">{activeExpense.title}</h3>
              <div className="text-xl font-bold">
                {formatCurrency(activeExpense.amount, activeExpense.currency)}
              </div>
            </div>
            
            <div className={`p-3 rounded-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <div className="flex justify-between text-sm mb-2">
                <span>Paid by</span>
                <span className="font-medium">
                  {getUserName(activeExpense.paidBy)}
                  {activeExpense.paidBy === currentUser.id ? ' (You)' : ''}
                </span>
              </div>
              
              <div className="flex justify-between text-sm mb-2">
                <span>Date</span>
                <span className="font-medium">
                  {new Date(activeExpense.date).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Category</span>
                <span className="font-medium capitalize">
                  {activeExpense.category}
                </span>
              </div>
            </div>
            
            {activeExpense.notes && (
              <div>
                <h4 className="text-sm font-medium mb-1">Notes</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activeExpense.notes}
                </p>
              </div>
            )}
            
            <div>
              <h4 className="text-sm font-medium mb-2">Split Details</h4>
              <div className={`rounded-lg overflow-hidden ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                {activeExpense.participants.map((participant, index) => (
                  <div 
                    key={participant.userId}
                    className={`flex justify-between items-center p-3 ${
                      index !== activeExpense.participants.length - 1 
                        ? 'border-b border-gray-200 dark:border-gray-700' 
                        : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                      }`}>
                        {getUserName(participant.userId).charAt(0)}
                      </div>
                      <span>
                        {getUserName(participant.userId)}
                        {participant.userId === currentUser.id ? ' (You)' : ''}
                      </span>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <span>
                        {formatCurrency(participant.share, activeExpense.currency)}
                      </span>
                      <span className={`text-xs ${
                        participant.isPaid
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}>
                        {participant.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setViewExpenseOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setViewExpenseOpen(false);
                handleEditExpense(activeExpense);
              }}>
                Edit Expense
              </Button>
            </div>
          </div>
        )}
      </Modal>
      
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Expenses</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track and split expenses with your travel companions
            </p>
          </div>
          
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={handleCreateExpense}
          >
            Add Expense
          </Button>
        </div>
        
        {expenses.length === 0 ? (
          <div className={`text-center py-16 px-6 rounded-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'
          }`}>
            <DollarSign className="w-16 h-16 mx-auto mb-4 text-teal-500" />
            <h2 className="text-xl font-semibold mb-2">No expenses yet</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Add your first expense to start tracking and splitting costs with your travel companions.
            </p>
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={handleCreateExpense}
            >
              Add Your First Expense
            </Button>
          </div>
        ) : (
          <ExpenseList
            expenses={expenses}
            users={mockUsers}
            currentUserId={currentUser.id}
            onCreateExpense={handleCreateExpense}
            onViewExpense={handleViewExpense}
            onGenerateReport={handleDownloadReport}
            onShareReport={handleShareReport}
          />
        )}
      </div>
    </>
  );
};

export default ExpensePage;