import { useState } from 'react';
import { Settings, MessageSquare, Plus, Trash2 } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { DocumentList } from './DocumentList';
import type { DocumentInfo } from '../services/documentService';

interface Session {
    sessionId: string;
    title: string;
    lastMessageTime: string;
}

interface SidebarProps {
    isOpen: boolean;
    sessions: Session[];
    currentSessionId: string;
    onSessionSelect: (sessionId: string) => void;
    onNewChat: () => void;
    onDeleteSession: (sessionId: string) => void;
    width: number;
    isResizing: boolean;
    onMouseDown: (e: React.MouseEvent) => void;
    // 知识库相关
    knowledgeBaseDocuments: DocumentInfo[];
    onUploadToKnowledgeBase: () => void;
    onDeleteKnowledgeDocument: (docId: string) => void;
    onClearKnowledgeBase: () => void;
    isLoadingKnowledge?: boolean;
    // 数据刷新回调
    onRefreshHistory?: () => void;
    onRefreshKnowledge?: () => void;
}

export function Sidebar({
    isOpen,
    sessions,
    currentSessionId,
    onSessionSelect,
    onNewChat,
    onDeleteSession,
    width,
    isResizing,
    onMouseDown,
    knowledgeBaseDocuments,
    onUploadToKnowledgeBase,
    onDeleteKnowledgeDocument,
    onClearKnowledgeBase,
    isLoadingKnowledge,
    onRefreshHistory,
    onRefreshKnowledge
}: SidebarProps) {
    const [activeTab, setActiveTab] = useState<'history' | 'knowledge' | 'settings'>('history');

    // Tab 切换时刷新对应数据
    const handleTabChange = (tab: 'history' | 'knowledge' | 'settings') => {
        setActiveTab(tab);

        // 切换到历史 Tab 时刷新会话列表
        if (tab === 'history' && onRefreshHistory) {
            onRefreshHistory();
        }

        // 切换到知识库 Tab 时刷新文档列表
        if (tab === 'knowledge' && onRefreshKnowledge) {
            onRefreshKnowledge();
        }
    };


    return (
        <aside
            className={`
        fixed left-0 top-0 h-full bg-white/95 backdrop-blur-sm border-r border-black/5
        transition-all duration-0 z-20 flex flex-col overflow-hidden group/sidebar
        ${isOpen ? 'translate-x-0' : '-translate-x-full opacity-0'}
        ${isResizing ? 'select-none transition-none' : 'transition-all duration-300'}
      `}
            style={{ width: isOpen ? width : 0 }}
        >
            <div className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-black/5">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center border border-black/5">
                        <MessageSquare size={18} className="text-[#8A8A8A]" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-800 ink-text tracking-tight">
                        e-talk
                    </h1>
                </div>

                <button
                    onClick={onNewChat}
                    className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-black/10 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-black/20 transition-all shadow-sm hover:shadow-md ink-text group"
                >
                    <Plus size={18} className="text-[#8A8A8A] group-hover:text-gray-900 transition-colors" />
                    <span className="font-medium">新对话 / New Chat</span>
                </button>

                {/* Tab Navigation */}
                <div className="flex gap-1 mb-4 p-1 bg-gray-100 rounded-lg">
                    <button
                        onClick={() => handleTabChange('history')}
                        className={`
                            flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                            ${activeTab === 'history'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }
                        `}
                    >
                        历史
                    </button>
                    <button
                        onClick={() => handleTabChange('knowledge')}
                        className={`
                            flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                            ${activeTab === 'knowledge'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }
                        `}
                    >
                        知识库
                    </button>
                    <button
                        onClick={() => handleTabChange('settings')}
                        className={`
                            flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                            ${activeTab === 'settings'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }
                        `}
                    >
                        设置
                    </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-hidden">
                    {/* History Tab */}
                    {activeTab === 'history' && (
                        <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                            <h2 className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-widest mb-4 pl-2">
                                历史 / History
                            </h2>
                            <div className="space-y-1">
                                {sessions.map((session) => (
                                    <div
                                        key={session.sessionId}
                                        className="group relative"
                                    >
                                        <button
                                            onClick={() => onSessionSelect(session.sessionId)}
                                            className={`
                                                w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all border truncate pr-10
                                                ${currentSessionId === session.sessionId
                                                    ? 'bg-gray-100 text-gray-900 border-black/5 font-medium shadow-sm'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent'
                                                }
                                            `}
                                        >
                                            {session.title || '未命名会话'}
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteSession(session.sessionId);
                                            }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#8A8A8A] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                            title="删除会话 / Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Knowledge Base Tab */}
                    {activeTab === 'knowledge' && (
                        <div className="h-full flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-widest pl-2">
                                    知识库 / Knowledge Base
                                </h2>
                                {knowledgeBaseDocuments.length > 0 && (
                                    <button
                                        onClick={onClearKnowledgeBase}
                                        className="text-[10px] text-gray-400 hover:text-red-500 transition-colors px-2 py-1"
                                        title="清空知识库 / Clear All"
                                    >
                                        清空
                                    </button>
                                )}
                            </div>

                            <FileUpload onUploadComplete={onUploadToKnowledgeBase} />

                            {/* 知识库文档列表 */}
                            <div className="flex-1 mt-4 overflow-y-auto custom-scrollbar">
                                <DocumentList
                                    documents={knowledgeBaseDocuments}
                                    onDelete={onDeleteKnowledgeDocument}
                                    isLoading={isLoadingKnowledge}
                                    emptyMessage="暂无知识库文档"
                                />
                            </div>
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                            <h2 className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-widest mb-4 pl-2">
                                设置 / Settings
                            </h2>
                            <div className="space-y-2">
                                <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                    <Settings size={18} className="text-[#8A8A8A]" />
                                    <span>系统设置</span>
                                </button>
                                <div className="px-3 py-4 rounded-lg bg-gray-50 border border-black/5 mt-4">
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        更多设置功能即将推出...
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Drag Handle */}
            <div
                className={`
                    absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-black/10 transition-colors z-30
                    ${isResizing ? 'bg-black/10 w-1.5' : ''}
                `}
                onMouseDown={onMouseDown}
            />
        </aside>
    );
}
