import React, { useState } from 'react';
import { MessageCircle, Users, Plus } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import Button from '../components/common/Button';
import ConversationList from '../components/chat/ConversationList';
import ChatInterface from '../components/chat/ChatInterface';
import Modal from '../components/common/Modal';
import { Conversation, User } from '../types';
import { downloadPDF } from '../utils/pdfGenerator';
import { v4 as uuidv4 } from 'uuid';

const ChatPage: React.FC = () => {
  const { theme } = useTheme();
  const { conversations, currentUser, updateConversation, addConversation } = useApp();
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [isGroup, setIsGroup] = useState(false);
  
  // Mock users for demo purposes
  const mockUsers: User[] = [
    currentUser,
    { id: '2', name: 'Alex Johnson' },
    { id: '3', name: 'Sam Williams' },
    { id: '4', name: 'Taylor Smith' },
    { id: '5', name: 'Jordan Lee' },
  ];
  
  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);
  };
  
  const handleDownloadConversation = async () => {
    if (!activeConversation) return;
    
    try {
      await downloadPDF(activeConversation, 'conversation');
    } catch (error) {
      console.error('Error downloading conversation:', error);
      alert('Failed to download conversation. Please try again.');
    }
  };
  
  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };
  
  const handleCreateNewChat = () => {
    if (selectedUsers.length === 0) return;
    
    const participants = [
      currentUser,
      ...mockUsers.filter(user => selectedUsers.includes(user.id))
    ];
    
    const newConversation: Conversation = {
      id: uuidv4(),
      participants,
      messages: [],
      isGroup: isGroup && participants.length > 2,
      groupName: isGroup && participants.length > 2 ? groupName || 'New Group' : undefined,
      lastActivityAt: new Date().toISOString()
    };
    
    addConversation(newConversation);
    setActiveConversation(newConversation);
    
    // Reset form
    setSelectedUsers([]);
    setGroupName('');
    setIsGroup(false);
    setNewChatModalOpen(false);
  };
  
  return (
    <>
      <Modal
        isOpen={newChatModalOpen}
        onClose={() => setNewChatModalOpen(false)}
        title="New Conversation"
        footer={
          <>
            <Button variant="outline" onClick={() => setNewChatModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateNewChat}
              disabled={selectedUsers.length === 0}
            >
              Create Chat
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-4 mb-2">
            <button
              onClick={() => setIsGroup(false)}
              className={`px-3 py-2 rounded-lg ${
                !isGroup
                  ? theme === 'dark'
                    ? 'bg-teal-600 text-white'
                    : 'bg-teal-500 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
              }`}
            >
              <MessageCircle className="w-5 h-5 inline-block mr-1" />
              Direct Message
            </button>
            <button
              onClick={() => setIsGroup(true)}
              className={`px-3 py-2 rounded-lg ${
                isGroup
                  ? theme === 'dark'
                    ? 'bg-teal-600 text-white'
                    : 'bg-teal-500 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Users className="w-5 h-5 inline-block mr-1" />
              Group Chat
            </button>
          </div>
          
          {isGroup && (
            <div className="mb-4">
              <label htmlFor="groupName" className="block text-sm font-medium mb-1">
                Group Name
              </label>
              <input
                type="text"
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-medium mb-2">Select contacts</h3>
            <div className={`p-3 rounded-lg space-y-1 max-h-64 overflow-y-auto ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              {mockUsers.filter(user => user.id !== currentUser.id).map(user => (
                <div 
                  key={user.id} 
                  className={`flex items-center p-2 rounded-lg cursor-pointer ${
                    selectedUsers.includes(user.id)
                      ? theme === 'dark'
                        ? 'bg-gray-700'
                        : 'bg-white'
                      : 'hover:bg-gray-700/50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => toggleUserSelection(user.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => {}}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full mr-3 flex items-center justify-center ${
                      theme === 'dark' ? 'bg-teal-900/50 text-teal-200' : 'bg-teal-100 text-teal-600'
                    }`}>
                      {user.name.charAt(0)}
                    </div>
                    <span>{user.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Messages</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Chat with your travel companions and share itineraries
            </p>
          </div>
          
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => setNewChatModalOpen(true)}
          >
            New Chat
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ConversationList
              conversations={conversations}
              activeConversation={activeConversation}
              onSelectConversation={handleSelectConversation}
              onNewConversation={() => setNewChatModalOpen(true)}
            />
          </div>
          
          <div className="lg:col-span-2">
            {activeConversation ? (
              <ChatInterface
                conversation={activeConversation}
                onDownload={handleDownloadConversation}
              />
            ) : (
              <div className={`h-[75vh] rounded-lg flex flex-col items-center justify-center border ${
                theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}>
                <MessageCircle className="w-16 h-16 text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold mb-2">No conversation selected</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
                  Select a conversation from the list or start a new chat to begin messaging
                </p>
                <Button
                  variant="primary"
                  icon={<Plus size={16} />}
                  onClick={() => setNewChatModalOpen(true)}
                >
                  New Chat
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatPage;