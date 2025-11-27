import { useState, useEffect, useRef } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { ChatBubble } from './components/ChatBubble';
import { ChatInput } from './components/ChatInput';
import { ConfirmDialog } from './components/ConfirmDialog';
import { SessionDocuments } from './components/SessionDocuments';
import axios from 'axios';
import type { DocumentInfo } from './services/documentService';
import {
  getKnowledgeBaseDocuments,
  getDocumentsBySession,
  deleteDocument,
  clearSessionDocuments,
  clearAllDocuments
} from './services/documentService';

interface Message {
  role: 'user' | 'ai';
  content: string;
  retrievedKnowledge?: string;
}

interface Session {
  sessionId: string;
  title: string;
  lastMessageTime: string;
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: '你好！我是 e-talk AI 助手。你可以上传文档或直接开始对话。' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>(String(Date.now()));
  const [sessions, setSessions] = useState<Session[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  // 文档管理状态
  const [knowledgeBaseDocuments, setKnowledgeBaseDocuments] = useState<DocumentInfo[]>([]);
  const [sessionDocuments, setSessionDocuments] = useState<DocumentInfo[]>([]);
  const [isLoadingKnowledge, setIsLoadingKnowledge] = useState(false);
  const [isLoadingSessionDocs, setIsLoadingSessionDocs] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<{ id: string; type: 'knowledge' | 'session' } | null>(null);
  const [showClearKnowledgeConfirm, setShowClearKnowledgeConfirm] = useState(false);
  const [showClearSessionDocsConfirm, setShowClearSessionDocsConfirm] = useState(false);


  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    // Use a small timeout to ensure DOM is updated
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Fetch session list on mount
  useEffect(() => {
    fetchSessions();
    fetchKnowledgeBaseDocuments();
  }, []);

  // Fetch session documents when session changes
  useEffect(() => {
    if (sessionId) {
      fetchSessionDocuments();
    }
  }, [sessionId]);

  const fetchSessions = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const response = await axios.get(`${baseUrl}/ai/history/list`);
      setSessions(response.data);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  // 获取知识库文档列表
  const fetchKnowledgeBaseDocuments = async () => {
    setIsLoadingKnowledge(true);
    try {
      const docs = await getKnowledgeBaseDocuments();
      setKnowledgeBaseDocuments(docs);
    } catch (error) {
      console.error('Failed to fetch knowledge base documents:', error);
    } finally {
      setIsLoadingKnowledge(false);
    }
  };

  // 获取当前会话文档列表
  const fetchSessionDocuments = async () => {
    if (!sessionId) return;

    setIsLoadingSessionDocs(true);
    try {
      const docs = await getDocumentsBySession(sessionId);
      setSessionDocuments(docs);
    } catch (error) {
      console.error('Failed to fetch session documents:', error);
    } finally {
      setIsLoadingSessionDocs(false);
    }
  };

  // 知识库上传完成后刷新
  const handleUploadToKnowledgeBase = () => {
    fetchKnowledgeBaseDocuments();
  };

  // 删除知识库文档
  const handleDeleteKnowledgeDocument = (docId: string) => {
    setDocumentToDelete({ id: docId, type: 'knowledge' });
  };

  // 删除会话文档
  const handleDeleteSessionDocument = (docId: string) => {
    setDocumentToDelete({ id: docId, type: 'session' });
  };

  // 确认删除文档
  const confirmDeleteDocument = async () => {
    if (!documentToDelete) return;

    const { id, type } = documentToDelete;
    setDocumentToDelete(null);

    try {
      await deleteDocument(id);

      // 刷新对应的文档列表
      if (type === 'knowledge') {
        fetchKnowledgeBaseDocuments();
      } else {
        fetchSessionDocuments();
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert('删除失败，请稍后重试');
    }
  };

  // 清空知识库
  const handleClearKnowledgeBase = () => {
    setShowClearKnowledgeConfirm(true);
  };

  const confirmClearKnowledgeBase = async () => {
    setShowClearKnowledgeConfirm(false);

    try {
      await clearAllDocuments();
      fetchKnowledgeBaseDocuments();
    } catch (error) {
      console.error('Failed to clear knowledge base:', error);
      alert('清空失败，请稍后重试');
    }
  };

  // 清空当前会话文档
  const handleClearSessionDocuments = () => {
    setShowClearSessionDocsConfirm(true);
  };

  const confirmClearSessionDocuments = async () => {
    setShowClearSessionDocsConfirm(false);

    if (!sessionId) return;

    try {
      await clearSessionDocuments(sessionId);
      fetchSessionDocuments();
    } catch (error) {
      console.error('Failed to clear session documents:', error);
      alert('清空失败，请稍后重试');
    }
  };


  const handleNewChat = () => {
    setSessionId(String(Date.now()));
    setMessages([{ role: 'ai', content: '你好！我是 e-talk AI 助手。你可以上传文档或直接开始对话。' }]);
  };

  const handleSessionSelect = async (id: string) => {
    if (id === sessionId) return;

    setIsLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const response = await axios.get(`${baseUrl}/ai/history/detail`, {
        params: { sessionId: id }
      });

      setSessionId(response.data.sessionId);
      setMessages(response.data.messages);
      // Update session list to reflect latest changes if needed
      fetchSessions();
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setSessionToDelete(id);
  };

  const confirmDelete = async () => {
    if (!sessionToDelete) return;

    const id = sessionToDelete;
    setSessionToDelete(null); // Close modal immediately

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      await axios.delete(`${baseUrl}/ai/history/delete`, {
        params: { sessionId: id }
      });

      // Remove from local state
      setSessions(prev => prev.filter(s => s.sessionId !== id));

      // If deleted session was active, switch to new chat or another session
      if (id === sessionId) {
        handleNewChat();
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
      alert('删除失败，请稍后重试');
    }
  };

  const handleSend = async (content: string) => {
    const userMsg: Message = { role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Capture current session ID to check against later
    const currentSessionId = sessionId;

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const response = await axios.post(`${baseUrl}/ai/chat/any`, {
        userPrompt: content,
        sessionId: sessionId || undefined,
      });

      const { message, sessionId: newSessionId, retrievedKnowledge } = response.data;

      // CRITICAL FIX: Check if the user has switched sessions while waiting
      // If sessionId state has changed and doesn't match the one we started with,
      // ignore this response for the UI (but we might still want to update the list)
      if (sessionId !== currentSessionId) {
        return;
      }

      // If this is a new session, update the session ID and refresh list
      if (newSessionId && newSessionId !== sessionId) {
        setSessionId(newSessionId);
        fetchSessions();
      }

      const aiMsg: Message = {
        role: 'ai',
        content: message || '系统繁忙，请稍后重试～',
        retrievedKnowledge
      };
      setMessages(prev => [...prev, aiMsg]);

      // 发送消息后刷新会话列表（因为可能会创建新会话或更新最后一条消息时间）
      fetchSessions();
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMsg: Message = {
        role: 'ai',
        content: '抱歉，发生错误，请稍后重试。'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const stopResizing = () => {
    setIsResizing(false);
  };

  const resize = (e: MouseEvent) => {
    if (isResizing) {
      const newWidth = e.clientX;
      const COLLAPSE_THRESHOLD = 240;
      const TRIGGER_CLOSE_THRESHOLD = COLLAPSE_THRESHOLD / 2;

      if (newWidth < TRIGGER_CLOSE_THRESHOLD) {
        setIsSidebarOpen(false);
        setIsResizing(false);
        setSidebarWidth(320); // Reset to default width when reopening
      } else if (newWidth < COLLAPSE_THRESHOLD) {
        // Stick at threshold
        setSidebarWidth(COLLAPSE_THRESHOLD);
      } else if (newWidth > 600) { // Max width
        setSidebarWidth(600);
      } else {
        setSidebarWidth(newWidth);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing]);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        sessions={sessions}
        currentSessionId={sessionId}
        onSessionSelect={handleSessionSelect}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteClick}
        width={sidebarWidth}
        isResizing={isResizing}
        onMouseDown={startResizing}
        knowledgeBaseDocuments={knowledgeBaseDocuments}
        onUploadToKnowledgeBase={handleUploadToKnowledgeBase}
        onDeleteKnowledgeDocument={handleDeleteKnowledgeDocument}
        onClearKnowledgeBase={handleClearKnowledgeBase}
        isLoadingKnowledge={isLoadingKnowledge}
        onRefreshHistory={fetchSessions}
        onRefreshKnowledge={fetchKnowledgeBaseDocuments}
      />

      <main
        className={`
          flex-1 flex flex-col h-full transition-all duration-300 relative
        `}
        style={{ marginLeft: isSidebarOpen ? sidebarWidth : 0 }}
      >
        {/* Header */}
        <header className="h-16 flex items-center px-8 border-b border-black/5 bg-white/80 backdrop-blur-sm z-10 sticky top-0">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 -ml-2 rounded-lg hover:bg-black/5 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="ml-4 flex flex-col">
            <h1 className="text-base font-bold text-gray-800 tracking-tight">e-talk AI</h1>
            <span className="text-xs text-gray-400 font-medium">Always here to help</span>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-4xl mx-auto pt-4 pb-8">
            {/* Session Documents */}
            <SessionDocuments
              documents={sessionDocuments}
              onDelete={handleDeleteSessionDocument}
              onClearAll={handleClearSessionDocuments}
            />

            {messages.map((msg, idx) => (
              <ChatBubble
                key={idx}
                role={msg.role}
                content={msg.content}
                retrievedKnowledge={msg.retrievedKnowledge}
              />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-300 mb-6 pl-4">
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="px-6 pb-8 pt-2 bg-gradient-to-t from-[#f9fafb] via-[#f9fafb]/90 to-transparent">
          <div className="max-w-4xl mx-auto">
            <ChatInput
              onSend={handleSend}
              disabled={isLoading}
              sessionId={sessionId}
              onUploadComplete={fetchSessionDocuments}
            />
            <p className="text-center text-[10px] text-gray-400 mt-3 tracking-wide">
              AI 可能犯错，请核实重要信息
            </p>
          </div>
        </div>
      </main>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        isOpen={!!sessionToDelete}
        title="e-talk"
        message="确定要删除这个会话吗？删除后将无法恢复。"
        onConfirm={confirmDelete}
        onCancel={() => setSessionToDelete(null)}
      />

      <ConfirmDialog
        isOpen={!!documentToDelete}
        title="e-talk"
        message="确定要删除这个文档吗？删除后将无法恢复。"
        onConfirm={confirmDeleteDocument}
        onCancel={() => setDocumentToDelete(null)}
      />

      <ConfirmDialog
        isOpen={showClearKnowledgeConfirm}
        title="e-talk"
        message="确定要清空知识库吗？所有文档将被删除且无法恢复。"
        onConfirm={confirmClearKnowledgeBase}
        onCancel={() => setShowClearKnowledgeConfirm(false)}
      />

      <ConfirmDialog
        isOpen={showClearSessionDocsConfirm}
        title="e-talk"
        message="确定要清空当前会话的所有文档吗？删除后将无法恢复。"
        onConfirm={confirmClearSessionDocuments}
        onCancel={() => setShowClearSessionDocsConfirm(false)}
      />
    </div>
  );
}

export default App;
