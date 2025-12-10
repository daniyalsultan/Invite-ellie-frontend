import { useState, useRef, useEffect, useMemo } from 'react';
import { DashboardLayout } from '../sidebar';
import { useProfile } from '../../context/ProfileContext';
import logo from '../../assets/logo.svg';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ellie';
}

function getRecallaiBaseUrl(): string | null {
  const raw = import.meta.env.VITE_RECALLAI_BASE_URL;
  if (typeof raw !== 'string' || !raw.trim()) {
    console.warn(
      'VITE_RECALLAI_BASE_URL is not configured. Please set it in your .env file to your backend server URL (e.g., http://16.16.183.96:3003)'
    );
    return null;
  }
  const url = raw.trim().replace(/\/$/, ''); // Remove trailing slash
  return url;
}

function buildRecallaiUrl(path: string): string | null {
  const baseUrl = getRecallaiBaseUrl();
  if (!baseUrl) {
    return null;
  }
  return `${baseUrl}${path}`;
}

export function AskElliePage(): JSX.Element {
  const { profile } = useProfile();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm Ellie. I can help you with questions about all your previous meetings and the current meeting. What would you like to know?",
      sender: 'ellie',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasLiveMeetings, setHasLiveMeetings] = useState(false);
  const [liveMeetingCount, setLiveMeetingCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Get chat API URL from recallai
  const CHAT_API_URL = useMemo(() => {
    return buildRecallaiUrl('/api/chat');
  }, []);

  const formatMessageText = (text: string): JSX.Element => {
    const lines = text.split('\n');
    return (
      <>
        {lines.map((line, index) => {
          const trimmedLine = line.trim();
          // Check if line starts with bullet point
          if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
            return (
              <div key={index} className="ml-4 mt-1 first:mt-0">
                {trimmedLine}
              </div>
            );
          }
          // Regular text line
          if (trimmedLine) {
            return (
              <div key={index} className="mt-1 first:mt-0">
                {trimmedLine}
              </div>
            );
          }
          // Empty line - add spacing
          return <div key={index} className="h-2" />;
        })}
      </>
    );
  };

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Reset textarea height when input is cleared
  useEffect(() => {
    if (inputRef.current && !inputValue) {
      inputRef.current.style.height = 'auto';
    }
  }, [inputValue]);

  const handleSendMessage = async (): Promise<void> => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare conversation history (excluding the initial greeting)
      const conversationHistory = messages
        .filter((msg) => msg.id !== 1) // Exclude initial greeting
        .map((msg) => ({
          sender: msg.sender,
          text: msg.text,
        }));

      // Check if API URL is configured
      if (!CHAT_API_URL) {
        throw new Error('Chat API URL is not configured. Please set VITE_RECALLAI_BASE_URL');
      }

      if (!profile?.id) {
        throw new Error('Please login to chat with Ellie');
      }

      // Call the chatbot API
      const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          message: currentInput,
          history: conversationHistory,
          userId: profile.id,  // Add userId for authentication
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to get response' }));
        throw new Error(errorData.error || 'Failed to get response from Ellie');
      }

      const data = await response.json();

      // Update live meeting status from response
      if (data.has_live_meetings !== undefined) {
        setHasLiveMeetings(data.has_live_meetings);
        setLiveMeetingCount(data.live_meeting_count || 0);
      }

      const ellieResponse: Message = {
        id: messages.length + 2,
        text: data.response || "I'm sorry, I couldn't process that. Could you please try again?",
        sender: 'ellie',
      };

      setMessages((prev) => [...prev, ellieResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorResponse: Message = {
        id: messages.length + 2,
        text: "I'm having trouble connecting right now. Please try again in a moment!",
        sender: 'ellie',
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <DashboardLayout activeTab="/ask-ellie">
      <div className="w-full h-full flex flex-col bg-white">
        <div className="px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
          {/* Breadcrumb */}
          <nav className="mb-2 md:mb-3 lg:mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1 md:gap-2 font-nunito text-[10px] md:text-xs lg:text-sm font-semibold text-ellieGray uppercase tracking-wider">
              <li>
                <a href="/dashboard" className="hover:text-ellieBlack transition-colors">
                  Dashboard
                </a>
              </li>
              <li className="text-ellieGray">›</li>
              <li className="text-ellieBlue">Ellie Meeting Assistant</li>
            </ol>
          </nav>

          {/* Page Title */}
          <div className="mb-4 md:mb-6 lg:mb-8">
            <h1 className="font-nunito text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-[#1F2A44] mb-2">
              Ellie Meeting Assistant
            </h1>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 flex flex-col min-h-0 px-4 md:px-6 lg:px-8 pb-4 md:pb-6 lg:pb-8">
          <div className="flex-1 flex flex-col rounded-xl bg-gradient-to-b from-[#FAFBFC] to-[#F4F7FA] border border-gray-200 shadow-sm overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6 md:py-8">
              <div className="flex flex-col gap-4 max-w-4xl mx-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[75%] rounded-lg px-4 py-3 md:px-5 md:py-4 ${
                        message.sender === 'user'
                          ? 'bg-ellieBlue text-white'
                          : 'bg-white text-ellieBlack shadow-sm border border-gray-100'
                      }`}
                    >
                      {message.sender === 'ellie' && (
                        <div className="mb-2 flex items-center gap-2">
                          <img src={logo} alt="Ellie" className="h-6 w-6 md:h-7 md:w-7" />
                          <span className="font-spaceGrotesk text-sm md:text-base font-semibold text-ellieBlue">
                            Ellie
                          </span>
                        </div>
                      )}
                      <div
                        className={`font-nunito text-sm md:text-base leading-relaxed ${
                          message.sender === 'user' ? 'text-white' : 'text-ellieBlack'
                        }`}
                      >
                        {formatMessageText(message.text)}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] md:max-w-[75%] rounded-lg px-4 py-3 md:px-5 md:py-4 bg-white text-ellieBlack shadow-sm border border-gray-100">
                      <div className="flex items-center gap-2">
                        <img src={logo} alt="Ellie" className="h-6 w-6 md:h-7 md:w-7 animate-pulse" />
                        <span className="font-spaceGrotesk text-sm md:text-base font-semibold text-ellieBlue">
                          Ellie
                        </span>
                        <span className="text-ellieGray text-sm md:text-base">is typing...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Live Meeting Indicator */}
            {hasLiveMeetings && (
              <div className="border-b border-gray-200 bg-green-50 px-4 py-3 md:px-6 md:py-4">
                <div className="max-w-4xl mx-auto flex items-center gap-2">
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <p className="font-nunito text-sm md:text-base text-green-700">
                    {liveMeetingCount > 1 
                      ? `Ellie is listening to ${liveMeetingCount} live meetings`
                      : 'Ellie is listening to your live meeting'}
                  </p>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-gray-200 bg-white px-4 py-4 md:px-6 md:py-5">
              <div className="max-w-4xl mx-auto flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      // Auto-resize textarea
                      const target = e.target;
                      target.style.height = 'auto';
                      target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about your meetings..."
                    rows={1}
                    className="w-full rounded-lg border border-gray-200 bg-ellieSurface px-4 py-3 font-nunito text-sm md:text-base text-ellieBlack placeholder:text-ellieGray focus:border-ellieBlue focus:outline-none focus:ring-2 focus:ring-ellieBlue/30 resize-none min-h-[48px] max-h-32"
                    style={{ minHeight: '48px', height: 'auto' }}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-lg bg-ellieBlue text-white transition-colors hover:bg-ellieBlue/90 disabled:cursor-not-allowed disabled:opacity-50 flex-shrink-0"
                  aria-label="Send message"
                >
                  <svg
                    className="h-5 w-5 md:h-6 md:w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-ellieGray text-center mt-3 font-nunito">
                Ellie has access to all your previous meetings and current meeting data
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

