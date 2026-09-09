import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TravelItinerary, Conversation, Expense, User } from '../types';

// Mock initial data
const mockCurrentUser: User = {
  id: '1',
  name: 'You',
  avatar: 'https://i.pravatar.cc/150?img=1'
};

interface AppContextType {
  currentUser: User;
  itineraries: TravelItinerary[];
  conversations: Conversation[];
  expenses: Expense[];
  activeItinerary: TravelItinerary | null;
  setActiveItinerary: (itinerary: TravelItinerary | null) => void;
  addItinerary: (itinerary: TravelItinerary) => void;
  updateItinerary: (itinerary: TravelItinerary) => void;
  deleteItinerary: (id: string) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversation: Conversation) => void;
  deleteConversation: (id: string) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentUser] = useState<User>(mockCurrentUser);
  const [itineraries, setItineraries] = useState<TravelItinerary[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeItinerary, setActiveItinerary] = useState<TravelItinerary | null>(null);

  const addItinerary = (itinerary: TravelItinerary) => {
    setItineraries(prev => [...prev, itinerary]);
  };

  const updateItinerary = (itinerary: TravelItinerary) => {
    setItineraries(prev => 
      prev.map(it => it.id === itinerary.id ? itinerary : it)
    );
    // Update active itinerary if it's the one being updated
    if (activeItinerary?.id === itinerary.id) {
      setActiveItinerary(itinerary);
    }
  };

  const deleteItinerary = (id: string) => {
    setItineraries(prev => prev.filter(it => it.id !== id));
  };

  const addConversation = (conversation: Conversation) => {
    setConversations(prev => [...prev, conversation]);
  };

  const updateConversation = (conversation: Conversation) => {
    setConversations(prev => 
      prev.map(conv => conv.id === conversation.id ? conversation : conv)
    );
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
  };

  const addExpense = (expense: Expense) => {
    setExpenses(prev => [...prev, expense]);
  };

  const updateExpense = (expense: Expense) => {
    setExpenses(prev => 
      prev.map(exp => exp.id === expense.id ? expense : exp)
    );
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      itineraries,
      conversations,
      expenses,
      activeItinerary,
      setActiveItinerary,
      addItinerary,
      updateItinerary,
      deleteItinerary,
      addConversation,
      updateConversation,
      deleteConversation,
      addExpense,
      updateExpense,
      deleteExpense
    }}>
      {children}
    </AppContext.Provider>
  );
};