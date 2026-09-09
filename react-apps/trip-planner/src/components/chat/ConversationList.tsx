import React, { useState } from 'react';
import { User, Users, Search, Plus, Archive } from 'lucide-react';
import { Conversation } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../common/Button';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversation,
  onSelectConversation,
  onNewConversation
}) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };
  
  const getLastMessage = (conversation: Conversation) => {
    if (conversation.messages.length === 0) return 'No messages yet';
    return conversation.messages[conversation.messages.length - 1].content;
  };
  
  const filteredConversations = conversations.filter(conversation => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    
    // Search in group name
    if (conversation.isGroup && conversation.groupName?.toLowerCase().includes(query)) {
      return true;
    }
    
    // Search in participant names
    const participantMatch = conversation.participants.some(
      participant => participant.name.toLowerCase().includes(query)
    );
    
    // Search in messages
    const messageMatch = conversation.messages.some(
      message => message.content.toLowerCase().includes(query)
    );
    
    return participantMatch || messageMatch;
  });

  return (
    <div className={`h-[75vh] rounded-lg overflow-hidden border ${
      theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
    }`}>
      <div className={`p-4 border-b ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Messages</h2>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              icon={<Archive size={16} />}
              aria-label="Archived conversations"
            />
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={16} />}
              onClick={onNewConversation}
              aria-label="New conversation"
            >
              New
            </Button>
          </div>
        </div>
        
        <div className={`relative rounded-lg ${
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
            placeholder="Search conversations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className={`overflow-y-auto h-[calc(75vh-80px)] ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400 text-center">
              {searchQuery ? 'No conversations match your search' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          filteredConversations.map(conversation => (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={`w-full text-left p-3 border-b last:border-b-0 transition-colors ${
                activeConversation?.id === conversation.id
                  ? theme === 'dark'
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-teal-50 border-gray-200'
                  : theme === 'dark'
                    ? 'hover:bg-gray-800 border-gray-800'
                    : 'hover:bg-gray-100 border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  conversation.isGroup 
                    ? theme === 'dark' ? 'bg-indigo-900/50 text-indigo-200' : 'bg-indigo-100 text-indigo-600'
                    : theme === 'dark' ? 'bg-teal-900/50 text-teal-200' : 'bg-teal-100 text-teal-600'
                }`}>
                  {conversation.isGroup ? (
                    <Users size={20} />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium truncate">
                      {conversation.isGroup
                        ? conversation.groupName
                        : conversation.participants[0].name
                      }
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                      {formatDate(conversation.lastActivityAt)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                    {getLastMessage(conversation)}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;