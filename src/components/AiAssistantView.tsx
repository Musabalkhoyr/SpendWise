import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Lightbulb,
  CheckCircle,
  Trash2,
} from 'lucide-react';
import { AIInsight, AIChatMessage, Category } from '../types/index.ts';
import { api } from '../lib/api.ts';

interface AiAssistantViewProps {
  categories: Category[];
  defaultCurrency?: string;
  onRefreshData: () => void;
}

const SAMPLE_QUESTIONS = [
  'How much did I spend today?',
  'What did I spend the most money on this month?',
  'Compare my expenses this month with last month.',
  'What is my biggest expense?',
  'How much money have I spent on transportation?',
  'Am I spending too much on utilities or food?',
];

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  categories,
  defaultCurrency = 'NGN',
  onRefreshData,
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Category test state
  const [testExpenseText, setTestExpenseText] = useState('');
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);
  const [isCategorizing, setIsCategorizing] = useState(false);

  // Load chat history & insights on mount
  useEffect(() => {
    loadChatHistory();
    loadInsights();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const history = await api.getChatHistory();
      if (history.length > 0) {
        setMessages(history);
      } else {
        // Welcome message
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: `Hello! I am your SpendWise AI assistant powered by Google's Gemma architecture. All my answers are grounded strictly in your verified financial ledger in ${defaultCurrency}. Ask me about your spending today, compare months, identify your biggest expenses, or ask for budget optimization advice!`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      // Fallback
    }
  };

  const loadInsights = async () => {
    setIsLoadingInsights(true);
    try {
      const data = await api.getFinancialInsights();
      setInsights(data);
    } catch {
      // Handled gracefully
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: AIChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await api.sendChatMessage(text);
      const assistantMsg: AIChatMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: res.response,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an issue accessing the financial ledger. Please try again.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Clear AI conversation history?')) return;
    await api.clearChatHistory();
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Conversation history cleared. How can I assist with your expenses today?',
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const handleTestCategorization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testExpenseText.trim()) return;
    setIsCategorizing(true);
    setSuggestedCategory(null);

    try {
      const res = await api.parseNaturalLanguage(testExpenseText.trim(), '2026-10-31');
      if (res.proposals && res.proposals.length > 0) {
        setSuggestedCategory(res.proposals[0].category);
      } else {
        setSuggestedCategory('Miscellaneous');
      }
    } catch {
      setSuggestedCategory('Miscellaneous');
    } finally {
      setIsCategorizing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Insights Banner Section */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs font-bold text-neutral-900 dark:text-white">
              Gemma Financial Observations & Pattern Insights
            </h2>
          </div>
          <button
            onClick={loadInsights}
            disabled={isLoadingInsights}
            className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          >
            <RefreshCw className={`w-3 h-3 ${isLoadingInsights ? 'animate-spin' : ''}`} />
            <span>Refresh Insights</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {insights.map(item => (
            <div
              key={item.id}
              className="p-3.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 rounded-lg space-y-1.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-neutral-900 dark:text-white">
                    {item.title}
                  </span>
                  {item.metricHighlight && (
                    <span className="text-[10px] font-mono tabular-nums font-semibold px-1.5 py-0.5 rounded-sm bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                      {item.metricHighlight}
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {item.observation}
                </p>
              </div>

              {item.actionableTip && (
                <div className="text-[10px] text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-200 dark:border-neutral-700/60 flex items-start gap-1">
                  <Lightbulb className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                  <span>{item.actionableTip}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs flex flex-col h-[520px]">
        {/* Chat Header */}
        <div className="px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
                SpendWise Gemma Assistant
              </h3>
              <p className="text-[10px] text-neutral-400">
                Grounded in actual transactions · Zero invented figures
              </p>
            </div>
          </div>

          <button
            onClick={handleClearHistory}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-xl p-3.5 rounded-xl leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-xs'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>
                <div
                  className={`text-[9px] mt-1.5 ${
                    msg.role === 'user' ? 'text-emerald-200' : 'text-neutral-400'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 text-xs justify-start">
              <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-neutral-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] ml-1">Analyzing database records...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions Chips */}
        <div className="px-5 py-2 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 overflow-x-auto flex items-center gap-2">
          <span className="text-[10px] text-neutral-400 shrink-0">Ask:</span>
          {SAMPLE_QUESTIONS.map(q => (
            <button
              key={q}
              onClick={() => handleSendMessage(q)}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-emerald-500 rounded-md text-neutral-600 dark:text-neutral-300 transition-colors shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder="Ask anything about your spending, trends, categories or budget..."
              className="flex-1 px-3.5 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:text-white placeholder:text-neutral-400"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Auto-Categorization Tester Component */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
        <h3 className="text-xs font-bold text-neutral-900 dark:text-white mb-1">
          Gemma Category Classifier Tool
        </h3>
        <p className="text-[11px] text-neutral-500 mb-3">
          Test how Gemma 4 classifies arbitrary purchase descriptions into SpendWise's 15 standard categories.
        </p>

        <form onSubmit={handleTestCategorization} className="flex gap-2 max-w-lg">
          <input
            type="text"
            value={testExpenseText}
            onChange={e => setTestExpenseText(e.target.value)}
            placeholder="e.g. Paid for dentist checkup, Bought Netflix subscription"
            className="flex-1 px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg dark:text-white"
          />
          <button
            type="submit"
            disabled={isCategorizing || !testExpenseText.trim()}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition-colors shrink-0"
          >
            {isCategorizing ? 'Classifying...' : 'Predict Category'}
          </button>
        </form>

        {suggestedCategory && (
          <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 rounded-lg flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-200">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Suggested Category: <strong>{suggestedCategory}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
