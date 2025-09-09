import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message as MessageType, Sender, DocumentUpload } from '../types';
import Message from './Message';
import ImageModal from './ImageModal';
import Welcome from './Welcome';
import Header from './Header';
import ConversationHistory from './ConversationHistory';
import ConversationExportImport from './ConversationExportImport';
import MedicalSpecialtySelector from './MedicalSpecialtySelector';
import SpecialtyIndicator from './SpecialtyIndicator';
import VoiceControl from './VoiceControl';
import VoiceSettings from './VoiceSettings';
import UserSettings from './UserSettings';
import EnhancedDocumentUpload from './EnhancedDocumentUpload';
import OCRResultsViewer from './OCRResultsViewer';
import ShareDialog from './ShareDialog';
import ExportButton from './ExportButton';
import { generateMedicalExplanation, initializeAi } from '../services/geminiService';
import MedicalLoadingSpinner from './MedicalLoadingSpinner';
import { useConversationHistory } from '../hooks/useConversationHistory';
import { useMedicalSpecialty } from '../hooks/useMedicalSpecialty';
import { useOnboarding } from '../hooks/useOnboarding';
import { useVoice } from '../hooks/useVoice';
import OnboardingModal from './OnboardingModal';
import FirstTimeUserWelcome from './FirstTimeUserWelcome';

interface ChatInterfaceProps {
    apiKey: string;
    fileInputRef: React.RefObject<HTMLInputElement>;
    onMobileUploadClick: () => void;
    onEndSession: () => void;
}

const buildSpecializedMedicalPrompt = (userQuery: string, uploadedFiles: { file: File }[], charDesc?: string | null) => {
    const hasLabReport = uploadedFiles.some(f => 
        f.file.name.toLowerCase().includes('lab') || 
        f.file.name.toLowerCase().includes('blood') ||
        f.file.name.toLowerCase().includes('test')
    );
    
    const hasXray = uploadedFiles.some(f => 
        f.file.name.toLowerCase().includes('xray') || 
        f.file.name.toLowerCase().includes('scan') ||
        f.file.name.toLowerCase().includes('mri')
    );
    
    let specializedPrompt = `Patient Question: "${userQuery}"\n\n`;
    
    if (hasLabReport) {
        specializedPrompt += `LAB REPORT ANALYSIS TASK:
1. Analyze the uploaded lab results with medical expertise
2. Identify key values that are outside normal ranges
3. Explain what these results mean for the patient's health
4. Create a personalized health action plan visualization
5. Generate hopeful, encouraging next steps

VISUAL OUTPUT: Create a medical dashboard showing:
- Patient avatar with health status indicators
- Key lab values presented as easy-to-understand gauges
- Personalized recommendations with timeline
- Encouraging progress pathway toward optimal health`;
    } else if (hasXray) {
        specializedPrompt += `MEDICAL IMAGING ANALYSIS TASK:
1. Examine the uploaded medical images with radiological knowledge
2. Explain findings in patient-friendly terms
3. Show anatomical context for better understanding
4. Provide reassuring treatment pathway visualization

VISUAL OUTPUT: Create an educational anatomy guide showing:
- Patient avatar with highlighted area of interest
- Clear anatomical explanation with labels
- Treatment options presented visually
- Recovery timeline with encouraging milestones`;
    } else {
        specializedPrompt += `GENERAL MEDICAL EDUCATION TASK:
1. Address the patient's medical question with compassion
2. Provide comprehensive yet understandable explanation
3. Create supportive visual education materials
4. Focus on empowerment and understanding

VISUAL OUTPUT: Create a personalized medical education infographic:
- Patient avatar as central character in health journey
- Step-by-step explanation of medical concepts
- Encouraging pathway forward
- Visual reassurance and hope-building elements`;
    }
    
    if (charDesc) {
        specializedPrompt += `\n\nCHARACTER CONSISTENCY: "${charDesc}" - Show this exact person throughout their medical education journey.`;
    }
    
    return specializedPrompt;
};


