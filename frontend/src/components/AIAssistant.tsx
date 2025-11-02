"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, Activity } from "lucide-react";

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzeMode, setAnalyzeMode] = useState(false);
  const pathname = usePathname();

  const patientId = "P0002"; // Example (you can dynamically fetch later)

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user" as const, text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      let answer = "";

      // 👇 If analyze mode is ON and we're on patient dashboard
      if (analyzeMode && pathname.includes("patient-dashboard")) {
        console.log("🔍 Analyzing patient records before AI response...");
        const analyzeRes = await fetch("http://127.0.0.1:5001/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patient_id: patientId }),
        });

        const analyzeData = await analyzeRes.json();
        if (!analyzeData.success) throw new Error("Analysis failed");
      }

      // 👇 Then query AI for response
      const askRes = await fetch("http://127.0.0.1:5001/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: input,
          patient_id: patientId,
          analyze: analyzeMode,
        }),
      });

      const askData = await askRes.json();
      answer = askData.answer || "⚠️ AI could not generate a response.";

      setMessages((prev) => [...prev, { role: "ai", text: answer }]);
    } catch (err) {
      console.error("AI chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "⚠️ There was a problem connecting to the AI service." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-sky-600 text-white shadow-lg hover:bg-sky-500"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 right-6 z-50 w-80 rounded-2xl border border-white/10 bg-[#111827] p-4 text-white shadow-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Bot className="h-5 w-5 text-sky-400" /> 
                DocTalk
              </h3>

              {/* Analyze Toggle (only visible on patient dashboard) */}
              {pathname.includes("patient-dashboard") && (
                <button
                  onClick={() => setAnalyzeMode(!analyzeMode)}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${
                    analyzeMode ? "bg-emerald-600/30 text-emerald-300" : "bg-white/10 text-gray-400"
                  }`}
                >
                  <Activity className="h-3 w-3" />
                  {analyzeMode ? "Analyzing" : "Analyze Records"}
                </button>
              )}
            </div>

            {/* Chat Messages */}
            <div className="h-64 overflow-y-auto space-y-3 p-2 rounded-md bg-black/30">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-lg ${
                    m.role === "user"
                      ? "bg-sky-600/20 text-sky-200 self-end"
                      : "bg-white/10 text-white"
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {loading && <p className="text-sm text-gray-400">Thinking...</p>}
            </div>

            {/* Input */}
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask MediChain AI..."
                className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-sm outline-none"
              />
              <button
                onClick={handleSend}
                className="flex items-center justify-center rounded-lg bg-sky-600 px-3 hover:bg-sky-500"
                disabled={loading}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
