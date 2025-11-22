// src/lib/api/ai-chat.ts
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE = import.meta.env.VITE_API_BASE;

export const sendChatMessage = async (message: string, generateCode: boolean = false, context: any[] = []) => {
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
  const token = Cookies.get('token');
  const res = await axios.get(`${API_BASE}/ai/chat/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getConversation = async (id: number) => {
  const token = Cookies.get('token');
  const res = await axios.get(`${API_BASE}/ai/chat/history/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
