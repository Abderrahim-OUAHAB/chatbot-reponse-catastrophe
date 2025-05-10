import React, { useState, useEffect, useMemo } from "react";
import { sendMessage, initDocs } from "../api/api";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    initDocs()
      .then(() => console.log("Docs chargés"))
      .catch((err) => console.error("Erreur init:", err));
  }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
        setMessages(prev => [...prev, {
            role: "bot",
            content: "La géolocalisation n'est pas supportée par votre navigateur"
        }]);
        return;
    }

    setIsLoading(true);
    setLocationError(null);

    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };

    const success = (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setIsLoading(false);
        setMessages(prev => [...prev, {
            role: "bot",
            content: "Localisation enregistrée avec succès"
        }]);
    };

    const error = (err) => {
        setIsLoading(false);
        let errorMessage = "Erreur de géolocalisation - ";
        switch(err.code) {
            case err.PERMISSION_DENIED:
                errorMessage += "Vous avez refusé l'accès à la localisation";
                break;
            case err.POSITION_UNAVAILABLE:
                errorMessage += "Les informations de localisation ne sont pas disponibles";
                break;
            case err.TIMEOUT:
                errorMessage += "La requête de localisation a expiré";
                break;
            default:
                errorMessage += "Erreur inconnue";
        }
        setLocationError(errorMessage);
        setMessages(prev => [...prev, {
            role: "bot",
            content: errorMessage
        }]);
    };

    navigator.geolocation.getCurrentPosition(success, error, options);
};

const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
        const res = await sendMessage(input, userLocation);
        
        // Gestion robuste de la réponse
        if (res.data && typeof res.data.answer === 'string') {
            const botMsg = { role: "bot", content: res.data.answer };
            setMessages((prev) => [...prev, botMsg]);
        } else if (res.data && res.data.error) {
            throw new Error(res.data.error);
        } else {
            throw new Error("Format de réponse inattendu");
        }
    } catch (err) {
        console.error("Erreur API:", err);
        const errorContent = err.response?.data?.details || 
                          err.response?.data?.error || 
                          err.message || 
                          "Erreur lors de la communication avec le serveur";
        
        setMessages(prev => [...prev, {
            role: "bot",
            content: `Erreur: ${errorContent}`
        }]);
    } finally {
        setIsLoading(false);
    }
};

  const filteredMessages = useMemo(() => {
    return messages.filter((msg) =>
      msg.content.toLowerCase().includes(search.toLowerCase())
    );
  }, [messages, search]);

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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-zinc-500 text-base font-normal outline-none"
            />
          </div>

          <div className="mt-4 space-y-2">
            {filteredMessages
              .filter((msg) => msg.role === "user")
              .map((msg, idx) => (
                <div
                  key={idx}
                  className="px-4 py-3 rounded-lg hover:bg-neutral-50 cursor-pointer"
                >
                  <p className="text-zinc-700 truncate">{msg.content}</p>
                  <hr></hr>
                </div>
              ))}
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
          <div className="max-w-3xl mx-auto">
            {locationError && (
              <div className="text-red-500 text-sm mb-2">{locationError}</div>
            )}
            <div className="flex items-center gap-4 p-2 border border-neutral-200 rounded-lg">
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
              <button 
                onClick={handleGetLocation} 
                title="Obtenir la localisation"
                className="disabled:opacity-50"
                disabled={isLoading}
              >
                <svg 
                  className="w-6 h-6 text-zinc-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} alt="Obtenir la localisation" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/>
                </svg>
              </button>
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="disabled:opacity-50"
              >
                <svg 
                  className="w-6 h-6 text-zinc-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar droit */}
      <div className="w-64 bg-white border-l border-neutral-200 p-6">
        <div className="flex flex-col items-center space-y-6">
          <img src="profIMG.png" alt="Profile" className="w-32 h-32 rounded-full border border-black" />
          <div className="text-center">
            <h3 className="text-black font-medium">RespoBot</h3>
          </div>
        </div>
        <button className="mt-8 w-full bg-black text-white py-2 px-4 rounded-lg flex justify-center items-center gap-2">
          Let's Chat Now !
        </button>
      </div>
    </div>
  );
};

export default Chat;