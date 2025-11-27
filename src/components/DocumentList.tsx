import { File, Trash2, Loader2 } from 'lucide-react';
import type { DocumentInfo } from '../services/documentService';
import { formatFileSize, formatUploadTime } from '../utils/formatters';

interface DocumentListProps {
    documents: DocumentInfo[];
    onDelete: (docId: string) => void;
    isLoading?: boolean;
    emptyMessage?: string;
}

export function DocumentList({ documents, onDelete, isLoading, emptyMessage = '暂无文档' }: DocumentListProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8 text-gray-400">
                <Loader2 className="animate-spin" size={20} />
                <span className="ml-2 text-sm">加载中...</span>
            </div>
        );
    }

    if (documents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <File size={32} className="mb-2 opacity-30" />
                <span className="text-sm">{emptyMessage}</span>
            </div>
        );
    }

    return (
        <div className="space-y-1.5">
            {documents.map((doc) => (
                <div
                    key={doc.id}
                    className="group relative flex items-start gap-2 p-2.5 rounded-lg bg-white border border-black/5 hover:border-black/10 hover:bg-gray-50 transition-all"
                >
                    <div className="flex-shrink-0 mt-0.5">
                        <div className="w-7 h-7 bg-gray-100 rounded flex items-center justify-center border border-black/5">
                            <File size={14} className="text-gray-500" />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-800 truncate pr-6">
                            {doc.filename}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400">
                            <span>{formatFileSize(doc.size)}</span>
                            <span>•</span>
                            <span>{doc.chunkCount} 块</span>
                            <span>•</span>
                            <span>{formatUploadTime(doc.uploadTime)}</span>
                        </div>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(doc.id);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        title="删除 / Delete"
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
            ))}
        </div>
    );
}
