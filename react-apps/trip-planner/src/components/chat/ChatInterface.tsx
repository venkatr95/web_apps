import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Download, MoreVertical, User, Users, X, UserPlus, UserMinus } from 'lucide-react';
import { Conversation, ChatMessage, User as UserType } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { useApp } from '../../contexts/AppContext';
import Button from '../common/Button';
import Modal from '../common/Modal';

interface ChatInterfaceProps {
  conversation: Conversation;
  onDownload: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  conversation,
  onDownload
}) => {
  const { theme } = useTheme();
  const { currentUser, updateConversation } = useApp();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  // Mock users for demo
  const availableUsers = [
    { id: '2', name: 'Alex Johnson' },
    { id: '3', name: 'Sam Williams' },
    { id: '4', name: 'Taylor Smith' },
    { id: '5', name: 'Jordan Lee' },
  ];
  
  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);
  
  useEffect(() => {
    // Clean up preview URLs when component unmounts
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);
  
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const handleSendMessage = () => {
    if (message.trim() || selectedFiles.length > 0) {
      // In a real app, we would upload files to a server and get URLs back
      const attachments = selectedFiles.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        type: file.type.startsWith('image/') ? 'image' : 'pdf',
        url: URL.createObjectURL(file),
        name: file.name
      }));
      
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        senderId: currentUser.id,
        content: message,
        timestamp: new Date().toISOString(),
        attachments: attachments.length > 0 ? attachments : undefined
      };
      
      const updatedMessages = [...conversation.messages, newMessage];
      
      const updatedConversation = {
        ...conversation,
        messages: updatedMessages,
        lastActivityAt: new Date().toISOString()
      };
      
      // Update the conversation in the context
      updateConversation(updatedConversation);
      
      // Clear input and files
      setMessage('');
      setSelectedFiles([]);
      setPreviewUrls([]);
      
      // Force scroll to bottom after state update
      setTimeout(scrollToBottom, 0);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
    
    // Create preview URLs for the files
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };
  
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleAddMember = (user: UserType) => {
    if (!conversation.participants.some(p => p.id === user.id)) {
      const updatedConversation = {
        ...conversation,
        participants: [...conversation.participants, user]
      };
      updateConversation(updatedConversation);
    }
  };
  
  const handleRemoveMember = (userId: string) => {
    if (conversation.participants.length > 2) {
      const updatedConversation = {
        ...conversation,
        participants: conversation.participants.filter(p => p.id !== userId)
      };
      updateConversation(updatedConversation);
    }
  };
  
  // Format timestamp to local time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { 
      weekday: 'long',
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  };
  
  // Get user by ID
  const getUserById = (id: string) => {
    return conversation.participants.find(user => user.id === id) || { 
      id, 
      name: 'Unknown User' 
    };
  };
  
  // Group messages by date
  const groupMessagesByDate = () => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    
    conversation.messages.forEach(message => {
      const messageDate = new Date(message.timestamp).toDateString();
      const existingGroup = groups.find(group => {
        const groupDate = new Date(group.date).toDateString();
        return groupDate === messageDate;
      });
      
      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({
          date: message.timestamp,
          messages: [message]
        });
      }
    });
    
    return groups;
  };
  
  const messageGroups = groupMessagesByDate();
  
  return (
    <>
      <Modal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        title={conversation.isGroup ? "Manage Group Members" : "Chat Participants"}
        size="md"
      >
        <div className="space-y-4">
          {conversation.isGroup && (
            <div>
              <h3 className="text-sm font-medium mb-2">Add Members</h3>
              <div className={`space-y-2 p-3 rounded-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                {availableUsers
                  .filter(user => !conversation.participants.some(p => p.id === user.id))
                  .map(user => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/50"
                    >
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                        }`}>
                          {user.name.charAt(0)}
                        </div>
                        <span>{user.name}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<UserPlus size={16} />}
                        onClick={() => handleAddMember(user)}
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-medium mb-2">Current Members</h3>
            <div className={`space-y-2 p-3 rounded-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              {conversation.participants.map(user => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      {user.name.charAt(0)}
                    </div>
                    <span>
                      {user.name}
                      {user.id === currentUser.id && ' (You)'}
                    </span>
                  </div>
                  {conversation.isGroup && user.id !== currentUser.id && (
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<UserMinus size={16} />}
                      onClick={() => handleRemoveMember(user.id)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    
      <div className="flex flex-col h-[75vh] rounded-lg overflow-hidden border dark:border-gray-700">
        {/* Chat Header */}
        <div className={`p-4 flex items-center justify-between border-b ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              conversation.isGroup 
                ? theme === 'dark' ? 'bg-indigo-900/50 text-indigo-200' : 'bg-indigo-100 text-indigo-600'
                : theme === 'dark' ? 'bg-teal-900/50 text-teal-200' : 'bg-teal-100 text-teal-600'
            }`}>
              {conversation.isGroup ? (
                <Users size={20} />
              ) : (
                <User size={18} />
              )}
            </div>
            
            <div>
              <h3 className="font-semibold">
                {conversation.isGroup 
                  ? conversation.groupName 
                  : conversation.participants.find(p => p.id !== currentUser.id)?.name
                }
              </h3>
              <button
                onClick={() => setShowMembersModal(true)}
                className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
              >
                {conversation.participants.length} participants
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              icon={<Download size={18} />}
              onClick={onDownload}
              aria-label="Download conversation"
            />
            
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                icon={<MoreVertical size={18} />}
                onClick={() => setShowDropdown(!showDropdown)}
                aria-label="More options"
              />
              
              {showDropdown && (
                <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10 ${
                  theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                }`}>
                  <div className="py-1">
                    <button
                      className={`flex items-center w-full text-left px-4 py-2 text-sm ${
                        theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      }`}
                      onClick={() => setShowMembersModal(true)}
                    >
                      Manage Members
                    </button>
                    <button
                      className={`flex items-center w-full text-left px-4 py-2 text-sm ${
                        theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      Mute Notifications
                    </button>
                    <button
                      className={`flex items-center w-full text-left px-4 py-2 text-sm ${
                        theme === 'dark' ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-600'
                      }`}
                    >
                      Delete Conversation
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Messages Area */}
        <div 
          className={`flex-1 p-4 overflow-y-auto ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
          }`}
        >
          {messageGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-6">
              <div className="flex justify-center mb-4">
                <div className={`px-3 py-1 rounded-full text-xs ${
                  theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'
                }`}>
                  {formatDate(group.date)}
                </div>
              </div>
              
              {group.messages.map((msg, msgIndex) => {
                const sender = getUserById(msg.senderId);
                const isCurrentUser = msg.senderId === currentUser.id;
                const showSender = 
                  conversation.isGroup && 
                  !isCurrentUser && 
                  (msgIndex === 0 || 
                   group.messages[msgIndex - 1].senderId !== msg.senderId);
                
                return (
                  <div 
                    key={msg.id} 
                    className={`mb-4 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%]`}>
                      {showSender && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 ml-2 mb-1">
                          {sender.nickname || sender.name}
                        </div>
                      )}
                      
                      <div className={`rounded-lg p-3 ${
                        isCurrentUser 
                          ? theme === 'dark'
                            ? 'bg-teal-600 text-white'
                            : 'bg-teal-500 text-white'
                          : theme === 'dark'
                            ? 'bg-gray-800 text-white'
                            : 'bg-white text-gray-800 border border-gray-200'
                      }`}>
                        {msg.content && (
                          <div className="whitespace-pre-wrap mb-2">{msg.content}</div>
                        )}
                        
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="space-y-2">
                            {msg.attachments.map(attachment => (
                              <div 
                                key={attachment.id}
                                className={`rounded p-2 ${
                                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                                }`}
                              >
                                {attachment.type === 'image' ? (
                                  <div className="w-full">
                                    <img 
                                      src={attachment.url} 
                                      alt={attachment.name}
                                      className="w-full h-auto rounded"
                                    />
                                    <div className="text-xs mt-1 text-gray-400">
                                      {attachment.name}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <div className={`mr-2 p-2 rounded ${
                                      theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                                    }`}>
                                      <Paperclip size={16} />
                                    </div>
                                    <div>
                                      <div className={`text-sm ${
                                        isCurrentUser && theme !== 'dark' ? 'text-white' : ''
                                      }`}>
                                        {attachment.name}
                                      </div>
                                      <div className="text-xs text-gray-400">
                                        {attachment.type.toUpperCase()} Document
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className={`text-xs mt-1 text-right ${
                          isCurrentUser
                            ? 'text-teal-200 dark:text-teal-200'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className={`p-3 border-t ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className={`relative rounded p-2 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  }`}
                >
                  {file.type.startsWith('image/') ? (
                    <div className="relative w-20 h-20">
                      <img
                        src={previewUrls[index]}
                        alt={file.name}
                        className="w-full h-full object-cover rounded"
                      />
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Paperclip size={16} className="mr-2" />
                      <span className="text-sm truncate max-w-[100px]">{file.name}</span>
                      <button
                        onClick={() => removeFile(index)}
                        className="ml-2 text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Input Area */}
        <div className={`p-3 border-t ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`p-2 rounded-full ${
                theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
              }`}
              aria-label="Attach files"
            >
              <Paperclip size={20} />
            </button>
            
            <div className="flex-1">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className={`w-full rounded-lg p-3 resize-none ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white border-gray-600 focus:border-gray-500'
                    : 'bg-gray-100 text-gray-900 border-gray-200 focus:border-gray-300'
                } border focus:outline-none focus:ring-1 focus:ring-teal-500`}
                rows={1}
              />
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() && selectedFiles.length === 0}
              className={`p-2 rounded-full transition-colors ${
                message.trim() || selectedFiles.length > 0
                  ? theme === 'dark'
                    ? 'bg-teal-600 text-white hover:bg-teal-700'
                    : 'bg-teal-500 text-white hover:bg-teal-600'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-400'
                    : 'bg-gray-200 text-gray-400'
              }`}
              aria-label="Send message"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatInterface;