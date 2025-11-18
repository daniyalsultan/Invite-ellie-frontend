import { useState, useRef, useEffect } from 'react';
import logo from '../../assets/logo.svg';

export function ChatBot(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ id: number; text: string; sender: 'user' | 'ellie' }>>([
    {
      id: 1,
      text: "Hi! I'm Ellie. How can I help you today?",
      sender: 'ellie',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || 'http://localhost:5000/api/chat';

  const formatMessageText = (text: string): JSX.Element => {
    const lines = text.split('\n');
    return (
      <>
        {lines.map((line, index) => {
          const trimmedLine = line.trim();
          // Check if line starts with bullet point
          if (trimmedLine.startsWith('•')) {
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
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async (): Promise<void> => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user' as const,
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

      // Call the chatbot API
      const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          history: conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Ellie');
      }

      const data = await response.json();

      const ellieResponse = {
        id: messages.length + 2,
        text: data.response || "I'm sorry, I couldn't process that. Could you please try again?",
        sender: 'ellie' as const,
      };

      setMessages((prev) => [...prev, ellieResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorResponse = {
        id: messages.length + 2,
        text: "I'm having trouble connecting right now. Please try again in a moment!",
        sender: 'ellie' as const,
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group"
        aria-label="Open chat with Ellie"
      >
        <img 
          src={logo} 
          alt="Ellie" 
          className="h-16 w-16 lg:h-20 lg:w-20 drop-shadow-lg transition-transform duration-300 group-hover:scale-125" 
        />
        {/* Tooltip */}
        <span className="absolute right-full mr-3 whitespace-nowrap rounded-lg bg-ellieBlue px-3 py-2 text-sm font-nunito font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 pointer-events-none">
          Ask Ellie
          <span className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 translate-x-1/2 rotate-45 bg-ellieBlue"></span>
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 lg:p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          ></div>

          {/* Chat Container */}
          <div className="relative z-10 flex h-[70vh] w-full max-w-sm flex-col rounded-xl bg-white shadow-2xl border border-gray-100 lg:h-[580px] lg:max-w-sm">
            {/* Header */}
            <div className="flex items-center gap-3 rounded-t-xl bg-ellieBlue px-4 py-3.5 lg:px-5 lg:py-4">
              <div className="flex h-12 w-12 items-center justify-center lg:h-14 lg:w-14">
                <img src={logo} alt="Ellie" className="h-10 w-10 lg:h-12 lg:w-12" />
              </div>
              <div className="flex-1">
                <h3 className="font-spaceGrotesk text-base font-bold text-white lg:text-lg">
                  Ask Ellie
                </h3>
                <p className="font-inter text-xs text-white/90">
                  For unforgettable meetings
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20 lg:h-9 lg:w-9"
                aria-label="Close chat"
              >
                <svg
                  className="h-5 w-5 lg:h-6 lg:w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#FAFBFC] to-[#F4F7FA] px-3 py-4 lg:px-4 lg:py-5">
              <div className="flex flex-col gap-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3.5 py-2.5 lg:px-4 lg:py-3 ${
                        message.sender === 'user'
                          ? 'bg-ellieBlue text-white'
                          : 'bg-white text-ellieBlack shadow-sm border border-gray-100'
                      }`}
                    >
                      {message.sender === 'ellie' && (
                        <div className="mb-2 flex items-center gap-2">
                          <img src={logo} alt="Ellie" className="h-6 w-6 lg:h-7 lg:w-7" />
                          <span className="font-spaceGrotesk text-sm font-semibold text-ellieBlue lg:text-base">
                            Ellie
                          </span>
                        </div>
                      )}
                      <div className={`font-nunito text-sm leading-relaxed ${
                        message.sender === 'user' ? 'text-white' : 'text-ellieBlack'
                      }`}>
                        {formatMessageText(message.text)}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-lg px-3.5 py-2.5 lg:px-4 lg:py-3 bg-white text-ellieBlack shadow-sm border border-gray-100">
                      <div className="flex items-center gap-2">
                        <img src={logo} alt="Ellie" className="h-6 w-6 lg:h-7 lg:w-7 animate-pulse" />
                        <span className="font-spaceGrotesk text-sm font-semibold text-ellieBlue lg:text-base">
                          Ellie
                        </span>
                        <span className="text-ellieGray text-sm lg:text-base">is typing...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 bg-white p-3 lg:p-4">
              <div className="flex items-end gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 rounded-lg border border-gray-200 bg-ellieSurface px-3.5 py-2.5 font-nunito text-sm text-ellieBlack placeholder:text-ellieGray focus:border-ellieBlue focus:outline-none focus:ring-1 focus:ring-ellieBlue/30 lg:px-4 lg:py-3"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-ellieBlue text-white transition-colors hover:bg-ellieBlue/90 disabled:cursor-not-allowed disabled:opacity-50 lg:h-11 lg:w-11"
                  aria-label="Send message"
                >
                  <svg
                    className="h-4 w-4 lg:h-5 lg:w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}




