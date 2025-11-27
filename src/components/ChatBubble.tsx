import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useState } from 'react';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ChatBubbleProps {
    role: 'user' | 'ai';
    content: string;
    retrievedKnowledge?: string;
}

export function ChatBubble({ role, content, retrievedKnowledge }: ChatBubbleProps) {
    const isUser = role === 'user';
    const [copied, setCopied] = useState(false);
    const [isKnowledgeExpanded, setIsKnowledgeExpanded] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className={cn(
            "flex w-full gap-3 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300",
            isUser ? "flex-row-reverse" : "flex-row"
        )}>


            {/* Message Group */}
            <div className={cn(
                "flex flex-col max-w-[85%] sm:max-w-[75%]",
                isUser ? "items-end" : "items-start"
            )}>
                <div className={cn(
                    "relative group px-3 py-2 rounded-2xl text-sm leading-relaxed shadow-sm transition-all duration-200",
                    isUser
                        ? "bg-gray-900 text-white rounded-tr-sm shadow-gray-200/50"
                        : "bg-white text-gray-800 border border-black/5 rounded-tl-sm shadow-gray-100"
                )}>
                    {/* Retrieved Knowledge Section */}
                    {retrievedKnowledge && !isUser && (
                        <div className="mb-2">
                            <div className={`
                                rounded-xl overflow-hidden transition-all duration-300 border
                                ${isKnowledgeExpanded
                                    ? 'bg-gray-50 border-gray-200/60'
                                    : 'bg-transparent border-transparent hover:bg-gray-50 hover:border-gray-100'
                                }
                            `}>
                                <button
                                    onClick={() => setIsKnowledgeExpanded(!isKnowledgeExpanded)}
                                    className="flex items-center gap-2 px-3 py-2 w-full text-left group/btn"
                                >
                                    <div className={`
                                        p-1 rounded-md transition-colors duration-200
                                        ${isKnowledgeExpanded ? 'bg-gray-200 text-gray-600' : 'bg-gray-100 text-gray-400 group-hover/btn:text-gray-600'}
                                    `}>
                                        {isKnowledgeExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 select-none">
                                        引用了知识库内容
                                    </span>
                                </button>

                                {isKnowledgeExpanded && (
                                    <div className="px-4 pb-4 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <div className="prose prose-xs max-w-none prose-gray text-gray-600
                                            [&>p]:leading-relaxed
                                            [&>pre]:bg-white [&>pre]:border [&>pre]:border-gray-200 [&>pre]:text-gray-800
                                            [&>table]:w-full [&>table]:border-collapse [&>table]:text-xs
                                            [&>th]:bg-gray-100 [&>th]:p-2 [&>th]:text-left [&>th]:font-medium [&>th]:text-gray-700
                                            [&>td]:p-2 [&>td]:border-t [&>td]:border-gray-100
                                        ">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {retrievedKnowledge}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className={cn(
                        "prose prose-sm max-w-none break-words",
                        isUser ? "prose-invert" : "prose-gray",
                        "[&>p]:m-0 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
                        "[&>pre]:bg-gray-800/50 [&>pre]:rounded-lg [&>pre]:p-3",
                        "[&>code]:text-xs [&>code]:font-mono"
                    )}>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                img: ({ node, ...props }) => (
                                    <img
                                        {...props}
                                        className="rounded-lg border border-black/5 my-2 max-w-full h-auto shadow-sm"
                                        loading="lazy"
                                    />
                                )
                            }}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>

                    {/* Copy Button */}
                    <button
                        onClick={handleCopy}
                        className={cn(
                            "absolute -bottom-6 p-1.5 rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100",
                            isUser ? "right-0" : "left-0",
                            "hover:bg-gray-100 text-gray-400 hover:text-gray-600",
                            copied && "text-green-500 hover:text-green-600 opacity-100"
                        )}
                        title="复制内容 / Copy"
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
