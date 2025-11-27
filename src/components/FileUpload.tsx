import React, { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import axios from 'axios';

interface FileUploadProps {
    onUploadComplete: () => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            await uploadFile(files[0]);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            await uploadFile(e.target.files[0]);
        }
    };

    const uploadFile = async (file: File) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
            await axios.post(`${baseUrl}/ai/doc/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onUploadComplete();
        } catch (error) {
            console.error('Upload failed:', error);
            // In a real app, show error toast
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="w-full">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
          relative group cursor-pointer
          flex flex-col items-center justify-center w-full h-28
          rounded-lg border-2 border-dashed transition-all duration-300
          ${isDragging
                        ? 'border-gray-900 bg-gray-100'
                        : 'border-gray-300 hover:border-gray-600 hover:bg-gray-50'
                    }
        `}
            >
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileSelect}
                    disabled={isUploading}
                    accept=".pdf,.docx,.doc,.txt,.md,.html,.htm,.xlsx,.xls"
                />

                {isUploading ? (
                    <div className="flex flex-col items-center gap-2 text-gray-600">
                        <Loader2 className="animate-spin" size={22} />
                        <span className="text-sm font-medium ink-text">上传中...</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-gray-700">
                        <Upload size={22} />
                        <span className="text-sm font-medium ink-text">拖拽文档到此处</span>
                        <span className="text-xs text-gray-400">支持 PDF, Word, Excel, Markdown, HTML, TXT</span>
                    </div>
                )}
            </div>
        </div>
    );
}
