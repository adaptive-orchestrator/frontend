import { useState, useRef, useEffect } from "react";
import { MessageSquare, Database, Bug, Loader2, Send, Sparkles, Copy, Check, Trash2 } from "lucide-react";
import { sendChatMessage, analyzeError, queryDatabase, RCAResult, TextToSQLResult } from "@/lib/api/ai-chat";
import { useUser } from "@/contexts/UserContext";

// ============= TYPES =============

type ChatMode = 'general' | 'data-query' | 'debug';

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode?: ChatMode;
  metadata?: {
    sql?: string;
    severity?: string;
    codeContext?: string[];
    rawData?: any[];
  };
  timestamp: Date;
}

// ============= MODE CONFIGS =============

const MODE_CONFIGS = {
  general: {
    label: 'Chat',
    icon: MessageSquare,
    color: 'bg-blue-500',
    placeholder: 'Nhập câu hỏi của bạn...',
    description: 'Trò chuyện thông thường với AI',
  },
  'data-query': {
    label: 'Data Query',
    icon: Database,
    color: 'bg-emerald-500',
    placeholder: 'VD: Tổng doanh thu tháng 12? Top 5 sản phẩm bán chạy?',
    description: 'Truy vấn dữ liệu bằng ngôn ngữ tự nhiên',
  },
  debug: {
    label: 'Debug',
    icon: Bug,
    color: 'bg-orange-500',
    placeholder: 'Paste error log hoặc stack trace vào đây...',
    description: 'Phân tích lỗi và đề xuất fix',
  },
};

// ============= COMPONENT =============

