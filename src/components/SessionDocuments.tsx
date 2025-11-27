import { File, X, Trash2 } from 'lucide-react';
import type { DocumentInfo } from '../services/documentService';
import { formatFileSize } from '../utils/formatters';

interface SessionDocumentsProps {
    documents: DocumentInfo[];
    onDelete: (docId: string) => void;
    onClearAll?: () => void;
}

export function SessionDocuments({ documents, onDelete, onClearAll }: SessionDocumentsProps) {
    if (documents.length === 0) {
        return null;
    }

    return (
        <div className="mb-4 px-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    当前会话文档 ({documents.length})
                </span>
                {onClearAll && documents.length > 0 && (
                    <button
                        onClick={onClearAll}
                        className="text-[10px] text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                    >
                        <Trash2 size={10} />
                        <span>清空</span>
                    </button>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                {documents.map((doc) => (
                    <div
                        key={doc.id}
                        className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-black/10 rounded-lg text-xs hover:border-black/20 hover:shadow-sm transition-all"
                    >
                        <File size={12} className="text-gray-500 flex-shrink-0" />
                        <span className="text-gray-700 font-medium max-w-[120px] truncate">
                            {doc.filename}
                        </span>
                        <span className="text-[10px] text-gray-400">
                            {formatFileSize(doc.size)}
                        </span>
                        <button
                            onClick={() => onDelete(doc.id)}
                            className="p-0.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all ml-0.5"
                            title="删除 / Delete"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
