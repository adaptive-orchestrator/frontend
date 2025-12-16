// src/lib/api/ai-chat.ts
import axios from 'axios';
import Cookies from 'js-cookie';
import { isDemoModeActive } from '@/contexts/UserContext';

const API_BASE = import.meta.env.VITE_API_BASE;

// ============= TYPES =============

export interface RCAAnalysis {
  summary: string;
  error_type: string;
  root_cause: string;
  affected_component?: string;
  suggested_fix: string;
  prevention?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
}

export interface RCAResult {
  success: boolean;
  analysis: RCAAnalysis | null;
  codeContext: string[];
  error?: string;
}

export interface TextToSQLResult {
  success: boolean;
  question: string;
  sql?: string;
  rawData?: any[];
  naturalResponse: string;
  error?: string;
}

// ============= MOCK RESPONSES =============

const MOCK_RCA_RESPONSE: RCAResult = {
  success: true,
  analysis: {
    summary: 'Lỗi xảy ra do biến undefined khi truy cập thuộc tính của object null',
    error_type: 'TypeError',
    root_cause: 'Biến `user` chưa được khởi tạo trước khi gọi user.profile. Điều này xảy ra khi API call chưa hoàn thành nhưng component đã render.',
    affected_component: 'UserProfile.tsx',
    suggested_fix: `// Thêm optional chaining và null check
const userName = user?.profile?.name ?? 'Guest';

// Hoặc kiểm tra trước khi render
if (!user) return <LoadingSpinner />;`,
    prevention: 'Sử dụng TypeScript strict mode, thêm null checks, và implement loading states cho async operations.',
    severity: 'medium',
    confidence: 0.85,
  },
  codeContext: ['src/components/UserProfile.tsx', 'src/hooks/useUser.ts'],
};

const MOCK_TEXT_TO_SQL_RESPONSE: TextToSQLResult = {
  success: true,
  question: 'Tổng doanh thu tháng 12?',
  sql: 'SELECT SUM(total) as total_revenue FROM orders WHERE created_at >= \'2024-12-01\'',
  rawData: [{ total_revenue: 125680000 }],
  naturalResponse: '📊 **Tổng doanh thu tháng 12/2024**: 125.680.000 đ\n\nSo với tháng trước (95.000.000 đ), doanh thu tăng **32.3%** - một kết quả rất tích cực! 🚀',
};

// ============= API FUNCTIONS =============

export const sendChatMessage = async (message: string, generateCode: boolean = false, context: any[] = []) => {
  // Demo mode: return mock response
  if (isDemoModeActive()) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      message: generateCode 
        ? { code: '// Demo code\nconsole.log("Hello from Nexora!");', language: 'javascript', explanation: 'Demo generated code' }
        : `Đây là câu trả lời demo cho: "${message}"`,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  const token = Cookies.get('token');
  const res = await axios.post(
    `${API_BASE}/ai/chat`,
    { message, generateCode, context },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

export const getChatHistory = async () => {
  if (isDemoModeActive()) {
    return [];
  }

  const token = Cookies.get('token');
  const res = await axios.get(`${API_BASE}/ai/chat/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getConversation = async (id: number) => {
  if (isDemoModeActive()) {
    return { id, messages: [] };
  }

  const token = Cookies.get('token');
  const res = await axios.get(`${API_BASE}/ai/chat/history/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// ============= NEW LLM FEATURES =============

/**
 * Analyze error log using RCA (Root Cause Analysis)
 * @param errorLog - The error log or stack trace to analyze
 */
export const analyzeError = async (errorLog: string): Promise<RCAResult> => {
  // Demo mode: return mock response
  if (isDemoModeActive()) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return MOCK_RCA_RESPONSE;
  }

  try {
    const token = Cookies.get('token');
    const res = await axios.post(
      `${API_BASE}/llm-orchestrator/analyze-incident`,
      { incident_description: errorLog, logs: errorLog },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      analysis: null,
      codeContext: [],
      error: error.response?.data?.message || error.message || 'Failed to analyze error',
    };
  }
};

/**
 * Query database using natural language (Text-to-SQL)
 * @param question - Natural language question about data
 */
export const queryDatabase = async (question: string): Promise<TextToSQLResult> => {
  // Demo mode: return mock response
  if (isDemoModeActive()) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      ...MOCK_TEXT_TO_SQL_RESPONSE,
      question,
      naturalResponse: `📊 **Kết quả cho câu hỏi**: "${question}"\n\n✅ Đây là dữ liệu demo. Trong môi trường thực, hệ thống sẽ truy vấn database và trả về kết quả thực tế.`,
    };
  }

  try {
    const token = Cookies.get('token');
    const res = await axios.post(
      `${API_BASE}/llm-orchestrator/text-to-sql`,
      { question },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      question,
      naturalResponse: 'Có lỗi xảy ra khi xử lý câu hỏi của bạn.',
      error: error.response?.data?.message || error.message || 'Failed to query database',
    };
  }
};