const ChatInterface: React.FC<ChatInterfaceProps> = ({ apiKey, fileInputRef, onMobileUploadClick, onEndSession }) => {
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<{ file: File; base64: string; mimeType: string; }[]>([]);
    const [characterDescription, setCharacterDescription] = useState<string | null>(null);
    const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
    const [generatedImageUrls, setGeneratedImageUrls] = useState<string[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [showExportImport, setShowExportImport] = useState(false);
    const [showSpecialtySelector, setShowSpecialtySelector] = useState(false);
    const [showVoiceSettings, setShowVoiceSettings] = useState(false);
    const [showUserSettings, setShowUserSettings] = useState(false);
    const [showDocumentUpload, setShowDocumentUpload] = useState(false);
    const [documents, setDocuments] = useState<DocumentUpload[]>([]);
    const [selectedDocument, setSelectedDocument] = useState<DocumentUpload | null>(null);
    const [showShareConversation, setShowShareConversation] = useState(false);

    // Conversation history management
    const {
        currentConversation,
        currentConversationId,
        startNewConversation,
        loadConversation,
        enableAutoSave,
        disableAutoSave,
        hasHistory,
        conversationCount
    } = useConversationHistory();

    // Medical specialty management
    const {
        selectedSpecialty,
        preferences,
        setSelectedSpecialty,
        detectSpecialtyFromText,
        getQuickActions,
        generateSpecialtyPrompt
    } = useMedicalSpecialty();

    // Onboarding management
    const {
        isOnboardingOpen,
        currentFlow,
        shouldShowOnboarding,
        startOnboarding,
        closeOnboarding,
        completeOnboarding,
        checkAndStartOnboarding
    } = useOnboarding();

    // Voice functionality
    const {
        speak,
        stopSpeaking,
        settings: voiceSettings,
        error: voiceError
    } = useVoice({
        onCommand: handleVoiceCommand,
        onError: (error) => setError(`Voice Error: ${error}`),
        enableWakeWord: true
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (apiKey) {
        initializeAi(apiKey);
      }
    }, [apiKey]);

    // Check and start onboarding for new users
    useEffect(() => {
        checkAndStartOnboarding();
    }, [checkAndStartOnboarding]);

    // Load conversation when currentConversation changes
    useEffect(() => {
        if (currentConversation) {
            setMessages(currentConversation.messages);
            setCharacterDescription(currentConversation.characterDescription || null);
            
            // Extract generated image URLs from messages
            const imageUrls = currentConversation.messages
                .filter(msg => msg.imageUrl)
                .map(msg => msg.imageUrl!);
            setGeneratedImageUrls(imageUrls);
            
            console.log('📂 Loaded conversation:', currentConversation.title);
        }
    }, [currentConversation]);

    // Auto-save conversations when messages change
    useEffect(() => {
        if (messages.length > 0) {
            enableAutoSave(messages, characterDescription);
        }

        return () => {
            disableAutoSave();
        };
    }, [messages, characterDescription, enableAutoSave, disableAutoSave]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const fileList = Array.from(files);
            const newFiles: { file: File; base64: string; mimeType: string; }[] = [];
            let pendingReads = fileList.length;

            if (pendingReads === 0) return;

            fileList.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const base64 = (e.target?.result as string).split(',')[1];
                    if (base64) {
                        newFiles.push({ file, base64, mimeType: file.type });
                    }
                    pendingReads--;
                    if (pendingReads === 0) {
                        setUploadedFiles(prev => [...prev, ...newFiles]);
                    }
                };
                reader.onerror = () => {
                    pendingReads--;
                     if (pendingReads === 0) {
                        setUploadedFiles(prev => [...prev, ...newFiles]);
                    }
                }
                reader.readAsDataURL(file);
            });
             if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRemoveFile = (indexToRemove: number) => {
        setUploadedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSendMessage = useCallback(async (messageText?: string) => {
        const textToSend = typeof messageText === 'string' ? messageText : userInput;
        const trimmedInput = textToSend.trim();
        if (!trimmedInput && uploadedFiles.length === 0) return;

        setIsLoading(true);
        setError(null);
        if (typeof messageText !== 'string') {
           setUserInput('');
        }
        
        const userMessage: MessageType = {
            id: Date.now().toString(),
            sender: Sender.User,
            text: trimmedInput,
            uploadedImages: uploadedFiles.map(f => ({ name: f.file.name, url: URL.createObjectURL(f.file) }))
        };

        const currentMessages = [...messages, userMessage];
        setMessages(currentMessages);
        
        const currentUploadedFiles = uploadedFiles;
        setUploadedFiles([]);

        try {
            const conversationHistory = messages.slice(-4).map(msg => {
                return `${msg.sender}: ${msg.text}`;
            }).filter(Boolean);

            // Build base medical prompt
            const baseMedicalPrompt = buildSpecializedMedicalPrompt(
                trimmedInput,
                currentUploadedFiles,
                characterDescription
            );

            // Add specialty-specific context
            const specialtyPromptEnhancement = generateSpecialtyPrompt(trimmedInput);
            const medicalPrompt = baseMedicalPrompt + specialtyPromptEnhancement;
            
            const result = await generateMedicalExplanation(
                medicalPrompt, 
                currentUploadedFiles.map(f => ({ base64: f.base64, mimeType: f.mimeType })),
                characterDescription,
                conversationHistory
            );
            
            if (result.newCharacterDescription && !characterDescription) {
                setCharacterDescription(result.newCharacterDescription);
            }
             if (result.generatedImageUrl) {
                setGeneratedImageUrls(prev => [...prev, result.generatedImageUrl!]);
            }

            const aiMessage: MessageType = {
                id: (Date.now() + 1).toString(),
                sender: Sender.AI,
                text: result.textExplanation,
                imageUrl: result.generatedImageUrl ?? undefined,
                suggestions: result.suggestions ?? undefined,
            };
            setMessages(prev => [...prev, userMessage, aiMessage]);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
            setMessages(currentMessages);
        } finally {
            setIsLoading(false);
        }
    }, [userInput, uploadedFiles, characterDescription, messages, generateSpecialtyPrompt]);

    const handleDownloadAll = async () => {
        if (generatedImageUrls.length === 0) return;
    
        const JSZip = (window as any).JSZip;
        const saveAs = (window as any).saveAs;

        if (!JSZip || !saveAs) {
            setError("Could not download images. Required libraries not found.");
            return;
        }

        const zip = new JSZip();
        
        const imagePromises = generatedImageUrls.map(async (url, index) => {
            try {
                const response = await fetch(url);
                const blob = await response.blob();
                const extension = blob.type.split('/')[1] || 'png';
                zip.file(`mediteach-image-${index + 1}.${extension}`, blob);
            } catch (e) {
                console.error(`Failed to fetch and add image ${index + 1} to zip`, e);
            }
        });

        await Promise.all(imagePromises);

        zip.generateAsync({ type: "blob" }).then((content: any) => {
            saveAs(content, "MediTeach_AI_Images.zip");
        });
    };
    
    const handleQuickAction = (text: string) => {
        setUserInput(text);
        handleSendMessage(text);
    };

    // Conversation history handlers
    const handleShowHistory = () => {
        setShowHistory(true);
    };

    const handleSelectConversation = (conversationId: string) => {
        const conversation = loadConversation(conversationId);
        if (conversation) {
            setShowHistory(false);
        }
    };

    const handleNewConversation = () => {
        // Save current conversation if it has messages
        if (messages.length > 0) {
            enableAutoSave(messages, characterDescription);
        }
        
        // Start fresh
        startNewConversation();
        setMessages([]);
        setCharacterDescription(null);
        setGeneratedImageUrls([]);
        setUploadedFiles([]);
        setUserInput('');
        setError(null);
        
        console.log('🆕 Started new conversation');
    };

    const handleExportImportComplete = (imported: number) => {
        setShowExportImport(false);
        if (imported > 0) {
            // Optionally refresh the conversation list or show success message
            console.log(`📥 Imported ${imported} conversations`);
        }
    };

    // Medical specialty handlers
    const handleShowSpecialtySelector = () => {
        setShowSpecialtySelector(true);
    };

    const handleSpecialtyChange = (specialty: any) => {
        setSelectedSpecialty(specialty);
        setShowSpecialtySelector(false);
    };

    // Auto-detect specialty from user input
    useEffect(() => {
        if (userInput.length > 20 && !selectedSpecialty) {
            const detectedSpecialties = detectSpecialtyFromText(userInput);
            if (detectedSpecialties.length > 0) {
                // Could show a suggestion here, but for now just log it
                console.log('🔍 Detected potential specialties:', detectedSpecialties.map(s => s.name));
            }
        }
    }, [userInput, selectedSpecialty, detectSpecialtyFromText]);

    // Get current quick actions based on specialty
    const currentQuickActions = getQuickActions();

    // Onboarding demo handlers
    const handleOnboardingSpecialtyDemo = () => {
        setShowSpecialtySelector(true);
    };

    const handleOnboardingInputDemo = (text: string) => {
        setUserInput(text);
        // Auto-send the demo message after a brief delay
        setTimeout(() => {
            handleSendMessage(text);
        }, 500);
    };

    // Voice command handlers
    const handleVoiceCommand = useCallback((command: string) => {
        const lowerCommand = command.toLowerCase().trim();
        
        switch (lowerCommand) {
            case 'clear chat':
            case 'clear conversation':
                handleNewConversation();
                break;
            case 'new conversation':
            case 'start new chat':
                handleNewConversation();
                break;
            case 'show history':
            case 'conversation history':
                setShowHistory(true);
                break;
            case 'show specialties':
            case 'select specialty':
                setShowSpecialtySelector(true);
                break;
            case 'voice settings':
            case 'settings':
                setShowVoiceSettings(true);
                break;
            case 'read last message':
            case 'read response':
                if (messages.length > 0) {
                    const lastAiMessage = messages.slice().reverse().find(msg => msg.sender === Sender.AI);
                    if (lastAiMessage) {
                        speak(lastAiMessage.text).catch(console.error);
                    }
                }
                break;
            case 'help':
            case 'show help':
                const helpMessage = "You can use voice commands like: Clear chat, New conversation, Show history, Voice settings, Read last message, or just ask medical questions naturally.";
                speak(helpMessage).catch(console.error);
                break;
            default:
                console.log('Unknown voice command:', command);
        }
    }, [handleNewConversation, messages, speak]);

    // Handle voice input
    const handleVoiceInput = useCallback((transcript: string) => {
        setUserInput(transcript);
        // Auto-send voice input after a brief delay
        setTimeout(() => {
            handleSendMessage(transcript);
        }, 500);
    }, [handleSendMessage]);

    // Auto-read AI responses if enabled
    useEffect(() => {
        if (voiceSettings.autoRead && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.sender === Sender.AI && lastMessage.text) {
                speak(lastMessage.text).catch(console.error);
            }
        }
    }, [messages, voiceSettings.autoRead, speak]);

    // Enhanced document upload handlers
    const handleDocumentsUploaded = useCallback((newDocuments: DocumentUpload[]) => {
        setDocuments(newDocuments);
        
        // Convert documents to the legacy format for compatibility
        const legacyFiles = newDocuments.map(doc => ({
            file: doc.file,
            base64: '', // Will be filled when processing
            mimeType: doc.type
        }));
        
        // Process files for base64 conversion
        legacyFiles.forEach(legacyFile => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = (e.target?.result as string).split(',')[1];
                legacyFile.base64 = base64;
            };
            reader.readAsDataURL(legacyFile.file);
        });
        
        setUploadedFiles(legacyFiles);
    }, []);

    const handleOCRComplete = useCallback((document: DocumentUpload) => {
        console.log('OCR completed for:', document.name);
        
        // Add OCR results to user input if there's extracted text
        if (document.ocrResult?.text) {
            const ocrText = document.ocrResult.text.trim();
            if (ocrText) {
                setUserInput(prev => {
                    const newText = prev ? `${prev}\n\nExtracted from ${document.name}:\n${ocrText}` : `Extracted from ${document.name}:\n${ocrText}`;
                    return newText;
                });
            }
        }
    }, []);

    const handleShowDocumentUpload = () => {
        setShowDocumentUpload(true);
    };

    const handleViewOCRResults = (document: DocumentUpload) => {
        setSelectedDocument(document);
    };

    return (
        <div className="flex flex-col h-full theme-surface">
            <Header 
                imageCount={generatedImageUrls.length} 
                onDownloadAll={handleDownloadAll}
                onEndSession={onEndSession}
                onShowHistory={handleShowHistory}
                onShowSettings={() => setShowUserSettings(true)}
                conversationCount={conversationCount}
                currentConversationTitle={currentConversation?.title}
            />
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
                {messages.length === 0 ? (
                    <Welcome 
                        onShowHistory={handleShowHistory} 
                        onShowSpecialtySelector={handleShowSpecialtySelector}
                    />
                ) : (
                    messages.map((msg) => (
                        <Message key={msg.id} message={msg} onImageClick={setModalImageUrl} onSuggestionClick={handleSendMessage} />
                    ))
                )}
                 {isLoading && <MedicalLoadingSpinner />}
                {error && <div className="text-red-500 bg-red-100 p-3 rounded-lg text-center">{error}</div>}
                <div ref={messagesEndRef} />
            </div>

            <div className="theme-surface p-4 sm:p-5 lg:p-6 border-t-2 theme-border">
                {/* Medical Specialty Indicator */}
                <div className="mb-3 flex items-center justify-between">
                    <SpecialtyIndicator
                        specialty={selectedSpecialty}
                        onClick={handleShowSpecialtySelector}
                        className="text-xs"
                    />
                    <div className="text-xs text-gray-500 flex items-center space-x-1">
                        <i className="fas fa-info-circle"></i>
                        <span>Responses tailored to {selectedSpecialty?.name || 'general medicine'}</span>
                    </div>
                </div>
                
                 <div className="flex items-center gap-3 theme-surface border-2 theme-border rounded-full p-2 focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/20 transition-all duration-300">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,application/pdf" className="hidden" multiple />
                    <button 
                        onClick={handleShowDocumentUpload} 
                        className="p-2 text-gray-500 hover:text-[var(--color-primary)] rounded-full transition-colors"
                        data-onboarding-id="file-upload-button"
                        title="Upload medical documents with OCR"
                    >
                        <i className="fas fa-file-medical text-lg"></i>
                    </button>
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                        placeholder="Ask about your medical condition, upload documents, or use voice..."
                        className="flex-1 bg-transparent focus:outline-none text-base"
                        disabled={isLoading}
                        data-onboarding-id="chat-input"
                    />
                    
                    {/* Voice Control */}
                    <VoiceControl
                        onVoiceInput={handleVoiceInput}
                        onVoiceCommand={handleVoiceCommand}
                        disabled={isLoading}
                        className="flex-shrink-0"
                    />
                    
                    <button
                        onClick={() => handleSendMessage()}
                        disabled={isLoading || (!userInput.trim() && uploadedFiles.length === 0)}
                        className="p-3 bg-gradient-to-r from-[#2E7D95] to-[#4A90A4] text-white rounded-full disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                    >
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </div>
                 <div className="pt-3 flex justify-between items-center flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <i className="fas fa-shield-alt text-[#7FB069]"></i>
                        <span>For educational purposes. Always consult your healthcare provider.</span>
                    </div>
                    <div className="flex gap-2 flex-wrap" data-onboarding-id="quick-actions">
                        {/* Dynamic quick actions based on selected specialty */}
                        {currentQuickActions.map((action, index) => (
                          <button 
                            key={index}
                            onClick={() => handleQuickAction(action)} 
                            className="bg-gradient-to-r from-[#E8F4F8] to-[#D1E9F0] border border-[#B8DCE6] text-xs text-[#2E7D95] px-3 py-1 rounded-full hover:from-[#2E7D95] hover:to-[#4A90A4] hover:text-white transition-all"
                            style={selectedSpecialty ? {
                              borderColor: `${selectedSpecialty.color}40`,
                              background: `linear-gradient(135deg, ${selectedSpecialty.color}15, ${selectedSpecialty.color}25)`
                            } : {}}
                          >
                            {action}
                          </button>
                        ))}
                        
                        {hasHistory && (
                          <button onClick={() => setShowExportImport(true)} className="bg-gradient-to-r from-[#E8F4F8] to-[#D1E9F0] border border-[#B8DCE6] text-xs text-[#2E7D95] px-3 py-1 rounded-full hover:from-[#2E7D95] hover:to-[#4A90A4] hover:text-white transition-all">
                            <i className="fas fa-download mr-1"></i>Backup
                          </button>
                        )}
                        
                        {voiceSettings.isSupported && (
                          <button onClick={() => setShowVoiceSettings(true)} className="bg-gradient-to-r from-[#E8F4F8] to-[#D1E9F0] border border-[#B8DCE6] text-xs text-[#2E7D95] px-3 py-1 rounded-full hover:from-[#2E7D95] hover:to-[#4A90A4] hover:text-white transition-all">
                            <i className="fas fa-microphone-alt mr-1"></i>Voice
                          </button>
                        )}
                        
                        <button onClick={handleShowDocumentUpload} className="bg-gradient-to-r from-[#E8F4F8] to-[#D1E9F0] border border-[#B8DCE6] text-xs text-[#2E7D95] px-3 py-1 rounded-full hover:from-[#2E7D95] hover:to-[#4A90A4] hover:text-white transition-all">
                          <i className="fas fa-file-medical mr-1"></i>Upload OCR
                        </button>
                        
                        {messages.length > 0 && (
                          <button onClick={() => setShowShareConversation(true)} className="bg-gradient-to-r from-[#E8F4F8] to-[#D1E9F0] border border-[#B8DCE6] text-xs text-[#2E7D95] px-3 py-1 rounded-full hover:from-[#2E7D95] hover:to-[#4A90A4] hover:text-white transition-all">
                            <i className="fas fa-share-alt mr-1"></i>Share Chat
                          </button>
                        )}
                        
                        {messages.length > 0 && currentConversation && (
                          <ExportButton
                            conversation={currentConversation}
                            variant="button"
                            size="sm"
                            showLabel={true}
                          />
                        )}
                    </div>
                 </div>
            </div>
            
            {/* Modals */}
            {modalImageUrl && <ImageModal imageUrl={modalImageUrl} onClose={() => setModalImageUrl(null)} />}
            
            <ConversationHistory
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
                onSelectConversation={handleSelectConversation}
                onNewConversation={handleNewConversation}
                currentConversationId={currentConversationId}
            />
            
            <ConversationExportImport
                isOpen={showExportImport}
                onClose={() => setShowExportImport(false)}
                onImportComplete={handleExportImportComplete}
            />
            
            <MedicalSpecialtySelector
                isOpen={showSpecialtySelector}
                onClose={() => setShowSpecialtySelector(false)}
                onSpecialtyChange={handleSpecialtyChange}
            />
            
            {/* Onboarding Components */}
            <FirstTimeUserWelcome />
            
            <OnboardingModal
                isOpen={isOnboardingOpen}
                onClose={closeOnboarding}
                onComplete={completeOnboarding}
                flow={currentFlow}
                onSpecialtySelectorDemo={handleOnboardingSpecialtyDemo}
                onInputDemo={handleOnboardingInputDemo}
            />
            
            <VoiceSettings
                isOpen={showVoiceSettings}
                onClose={() => setShowVoiceSettings(false)}
            />
            
            <UserSettings
                isOpen={showUserSettings}
                onClose={() => setShowUserSettings(false)}
            />
            
            {/* Enhanced Document Upload Modal */}
            {showDocumentUpload && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="theme-modal w-full max-w-4xl max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b theme-border">
                            <h2 className="text-xl font-semibold theme-text">
                                <i className="fas fa-file-medical-alt text-blue-500 mr-2"></i>
                                Enhanced Medical Document Upload
                            </h2>
                            <button
                                onClick={() => setShowDocumentUpload(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto max-h-96">
                            <EnhancedDocumentUpload
                                onFilesUploaded={handleDocumentsUploaded}
                                onOCRComplete={handleOCRComplete}
                                maxFiles={10}
                            />
                            
                            {documents.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="font-medium theme-text mb-3">Processed Documents</h3>
                                    <div className="space-y-2">
                                        {documents.map(doc => (
                                            <div key={doc.id} className="flex items-center justify-between p-3 theme-surface rounded border theme-border">
                                                <div className="flex items-center gap-3">
                                                    <i className={`fas fa-file-medical ${doc.ocrResult ? 'text-green-500' : 'text-gray-500'}`}></i>
                                                    <div>
                                                        <div className="font-medium theme-text">{doc.name}</div>
                                                        {doc.ocrResult && (
                                                            <div className="text-xs text-green-600 dark:text-green-400">
                                                                OCR: {doc.ocrResult.text.substring(0, 50)}...
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {doc.ocrResult && (
                                                    <button
                                                        onClick={() => handleViewOCRResults(doc)}
                                                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                                                    >
                                                        View OCR
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex justify-end p-6 border-t theme-border bg-gray-50 dark:bg-gray-800">
                            <button
                                onClick={() => setShowDocumentUpload(false)}
                                className="px-6 py-2 theme-button-primary rounded-lg transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* OCR Results Viewer */}
            {selectedDocument && (
                <OCRResultsViewer
                    document={selectedDocument}
                    isOpen={!!selectedDocument}
                    onClose={() => setSelectedDocument(null)}
                />
            )}
            
            {/* Share Conversation Dialog */}
            {showShareConversation && currentConversation && (
                <ShareDialog
                    isOpen={showShareConversation}
                    onClose={() => setShowShareConversation(false)}
                    content={currentConversation}
                    contentType="conversation"
                    title="Share Conversation"
                />
            )}
        </div>
    );
};

export default ChatInterface;