export default function Chatbot() {
  const { isDemoMode } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<ChatMode>('general');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate unique ID
  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Copy to clipboard
  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Clear chat
  const clearChat = () => {
    setMessages([]);
  };

  // Handle send message
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: input,
      mode,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let assistantMessage: Message;

      switch (mode) {
        case 'data-query': {
          const result: TextToSQLResult = await queryDatabase(input);
          assistantMessage = {
            id: generateId(),
            role: "assistant",
            content: result.naturalResponse,
            mode,
            metadata: {
              sql: result.sql,
              rawData: result.rawData,
            },
            timestamp: new Date(),
          };
          break;
        }

        case 'debug': {
          const result: RCAResult = await analyzeError(input);
          if (result.success && result.analysis) {
            const { analysis } = result;
            const content = `## 🔍 Phân tích lỗi

**Loại lỗi:** ${analysis.error_type}
**Mức độ:** ${getSeverityBadge(analysis.severity)}
**Độ tin cậy:** ${Math.round(analysis.confidence * 100)}%

### 📝 Tóm tắt
${analysis.summary}

### 🎯 Nguyên nhân gốc
${analysis.root_cause}

${analysis.affected_component ? `### 📦 Component ảnh hưởng\n\`${analysis.affected_component}\`\n` : ''}

### 💡 Đề xuất sửa
\`\`\`
${analysis.suggested_fix}
\`\`\`

${analysis.prevention ? `### 🛡️ Phòng ngừa\n${analysis.prevention}` : ''}`;
            
            assistantMessage = {
              id: generateId(),
              role: "assistant",
              content,
              mode,
              metadata: {
                severity: analysis.severity,
                codeContext: result.codeContext,
              },
              timestamp: new Date(),
            };
          } else {
            assistantMessage = {
              id: generateId(),
              role: "assistant",
              content: `❌ Không thể phân tích lỗi: ${result.error || 'Unknown error'}`,
              mode,
              timestamp: new Date(),
            };
          }
          break;
        }

        default: {
          const result = await sendChatMessage(input);
          // Backend có thể trả về { message } hoặc { response }
          const content = result.message || result.response || result.text || 'No response';
          assistantMessage = {
            id: generateId(),
            role: "assistant",
            content: typeof content === 'string' 
              ? content 
              : content?.explanation || JSON.stringify(content),
            mode,
            timestamp: new Date(),
          };
        }
      }

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      setMessages((prev) => [...prev, {
        id: generateId(),
        role: "assistant",
        content: `❌ Lỗi: ${error.message || 'Có lỗi xảy ra'}`,
        mode,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const badges: Record<string, string> = {
      critical: '🔴 Critical',
      high: '🟠 High',
      medium: '🟡 Medium',
      low: '🟢 Low',
    };
    return badges[severity] || severity;
  };

  const currentConfig = MODE_CONFIGS[mode];
  const ModeIcon = currentConfig.icon;

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5" />
            <h2 className="font-semibold">Nexora AI Assistant</h2>
            {isDemoMode && (
              <span className="px-2 py-0.5 text-xs bg-yellow-400 text-yellow-900 rounded-full font-medium">
                DEMO
              </span>
            )}
          </div>
          <button
            onClick={clearChat}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Xóa chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2 mt-3">
          {(Object.keys(MODE_CONFIGS) as ChatMode[]).map((m) => {
            const config = MODE_CONFIGS[m];
            const Icon = config.icon;
            const isActive = mode === m;
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white text-gray-800 shadow-md'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                title={config.description}
              >
                <Icon className="w-4 h-4" />
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
            <ModeIcon className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-center">{currentConfig.description}</p>
            <p className="text-sm mt-1">{currentConfig.placeholder}</p>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                m.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-sm'
                  : 'bg-white dark:bg-gray-800 shadow-sm border dark:border-gray-700 rounded-bl-sm'
              }`}
            >
              {/* Mode badge for user messages */}
              {m.role === 'user' && m.mode && (
                <div className="flex items-center gap-1 mb-1 text-xs opacity-75">
                  {(() => {
                    const config = MODE_CONFIGS[m.mode];
                    const Icon = config.icon;
                    return (
                      <>
                        <Icon className="w-3 h-3" />
                        {config.label}
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Message content */}
              <div className={`whitespace-pre-wrap ${m.role === 'assistant' ? 'prose prose-sm max-w-none dark:prose-invert' : ''}`}>
                {m.content}
              </div>

              {/* Raw data display (if available) */}
              {m.metadata?.rawData && m.metadata.rawData.length > 0 && (() => {
                // Check if all values are null
                const hasNonNullValue = m.metadata.rawData.some((row: any) => 
                  Object.values(row).some((val: any) => val !== null && val !== undefined)
                );
                
                if (!hasNonNullValue) {
                  return (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="text-sm text-yellow-800">
                        ⚠️ Không tìm thấy dữ liệu phù hợp với điều kiện truy vấn.
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <div className="text-xs font-medium text-blue-700 mb-2">📊 Dữ liệu chi tiết:</div>
                    <div className="space-y-1">
                      {m.metadata.rawData.map((row: any, idx: number) => (
                        <div key={idx} className="text-sm text-gray-700">
                          {Object.entries(row).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="font-medium">{key}:</span>
                              <span className="ml-2">
                                {value === null || value === undefined 
                                  ? <span className="text-gray-400 italic">không có dữ liệu</span>
                                  : typeof value === 'number' 
                                    ? value.toLocaleString('vi-VN') 
                                    : String(value)
                                }
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* SQL Query (collapsible) */}
              {m.metadata?.sql && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    SQL Query
                  </summary>
                  <div className="mt-2 p-2 bg-gray-100 rounded-lg">
                    <div className="flex items-center justify-end mb-1">
                      <button
                        onClick={() => copyToClipboard(m.metadata!.sql!, m.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {copiedId === m.id ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <code className="text-xs text-gray-700 block overflow-x-auto whitespace-pre">
                      {m.metadata.sql}
                    </code>
                  </div>
                </details>
              )}

              {/* Timestamp */}
              <div className={`text-xs mt-2 ${m.role === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                {m.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 shadow-sm border dark:border-gray-700 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Đang xử lý...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              className="w-full border rounded-xl px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={currentConfig.placeholder}
              rows={mode === 'debug' ? 3 : 1}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className={`absolute right-2 bottom-2 p-2 rounded-lg transition-colors ${
                input.trim() && !isLoading
                  ? `${currentConfig.color} text-white hover:opacity-90`
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
          Shift + Enter để xuống dòng • Enter để gửi
        </p>
      </div>
    </div>
  );
}