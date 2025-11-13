'use client';

import React, {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  ChangeEvent,
} from 'react';
import {
  Send,
  User,
  Bot,
  Copy,
  CopyCheck,
  MessageCircle,
} from 'lucide-react';
import {Prompt} from "./prompt"
import { Rubik, Poppins } from 'next/font/google';

const rubik = Rubik({ subsets: ['latin'] });
const poppins = Poppins({ weight: ['400', '500', '600'], subsets: ['latin'] });

// Types
interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
}

interface ChatBotTemplateProps {
  onSendMessage?: (message: string) => Promise<string>;
  initialMessages?: Message[];
  botName?: string;
  botDescription?: string;
}

const ChatBotTemplate: React.FC<ChatBotTemplateProps> = ({
  onSendMessage,
  initialMessages = [
    {
      id: 1,
      type: 'ai',
      content: 'Halo, saya adalah EduvaAI yang siap menjawab pertanyaan anda ',
      timestamp: new Date().toISOString(),
    },
  ],
  botName = 'EduvaAI',
  botDescription = 'Powered by Google Gemini',
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ✅ API Key dan URL
  const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Validasi API Key saat komponen dimuat
  useEffect(() => {
    if (!API_KEY) {
      console.error(' NEXT_PUBLIC_GEMINI_API_KEY tidak ditemukan!');
    } else {
      console.log(' API Key ditemukan');
    }
  }, [API_KEY]);

  // ✅ Fungsi untuk parse markdown sederhana
  const parseMarkdown = (text: string): string => {
    return text
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  };

  // ✅ Hapus quick response → langsung kirim ke Gemini
  const callGeminiAPI = async (userMessage: string): Promise<string> => {
    try {
      if (!API_KEY) {
        throw new Error('API Key tidak ditemukan');
      }

      console.log(' Mengirim request ke Gemini API...');
      console.log('User message:', userMessage);

      // Riwayat percakapan + Prompt
      const fullPrompt = `${Prompt.SYSTEM_PROMPT}

Riwayat Percakapan:
${messages
  .slice(-4)
  .map((msg) => `${msg.type === 'user' ? 'User' : 'AI'}: ${msg.content}`)
  .join('\n')}

User: ${userMessage}
AI:`;

      // Body request
      const requestBody = {
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      };

      // Fetch ke Gemini
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        },
      );

      console.log(' Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API Error:', errorText);
        throw new Error(
          `Gemini API error ${response.status}: ${
            errorText || 'Unknown error'
          }`,
        );
      }

      const data = await response.json();
      console.log(' Gemini Response JSON:', data);

      // Ambil teks respons
      const text =
        data?.candidates?.[0]?.content?.parts
          ?.map((p: any) => p.text || '')
          .join(' ')
          .trim() || '';

      if (!text) {
        return ' Maaf, saya tidak bisa memberikan respons saat ini.';
      }

      console.log(' Respons berhasil:', text);
      return text;
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      return (
        err.message ||
        ' Terjadi kesalahan saat menghubungi AI. Silakan coba lagi.'
      );
    }
  };

  const handleSendMessage = async (): Promise<void> => {
    if (!inputMessage.trim()) return;

    // Validasi API Key sebelum mengirim
    if (!API_KEY) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'ai',
          content:
            ' API Key tidak ditemukan. Pastikan NEXT_PUBLIC_GEMINI_API_KEY sudah diset di file .env.local dan restart development server.',
          timestamp: new Date().toISOString(),
        },
      ]);
      return;
    }

    const newUserMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      let aiResponseContent: string;

      if (onSendMessage) {
        aiResponseContent = await onSendMessage(currentMessage);
      } else {
        aiResponseContent = await callGeminiAPI(currentMessage);
      }

      const aiResponse: Message = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponseContent,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        type: 'ai',
        content:
          ' Maaf, terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi dalam beberapa saat.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setInputMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
  };

  const copyToClipboard = async (text: string, messageId: number): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      console.log('Text copied to clipboard');
      
      // Reset icon setelah 2 detik
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleFeedback = (messageId: number, isPositive: boolean): void => {
    console.log(
      `Feedback for message ${messageId}: ${
        isPositive ? 'positive' : 'negative'
      }`,
    );
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-blue-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
              <MessageCircle className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold text-blue-900 ${rubik.className}`}>{botName}</h1>
              <p className={`text-sm font-medium text-blue-600 ${poppins.className}`}>
                {botDescription}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1">
            <div
              className={`h-2 w-2 rounded-full ${
                API_KEY ? 'animate-pulse bg-blue-500' : 'bg-red-500'
              }`}
            ></div>
            <span className={`text-xs font-medium text-blue-700 ${poppins.className}`}>
              {API_KEY ? 'Online' : 'API Key Missing'}
            </span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-6 flex ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`flex w-full max-w-4xl ${
                message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
              } gap-4`}
            >
              {/* Avatar */}
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                  message.type === 'user'
                    ? 'bg-blue-800 shadow-lg'
                    : 'bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg'
                }`}
              >
                {message.type === 'user' ? (
                  <User className="h-6 w-6 text-white" />
                ) : (
                  <Bot className="h-6 w-6 text-white" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={`group flex flex-col ${
                  message.type === 'user' ? 'items-end' : 'items-start'
                } min-w-0 flex-1`}
              >
                <div
                  className={`relative rounded-2xl px-5 py-4 ${
                    message.type === 'user'
                      ? 'max-w-2xl break-words bg-blue-800 text-white shadow-lg'
                      : 'max-w-2xl border border-blue-200 bg-white text-blue-900 shadow-sm'
                  }`}
                >
                  <div
                    className={`whitespace-pre-wrap break-words text-base leading-relaxed ${poppins.className}`}
                    dangerouslySetInnerHTML={{
                      __html: parseMarkdown(message.content),
                    }}
                  />
                </div>

                {/* Actions */}
                <div
                  className={`mt-2 flex items-center gap-2 ${
                    message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <span className={`text-xs font-semibold text-blue-600 ${poppins.className}`}>
                    {formatTime(message.timestamp)}
                  </span>
                  {message.type === 'ai' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => copyToClipboard(message.content, message.id)}
                        className="rounded-lg p-1.5 text-blue-500 transition-all hover:bg-blue-100 hover:text-blue-700"
                        title={copiedMessageId === message.id ? "Copied!" : "Copy message"}
                      >
                        {copiedMessageId === message.id ? (
                          <CopyCheck className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="mb-6 flex justify-start">
            <div className="flex w-full max-w-4xl gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-blue-200 bg-white px-5 py-4 shadow-sm">
                <div className="flex gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500"></div>
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
                <span className={`text-sm text-blue-600 ${poppins.className}`}>
                  Sedang mengetik...
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-blue-200 bg-white px-6 py-5">
        <div className="relative max-w-4xl">
          <div className="flex items-end gap-3 rounded-2xl border-2 border-blue-200 bg-blue-50 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Ketik pesan Anda di sini..."
              className={`bg-transparent max-h-32 min-h-[20px] flex-1 resize-none rounded-2xl px-5 py-4 leading-relaxed text-blue-900 placeholder-blue-500 focus:outline-none ${poppins.className}`}
              rows={1}
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className={`m-2 flex-shrink-0 rounded-xl p-3 transition-all ${
                inputMessage.trim() && !isTyping
                  ? 'bg-blue-600 text-white shadow-lg hover:scale-105 hover:bg-blue-800'
                  : 'cursor-not-allowed bg-blue-300 text-blue-500'
              }`}
              title={!API_KEY ? 'API Key tidak ditemukan' : 'Kirim pesan'}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <p className={`text-xs font-medium text-blue-600 ${poppins.className}`}>
            Tekan Enter untuk mengirim, Shift + Enter untuk baris baru
          </p>
          {!API_KEY && (
            <p className={`text-xs font-medium text-red-500 ${poppins.className}`}>
              API Key tidak ditemukan
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBotTemplate;