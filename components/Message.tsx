import React, { useState } from 'react';
import { Message as MessageType, Sender } from '../types';
import ShareButton from './ShareButton';

const MedicalContextBadge: React.FC<{ message: MessageType }> = ({ message }) => {
    if (message.sender !== Sender.User || !message.uploadedImages) {
        return null;
    }

    const hasLabReport = message.uploadedImages.some(img => 
        img.name.toLowerCase().includes('lab') ||
        img.name.toLowerCase().includes('blood') ||
        img.name.toLowerCase().includes('test')
    );
    
    const hasXray = message.uploadedImages.some(img => 
        img.name.toLowerCase().includes('xray') || 
        img.name.toLowerCase().includes('scan') ||
        img.name.toLowerCase().includes('mri')
    );
    
    if (hasLabReport || hasXray) {
        return (
            <div className="flex flex-wrap gap-2 mb-2">
                {hasLabReport && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                        🧪 Lab Analysis
                    </span>
                )}
                {hasXray && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                        📊 Imaging Review
                    </span>
                )}
            </div>
        );
    }
    return null;
};


const Message: React.FC<{ message: MessageType, onImageClick: (url: string) => void, onSuggestionClick?: (suggestion: string) => void }> = ({ message, onImageClick, onSuggestionClick }) => {
    const isUser = message.sender === Sender.User;
    const [showActions, setShowActions] = useState(false);

    return (
        <div className={`group flex items-start gap-4 ${isUser ? 'justify-end' : ''}`}>
            <div className={`max-w-xl w-full ${isUser ? 'ml-12' : 'mr-12'}`}>
                <div className="relative">
                    <div className={`p-4 rounded-2xl shadow-md text-base ${isUser ? 'theme-surface border theme-border rounded-br-lg' : 'theme-surface border-2 border-[var(--color-accent)] theme-text rounded-bl-lg'}`}
                         onMouseEnter={() => setShowActions(true)}
                         onMouseLeave={() => setShowActions(false)}
                    >
                    {!isUser && (
                         <div className="flex items-center gap-2 font-bold text-[#2E7D95] mb-2">
                             <i className="fas fa-hospital-user"></i>
                             <span>MediTeach AI</span>
                         </div>
                    )}
                    {isUser && <MedicalContextBadge message={message} />}
                    {message.uploadedImages && message.uploadedImages.length > 0 && (
                        <div className="mb-3">
                            <div className={`grid gap-2 ${message.uploadedImages.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                {message.uploadedImages.map((image, index) => (
                                    <div key={index} className="bg-slate-200 rounded-lg overflow-hidden">
                                        <img src={image.url} alt={image.name} title={image.name} className="max-h-40 w-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {message.text && (
                        <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                    )}
                    {message.imageUrl && (
                        <div className="mt-4">
                            <button 
                                onClick={() => onImageClick(message.imageUrl!)} 
                                className="block w-full rounded-lg border border-slate-200 overflow-hidden hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A90A4]"
                                aria-label="Enlarge generated image"
                            >
                                <img src={message.imageUrl} alt="Generated medical illustration" className="w-full" />
                            </button>
                        </div>
                    )}
                     {message.suggestions && message.suggestions.length > 0 && !isUser && (
                        <div className="mt-4 pt-4 border-t theme-border flex flex-wrap gap-2">
                            {message.suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => onSuggestionClick?.(suggestion)}
                                    className="theme-button-secondary text-xs px-3 py-1.5 rounded-full transition-all"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Message Actions */}
                {(showActions || window.innerWidth <= 768) && !isUser && (
                    <div className="flex items-center justify-end gap-2 mt-2 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ShareButton
                            content={message}
                            contentType="message"
                            variant="icon"
                            size="sm"
                        />
                        
                        {message.imageUrl && (
                            <button
                                onClick={() => onImageClick(message.imageUrl!)}
                                className="w-6 h-6 flex items-center justify-center rounded-full transition-all hover:bg-gray-100 dark:hover:bg-gray-700 p-1"
                                title="View full image"
                            >
                                <i className="fas fa-expand text-xs text-gray-500 hover:text-blue-500"></i>
                            </button>
                        )}
                        
                        <button
                            onClick={() => {
                                const text = message.text;
                                navigator.clipboard.writeText(text).then(() => {
                                    // Could show a toast notification here
                                });
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded-full transition-all hover:bg-gray-100 dark:hover:bg-gray-700 p-1"
                            title="Copy text"
                        >
                            <i className="fas fa-copy text-xs text-gray-500 hover:text-green-500"></i>
                        </button>
                    </div>
                )}
            </div>
            </div>
        </div>
    );
};

export default Message;