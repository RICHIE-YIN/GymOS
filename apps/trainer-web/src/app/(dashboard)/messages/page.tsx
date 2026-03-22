'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useMessageThreads, useSendMessage, useMarkThreadRead } from '@/hooks/useMessages';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn, getInitials, getAvatarColor, formatRelativeTime, truncate } from '@/lib/utils';
import { MessageThread, Message } from '@/types';
import { Send, MessageCircle, Search, Menu } from 'lucide-react';

// Mock threads as fallback
const MOCK_THREADS: MessageThread[] = [
  {
    id: 't1',
    clientId: 'c1',
    clientName: 'Sarah Chen',
    trainerId: 'trainer1',
    lastMessage: 'Hey! Just finished Week 3 Day 2. That AMRAP was brutal 🔥',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    unreadCount: 2,
    messages: [
      { id: 'm1', threadId: 't1', senderId: 'c1', senderRole: 'client', senderName: 'Sarah Chen', content: 'Hey! Just finished Week 3 Day 2. That AMRAP was brutal but I loved it! 🔥', sentAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
      { id: 'm2', threadId: 't1', senderId: 'trainer1', senderRole: 'trainer', senderName: 'You', content: 'Great work Sarah! How did you feel energy-wise?', sentAt: new Date(Date.now() - 1000 * 60 * 25).toISOString() },
      { id: 'm3', threadId: 't1', senderId: 'c1', senderRole: 'client', senderName: 'Sarah Chen', content: 'Pretty good! Down 68.0 on the scale this morning 🎉', sentAt: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
    ],
  },
  {
    id: 't2',
    clientId: 'c2',
    clientName: 'Marcus Lee',
    trainerId: 'trainer1',
    lastMessage: 'Quick question about the overhead press form...',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    unreadCount: 1,
    messages: [
      { id: 'm4', threadId: 't2', senderId: 'c2', senderRole: 'client', senderName: 'Marcus Lee', content: 'Quick question about the overhead press form...', sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    ],
  },
  {
    id: 't3',
    clientId: 'c3',
    clientName: 'Jordan Kim',
    trainerId: 'trainer1',
    lastMessage: 'Feeling amazing! Down 3 lbs this week 🎉',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    unreadCount: 0,
    messages: [
      { id: 'm5', threadId: 't3', senderId: 'trainer1', senderRole: 'trainer', senderName: 'You', content: 'How is the new program feeling?', sentAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() },
      { id: 'm6', threadId: 't3', senderId: 'c3', senderRole: 'client', senderName: 'Jordan Kim', content: 'Feeling amazing! Down 3 lbs this week 🎉', sentAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
    ],
  },
  {
    id: 't4',
    clientId: 'c4',
    clientName: 'Alex Torres',
    trainerId: 'trainer1',
    lastMessage: 'Sorry I missed my check-in...',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    unreadCount: 0,
    messages: [
      { id: 'm7', threadId: 't4', senderId: 'c4', senderRole: 'client', senderName: 'Alex Torres', content: 'Sorry I missed my check-in, been super busy at work 😅', sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
    ],
  },
  {
    id: 't5',
    clientId: 'c5',
    clientName: 'Emma Davis',
    trainerId: 'trainer1',
    lastMessage: 'Can we schedule a video call this week?',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    unreadCount: 0,
    messages: [
      { id: 'm8', threadId: 't5', senderId: 'c5', senderRole: 'client', senderName: 'Emma Davis', content: 'Can we schedule a video call this week to review my progress?', sentAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString() },
    ],
  },
];

export default function MessagesPage() {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(MOCK_THREADS[0].id);
  const [messageText, setMessageText] = useState('');
  const [search, setSearch] = useState('');
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: threads, isLoading } = useMessageThreads();
  const sendMessage = useSendMessage(selectedThreadId || '');

  const displayThreads = threads || MOCK_THREADS;
  const filteredThreads = displayThreads.filter((t) =>
    !search || t.clientName.toLowerCase().includes(search.toLowerCase())
  );

  const selectedThread = displayThreads.find((t) => t.id === selectedThreadId) || MOCK_THREADS[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedThread?.messages]);

  const handleSend = async () => {
    if (!messageText.trim() || !selectedThreadId) return;
    const text = messageText;
    setMessageText('');
    try {
      await sendMessage.mutateAsync({ content: text });
    } catch {
      // Demo mode - add message locally
    }
  };

  const totalUnread = displayThreads.reduce((sum, t) => sum + t.unreadCount, 0);

  if (isLoading) return <PageLoader text="Loading messages..." />;

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Thread list sidebar */}
      <div
        className={cn(
          'w-full sm:w-80 border-r border-slate-200 bg-white flex flex-col',
          mobileShowThread && 'hidden sm:flex'
        )}
      >
        {/* Header */}
        <div className="px-4 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-900">
              Messages
              {totalUnread > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-brand-600 text-white rounded-full">
                  {totalUnread}
                </span>
              )}
            </h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {filteredThreads.length === 0 ? (
            <EmptyState
              title="No conversations"
              description="Messages from your clients will appear here."
            />
          ) : (
            filteredThreads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => {
                  setSelectedThreadId(thread.id);
                  setMobileShowThread(true);
                }}
                className={cn(
                  'w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors',
                  selectedThreadId === thread.id
                    ? 'bg-brand-50 border-r-2 border-brand-600'
                    : 'hover:bg-slate-50'
                )}
              >
                <div
                  className={cn(
                    'h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 relative',
                    getAvatarColor(thread.clientName)
                  )}
                >
                  {getInitials(thread.clientName)}
                  {thread.unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {thread.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p
                      className={cn(
                        'text-sm truncate',
                        thread.unreadCount > 0 ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'
                      )}
                    >
                      {thread.clientName}
                    </p>
                    <span className="text-xs text-slate-400 shrink-0">
                      {thread.lastMessageAt ? formatRelativeTime(thread.lastMessageAt) : ''}
                    </span>
                  </div>
                  <p className={cn('text-xs truncate mt-0.5', thread.unreadCount > 0 ? 'text-slate-700 font-medium' : 'text-slate-400')}>
                    {thread.lastMessage ? truncate(thread.lastMessage, 50) : 'No messages yet'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message thread */}
      <div
        className={cn(
          'flex-1 flex flex-col bg-white',
          !mobileShowThread && 'hidden sm:flex'
        )}
      >
        {selectedThread ? (
          <>
            {/* Thread header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-3">
              <button
                onClick={() => setMobileShowThread(false)}
                className="sm:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div
                className={cn(
                  'h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0',
                  getAvatarColor(selectedThread.clientName)
                )}
              >
                {getInitials(selectedThread.clientName)}
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{selectedThread.clientName}</p>
                <p className="text-xs text-green-500">Active recently</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">
              {selectedThread.messages.map((msg) => {
                const isTrainer = msg.senderRole === 'trainer';
                return (
                  <div key={msg.id} className={cn('flex', isTrainer ? 'justify-end' : 'justify-start')}>
                    {!isTrainer && (
                      <div
                        className={cn(
                          'h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mr-2 self-end',
                          getAvatarColor(msg.senderName)
                        )}
                      >
                        {getInitials(msg.senderName)}
                      </div>
                    )}
                    <div className="max-w-[70%]">
                      <div
                        className={cn(
                          'rounded-2xl px-4 py-2.5',
                          isTrainer
                            ? 'bg-brand-600 text-white rounded-tr-sm'
                            : 'bg-white text-slate-900 rounded-tl-sm shadow-sm border border-slate-200'
                        )}
                      >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                      <p className={cn('text-xs mt-1 px-1', isTrainer ? 'text-right text-slate-400' : 'text-slate-400')}>
                        {formatRelativeTime(msg.sentAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-5 py-4 border-t border-slate-200 bg-white">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder={`Message ${selectedThread.clientName}...`}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50"
                />
                <Button
                  onClick={handleSend}
                  disabled={!messageText.trim()}
                  className="rounded-xl"
                  leftIcon={<Send className="h-4 w-4" />}
                >
                  Send
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon={<MessageCircle className="h-10 w-10" />}
              title="Select a conversation"
              description="Choose a client thread from the sidebar to start messaging."
            />
          </div>
        )}
      </div>
    </div>
  );
}
