import React from "react";

const Chat = () => {
  return (
    <div className="flex h-screen bg-neutral-100">
      {/* Sidebar gauche - Historique des conversations */}
      <div className="w-96 bg-white border-r border-neutral-200 overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-black">Discussion précédente</h2>
          
          {/* Barre de recherche */}
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
          
          {/* Liste des conversations */}
          <div className="mt-4">
            <div className="px-4 py-3 bg-neutral-100 flex items-center gap-4">
              <div className="flex-1">
                <p className="text-zinc-700 font-medium">Will head to the Help Center...</p>
              </div>
            </div>
            
            <div className="px-4 py-3 rounded-lg hover:bg-neutral-50 cursor-pointer">
              <p className="text-zinc-700">Let's go</p>
            </div>
            
            <div className="px-4 py-3 rounded-lg hover:bg-neutral-50 cursor-pointer">
              <p className="text-zinc-700">Truceeeee</p>
            </div>
            
            <div className="px-4 py-3 rounded-lg hover:bg-neutral-50 cursor-pointer">
              <p className="text-zinc-700">let yeah, are you coming to the lunch on the 13...</p>
            </div>
            
            <div className="px-4 py-3 rounded-lg hover:bg-neutral-50 cursor-pointer">
              <p className="text-zinc-700">great catching up over dinner!!</p>
            </div>
            
            <div className="px-4 py-3 rounded-lg hover:bg-neutral-50 cursor-pointer">
              <p className="text-zinc-700">yap ✅✅</p>
            </div>
            
            <div className="px-4 py-3 rounded-lg hover:bg-neutral-50 cursor-pointer">
              <p className="text-zinc-700">When are you coming back to town? Would low...</p>
            </div>
            
            <div className="px-4 py-3 rounded-lg hover:bg-neutral-50 cursor-pointer">
              <p className="text-zinc-700">Thanks!</p>
            </div>
            
            <div className="px-4 py-3 rounded-lg hover:bg-neutral-50 cursor-pointer">
              <p className="text-zinc-700">Jack needs to find a sitter for the dog and I do...</p>
            </div>
            
            <div className="px-4 py-3 rounded-lg hover:bg-neutral-50 cursor-pointer">
              <p className="text-zinc-700">sgi</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Zone de chat principale */}
      <div className="flex-1 bg-white overflow-hidden flex flex-col">
        {/* En-tête du chat */}
        <div className="border-b border-neutral-200 p-4 flex items-center gap-4">
          <img 
            src="profIMG.png" 
            alt="Profile" 
            className="w-12 h-12 rounded-full border border-black"
          />
          <div>
            <h3 className="text-black font-medium">RespeBot</h3>
            <p className="text-zinc-700">Bienvenue, comment puis-je vous aider ?</p>
          </div>
        </div>
        
        {/* Corps du chat */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Message de l'utilisateur */}
            <div className="flex flex-col items-end space-y-2">
              <div className="max-w-md px-4 py-3 bg-black text-white rounded-t-2xl rounded-bl-2xl">
                <p>No honestly I'm thinking of a career pivot</p>
              </div>
              <div className="max-w-md px-4 py-3 bg-black text-white rounded-t-2xl rounded-bl-2xl">
                <p>This is the main chat template</p>
              </div>
            </div>
            
            {/* Date */}
            <div className="text-center text-zinc-500 text-sm">Nov 30, 2023, 9:41 AM</div>
            
            {/* Réponse du bot */}
            <div className="flex flex-col items-start space-y-2">
              <div className="max-w-md px-4 py-3 bg-neutral-200 rounded-t-2xl rounded-br-2xl">
                <p>Oh?</p>
              </div>
              <div className="max-w-md px-4 py-3 bg-neutral-200 rounded-t-2xl rounded-br-2xl">
                <p>Cool</p>
              </div>
              <div className="max-w-md px-4 py-3 bg-neutral-200 rounded-t-2xl rounded-br-2xl">
                <p>How does it work?</p>
              </div>
            </div>
            
            {/* Message de l'utilisateur */}
            <div className="flex flex-col items-end space-y-2">
              <div className="max-w-md px-4 py-3 bg-black text-white rounded-t-2xl rounded-bl-2xl">
                <p>Simple</p>
              </div>
              <div className="max-w-md px-4 py-3 bg-black text-white rounded-t-2xl rounded-bl-2xl">
                <p>You just edit any text to type in the conversation you want to show, and delete any bubbles you don't want to use</p>
              </div>
            </div>
            
            {/* Réponse du bot */}
            <div className="flex flex-col items-start space-y-2">
              <div className="max-w-md px-4 py-3 bg-neutral-200 rounded-t-2xl rounded-br-2xl">
                <p>I think I get it</p>
              </div>
              <div className="max-w-md px-4 py-3 bg-neutral-200 rounded-t-2xl rounded-br-2xl">
                <p>Will head to the Help Center if I have more questions tho</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Zone de saisie */}
        <div className="border-t border-neutral-200 p-4">
          <div className="max-w-3xl mx-auto flex items-center gap-4 p-2 border border-neutral-200 rounded-lg">
            <input 
              type="text" 
              placeholder="Enter your message" 
              className="flex-1 text-zinc-500 text-base font-normal outline-none px-2"
            />
            {/* Icône d'attachement */}
            <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            {/* Icône d'envoi */}
            <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Sidebar droit - Profil */}
      <div className="w-64 bg-white border-l border-neutral-200 p-6">
        <div className="flex flex-col items-center space-y-6">
          <img 
            src="profIMG.png" 
            alt="Profile" 
            className="w-32 h-32 rounded-full border border-black"
          />
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