import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Loader2 } from 'lucide-react';
import axios from 'axios';

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
    sessionId?: string;
    onUploadComplete?: () => void;
}

export function ChatInput({ onSend, disabled, sessionId, onUploadComplete }: ChatInputProps) {
    const [input, setInput] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
        }
    };

    const handleSend = () => {
        if (input.trim() && !disabled) {
            onSend(input);
            setInput('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSend();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            await uploadFile(file);
            // Reset input
            e.target.value = '';
        }
    };

    const uploadFile = async (file: File) => {
        if (!sessionId) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('sessionId', sessionId);

        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
            await axios.post(`${baseUrl}/ai/doc/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            // 上传成功后触发回调
            onUploadComplete?.();
        } catch (error) {
            console.error('Upload failed:', error);
            alert('上传失败，请重试');
        } finally {
            setIsUploading(false);
        }
    };

    useEffect(() => {
        adjustHeight();
    }, [input]);

    return (
        <div className="relative w-full">
            <form
                onSubmit={handleSubmit}
                className={`
          relative flex items-end gap-2 p-2
          bg-white rounded-2xl
          border transition-all duration-200
          ${isFocused
                        ? 'border-gray-300 shadow-lg'
                        : 'border-gray-200 shadow-sm hover:shadow-md'
                    }
        `}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.docx,.doc,.txt,.md,.html,.htm,.xlsx,.xls"
                />

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isUploading}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                    title="上传文件 / Upload File"
                >
                    {isUploading ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <Paperclip size={18} />
                    )}
                </button>

                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="输入消息... / Type a message..."
                    rows={1}
                    className="flex-1 max-h-32 py-2 px-2 bg-transparent border-none focus:outline-none focus:ring-0 resize-none text-[15px] leading-relaxed text-gray-900 placeholder-gray-400 custom-scrollbar"
                    style={{ minHeight: '24px' }}
                />

                <button
                    type="submit"
                    disabled={!input.trim() || disabled}
                    className={`
            p-1.5 rounded-lg transition-all duration-200 flex-shrink-0
            flex items-center justify-center
            ${input.trim() && !disabled
                            ? 'bg-gray-900 text-white hover:bg-gray-800'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }
          `}
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
}
