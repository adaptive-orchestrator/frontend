import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Thêm tin nhắn user vào danh sách
    const newMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);

    // (Demo) Tạm trả lời cố định, sau này sẽ gọi API LLM
    const botReply: Message = { role: "assistant", content: `Bạn vừa nói: ${input}` };
    setMessages((prev) => [...prev, botReply]);

    setInput("");
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 max-w-lg mx-auto">
      <div className="h-80 overflow-y-auto border rounded-lg p-3 mb-3 space-y-2">
        {messages.length === 0 && <div className="text-gray-500">Hãy nhập câu hỏi...</div>}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-blue-600" : "text-green-600"}>
            <b>{m.role}:</b> {m.content}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Nhập tin nhắn..."
        />
        <button onClick={sendMessage} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
          Gửi
        </button>
      </div>
    </div>
  );
}