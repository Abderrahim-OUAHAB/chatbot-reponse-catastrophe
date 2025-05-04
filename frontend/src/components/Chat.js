import React, { useState, useEffect } from "react";
import { sendMessage, initDocs } from "../api/api";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initDocs()
      .then(() => console.log("Docs chargés"))
      .catch((err) => console.error("Erreur init:", err));
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await sendMessage(input);
      const botMsg = { role: "bot", content: res.data.answer };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = { role: "bot", content: "Erreur serveur" };
      setMessages((prev) => [...prev, errorMsg]);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-neutral-100">
      {/* Sidebar gauche */}
      <div className="w-96 bg-white border-r border-neutral-200 overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-black">Discussion précédente</h2>
          <div className="mt-6 mx-4 p-2 bg-white rounded-lg border border-neutral-200 flex items-center gap-3">
            <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search chats" 
              className="flex-1 text-zinc-500 text-base font-normal outline-none"
            />
          </div>
        </div>
      </div>

      {/* Zone de chat principale */}
      <div className="flex-1 bg-white overflow-hidden flex flex-col">
        {/* En-tête */}
        <div className="border-b border-neutral-200 p-4 flex items-center gap-4">
          <img src="profIMG.png" alt="Profile" className="w-12 h-12 rounded-full border border-black" />
          <div>
            <h3 className="text-black font-medium">RespeBot</h3>
            <p className="text-zinc-700">Bienvenue, comment puis-je vous aider ?</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-8">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-end gap-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "bot" && (
                  <img src="profIMG.png" alt="bot" className="w-8 h-8 rounded-full border border-black" />
                )}
                <div
                  className={`max-w-md px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-black text-white rounded-t-2xl rounded-bl-2xl"
                      : "bg-neutral-200 text-black rounded-t-2xl rounded-br-2xl"
                  }`}
                >
                  <p>{msg.content}</p>
                </div>
                {msg.role === "user" && (
                  <img src="user.svg" alt="user" className="w-8 h-8 rounded-full border border-black" />
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-3">
                <img src="profIMG.png" alt="bot" className="w-8 h-8 rounded-full border border-black" />
                <div className="px-4 py-3 bg-neutral-200 text-black rounded-t-2xl rounded-br-2xl animate-pulse">
                  <p>...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Saisie */}
        <div className="border-t border-neutral-200 p-4">
          <div className="max-w-3xl mx-auto flex items-center gap-4 p-2 border border-neutral-200 rounded-lg">
            <input 
              type="text" 
              placeholder="Enter your message" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              className="flex-1 text-zinc-500 text-base font-normal outline-none px-2"
            />
            <svg 
              className="w-6 h-6 text-zinc-500 cursor-pointer"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              onClick={handleSend}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
        </div>
      </div>

      {/* Sidebar droit */}
      <div className="w-64 bg-white border-l border-neutral-200 p-6">
        <div className="flex flex-col items-center space-y-6">
          <img src="profIMG.png" alt="Profile" className="w-32 h-32 rounded-full border border-black" />
          <div className="text-center">
            <h3 className="text-black font-medium">RespoBot</h3>
            <p className="text-zinc-700">Let's Chat Now !</p>
          </div>
        </div>
        <button className="mt-8 w-full bg-black text-white py-2 px-4 rounded-lg flex justify-center items-center gap-2">
          Statistiques
        </button>
      </div>
    </div>
  );
};

export default Chat;
