import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Expense, User } from '../../types';
import Button from '../common/Button';
import { v4 as uuidv4 } from 'uuid';

interface ExpenseFormProps {
  users: User[];
  onSubmit: (expense: Expense) => void;
  onCancel: () => void;
  initialExpense?: Expense;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  users,
  onSubmit,
  onCancel,
  initialExpense
}) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState(initialExpense?.title || '');
  const [amount, setAmount] = useState(initialExpense?.amount.toString() || '');
  const [currency, setCurrency] = useState(initialExpense?.currency || 'USD');
  const [paidBy, setPaidBy] = useState(initialExpense?.paidBy || users[0]?.id);
  const [splitType, setSplitType] = useState(initialExpense ? 'custom' : 'equal');
  const [date, setDate] = useState(initialExpense?.date || new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(initialExpense?.category || 'food');
  const [notes, setNotes] = useState(initialExpense?.notes || '');
  const [participants, setParticipants] = useState<{
    userId: string;
    checked: boolean;
    share: number;
  }[]>(
    initialExpense?.participants
      ? users.map(user => ({
          userId: user.id,
          checked: initialExpense.participants.some(p => p.userId === user.id),
          share: initialExpense.participants.find(p => p.userId === user.id)?.share || 0
        }))
      : users.map(user => ({
          userId: user.id,
          checked: true,
          share: 0 // Will be calculated based on split type
        }))
  );
  
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' }
  ];
  
  const categories = [
    { id: 'food', name: 'Food & Drinks' },
    { id: 'accommodation', name: 'Accommodation' },
    { id: 'transportation', name: 'Transportation' },
    { id: 'activities', name: 'Activities & Entertainment' },
    { id: 'shopping', name: 'Shopping' },
    { id: 'other', name: 'Other' }
  ];
  
  const getCurrencySymbol = (code: string) => {
    const currency = currencies.find(c => c.code === code);
    return currency ? currency.symbol : '$';
  };
  
  const toggleParticipant = (userId: string) => {
    setParticipants(prev => 
      prev.map(p => 
        p.userId === userId ? { ...p, checked: !p.checked } : p
      )
    );
  };
  
  const updateParticipantShare = (userId: string, share: number) => {
    setParticipants(prev => 
      prev.map(p => 
        p.userId === userId ? { ...p, share } : p
      )
    );
  };
  
  const getActivatedParticipants = () => {
    return participants.filter(p => p.checked);
  };
  
  const calculateShares = () => {
    const active = getActivatedParticipants();
    const numParticipants = active.length;
    
    if (numParticipants === 0 || !amount) return;
    
    const totalAmount = parseFloat(amount);
    
    if (splitType === 'equal') {
      const equalShare = totalAmount / numParticipants;
      
      setParticipants(prev => 
        prev.map(p => ({
          ...p,
          share: p.checked ? equalShare : 0
        }))
      );
    }
  };
  
  // Calculate shares when relevant fields change
  React.useEffect(() => {
    if (splitType === 'equal') {
      calculateShares();
    }
  }, [splitType, amount, participants.map(p => p.checked).join(',')]);
  
  const validateForm = () => {
    if (!title.trim()) return false;
    if (!amount || parseFloat(amount) <= 0) return false;
    if (!paidBy) return false;
    if (getActivatedParticipants().length === 0) return false;
    
    if (splitType === 'custom') {
      const totalShares = getActivatedParticipants()
        .reduce((sum, p) => sum + p.share, 0);
      
      // Allow a small rounding error
      return Math.abs(totalShares - parseFloat(amount)) < 0.01;
    }
    
    return true;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const expenseData: Expense = {
      id: initialExpense?.id || uuidv4(),
      title,
      amount: parseFloat(amount),
      currency,
      paidBy,
      date,
      category,
      notes: notes || undefined,
      participants: getActivatedParticipants().map(p => ({
        userId: p.userId,
        share: p.share,
        isPaid: p.userId === paidBy // The payer has already paid their share
      }))
    };
    
    onSubmit(expenseData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            placeholder="Dinner, Hotel, Taxi, etc."
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="amount" className="block text-sm font-medium">Amount</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400">
                  {getCurrencySymbol(currency)}
                </span>
              </div>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="0"
                className={`w-full pl-8 px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="0.00"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="currency" className="block text-sm font-medium">Currency</label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {currencies.map(c => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol}) - {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="paidBy" className="block text-sm font-medium">Paid by</label>
            <select
              id="paidBy"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} {user.id === users[0].id ? '(You)' : ''}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="date" className="block text-sm font-medium">Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="category" className="block text-sm font-medium">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="notes" className="block text-sm font-medium">Notes (Optional)</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            placeholder="Add any details about this expense..."
          />
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Split type</h3>
            <div className="flex border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setSplitType('equal')}
                className={`px-4 py-1 text-sm ${
                  splitType === 'equal'
                    ? theme === 'dark'
                      ? 'bg-teal-600 text-white'
                      : 'bg-teal-500 text-white'
                    : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-100 text-gray-700'
                }`}
              >
                Equal
              </button>
              <button
                type="button"
                onClick={() => setSplitType('custom')}
                className={`px-4 py-1 text-sm ${
                  splitType === 'custom'
                    ? theme === 'dark'
                      ? 'bg-teal-600 text-white'
                      : 'bg-teal-500 text-white'
                    : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-100 text-gray-700'
                }`}
              >
                Custom
              </button>
            </div>
          </div>
          
          <div className={`space-y-3 p-4 rounded-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            {participants.map((participant) => {
              const user = users.find(u => u.id === participant.userId);
              if (!user) return null;
              
              return (
                <div key={participant.userId} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`participant-${participant.userId}`}
                      checked={participant.checked}
                      onChange={() => toggleParticipant(participant.userId)}
                      className="mr-2 rounded text-teal-500"
                    />
                    <label htmlFor={`participant-${participant.userId}`} className="text-sm">
                      {user.name} {user.id === users[0].id ? '(You)' : ''}
                    </label>
                  </div>
                  
                  {participant.checked && (
                    <div className="flex items-center">
                      <span className="mr-2 text-sm text-gray-500 dark:text-gray-400">
                        {getCurrencySymbol(currency)}
                      </span>
                      <input
                        type="number"
                        value={participant.share.toFixed(2)}
                        onChange={(e) => updateParticipantShare(
                          participant.userId, 
                          parseFloat(e.target.value) || 0
                        )}
                        disabled={splitType === 'equal'}
                        step="0.01"
                        min="0"
                        className={`w-20 px-2 py-1 text-right rounded ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } ${splitType === 'equal' ? 'opacity-75' : ''}`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
            
            {splitType === 'custom' && amount && (
              <div className="flex justify-between text-sm pt-2 border-t border-gray-300 dark:border-gray-700">
                <span>Total</span>
                <span className={
                  Math.abs(
                    getActivatedParticipants().reduce((sum, p) => sum + p.share, 0) - 
                    parseFloat(amount)
                  ) < 0.01
                    ? 'text-green-500'
                    : 'text-red-500'
                }>
                  {getCurrencySymbol(currency)}
                  {getActivatedParticipants()
                    .reduce((sum, p) => sum + p.share, 0)
                    .toFixed(2)}
                  {' / '}
                  {getCurrencySymbol(currency)}
                  {parseFloat(amount).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!validateForm()}>
          {initialExpense ? 'Update Expense' : 'Add Expense'}
        </Button>
      </div>
    </form>
  );
};

export default ExpenseForm;