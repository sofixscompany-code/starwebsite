import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Phone } from "lucide-react";
import { WHATSAPP_CHAT_LINK } from "@/lib/links";
const FREE_MESSAGE_LIMIT = 3;

const PREdefined_REPLIES: Record<string, string> = {
  hello: "Namaste! 🙏 Welcome to Star Coaching Institute. How can we help you?",
  hi: "Namaste! 🙏 Welcome to Star Coaching Institute. How can we help you?",
  fee: "Our fee structure varies by course. Please visit our Admission page or call us at +977-9804899123 for details.",
  fees: "Our fee structure varies by course. Please visit our Admission page or call us at +977-9804899123 for details.",
  course:
    "We offer Nepal Police, Army, Loksewa, Medical (Staff Nurse/HA), Engineering & Technical coaching. Visit /courses for details!",
  courses:
    "We offer Nepal Police, Army, Loksewa, Medical (Staff Nurse/HA), Engineering & Technical coaching. Visit /courses for details!",
  admission: "Admissions are open! Visit /admission or call +977-9804899123 to enroll. 🎓",
  result: "Our students consistently achieve top results! Check /results for latest selections. ⭐",
  results:
    "Our students consistently achieve top results! Check /results for latest selections. ⭐",
  location: "📍 We are located at Zeromile, Janakpurdham-7, Madhesh Province, Nepal.",
  address: "📍 We are located at Zeromile, Janakpurdham-7, Madhesh Province, Nepal.",
  timing: "⏰ We are open Mo-Su 6:00 AM – 8:00 PM.",
  time: "⏰ We are open Mo-Su 6:00 AM – 8:00 PM.",
  phone: "📞 Call us: +977-9804899123 | +977-9804899124",
  contact:
    "📞 Call us: +977-9804899123\n📧 Email: info@starcoaching.edu.np\n📍 Zeromile, Janakpurdham-7",
};

function getBotReply(msg: string): string {
  const lower = msg.toLowerCase().trim();
  for (const [key, reply] of Object.entries(PREdefined_REPLIES)) {
    if (lower.includes(key)) return reply;
  }
  return "Thanks for your message! For detailed assistance, please WhatsApp us or call +977-9804899123. 😊";
}

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  time: string;
}

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Namaste! 🙏 Welcome to Star Coaching Institute. Ask us anything about courses, fees, or admission!",
      sender: "bot",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [msgCount, setMsgCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || msgCount >= FREE_MESSAGE_LIMIT) return;

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = { id: Date.now(), text: input.trim(), sender: "user", time: now };
    const newCount = msgCount + 1;

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setMsgCount(newCount);

    setTimeout(() => {
      const botMsg: Message = {
        id: Date.now() + 1,
        text:
          newCount >= FREE_MESSAGE_LIMIT
            ? "You've used your free messages. For more help, please contact us on WhatsApp! 💚"
            : getBotReply(userMsg.text),
        sender: "bot",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  const openWhatsApp = () => {
    window.open(
      `${WHATSAPP_CHAT_LINK}?text=${encodeURIComponent("Hi Star Coaching! I need help.")}`,
      "_blank",
    );
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
          aria-label="Open chat"
        >
          <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
          {/* Ping animation */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] text-white items-center justify-center font-bold">
              1
            </span>
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col"
          style={{ maxHeight: "min(580px, calc(100vh - 6rem))" }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
              ⭐
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Star Coaching Institute</h3>
              <p className="text-[11px] text-blue-100">Usually replies instantly</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 bg-gray-50 p-4 overflow-y-auto space-y-3"
            style={{ minHeight: 250 }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-[#25D366] text-white rounded-br-md"
                      : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-md"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <p
                    className={`text-[10px] mt-1 ${msg.sender === "user" ? "text-green-100" : "text-gray-400"}`}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}

            {/* Free messages counter */}
            {msgCount > 0 && msgCount < FREE_MESSAGE_LIMIT && (
              <p className="text-center text-[10px] text-gray-400">
                {FREE_MESSAGE_LIMIT - msgCount} free message
                {FREE_MESSAGE_LIMIT - msgCount !== 1 ? "s" : ""} remaining
              </p>
            )}

            {/* WhatsApp CTA after limit */}
            {msgCount >= FREE_MESSAGE_LIMIT && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 text-center space-y-3">
                <div className="text-3xl">💬➡️💚</div>
                <p className="text-sm font-semibold text-gray-800">Free messages used up!</p>
                <p className="text-xs text-gray-600">
                  For detailed help, chat with us directly on WhatsApp.
                </p>
                <button
                  onClick={openWhatsApp}
                  className="w-full bg-[#25D366] hover:bg-[#20BD5B] text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition"
                >
                  <Phone className="w-4 h-4" />
                  Chat on WhatsApp
                </button>
                <p className="text-[10px] text-gray-400">Or call: +977-9804899123</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {msgCount < FREE_MESSAGE_LIMIT && (
            <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 text-sm px-4 py-2.5 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-[#25D366] transition"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:bg-[#20BD5B] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
