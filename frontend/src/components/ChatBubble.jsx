// src/components/ChatBubble.jsx

const ChatBubble = ({ message, isMe }) => {
  
    // Fungsi Helper: Mengubah format waktu ke Lokal (Indonesia)
    const formatTime = (dateString) => {
      if (!dateString) return "";
      
      const safeDateString = dateString.endsWith("Z") ? dateString : dateString + "Z";
      const date = new Date(safeDateString);
  
      if (isNaN(date.getTime())) return "Jam Error";
  
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false 
      });
    };
  
    return (
      <div className={`flex w-full mt-4 space-x-3 max-w-[80%] ${isMe ? 'ml-auto justify-end' : ''}`}>
        <div className={`relative flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
          
          {/* Bubble Container */}
          <div 
            className={`px-5 py-3 shadow-sm text-sm leading-relaxed
              ${isMe 
                ? 'bg-[#251E3B] text-white rounded-2xl rounded-tr-sm' // Navy, sudut kanan atas tajam
                : 'bg-white border border-[#251E3B]/10 text-[#251E3B] rounded-2xl rounded-tl-sm' // Putih, sudut kiri atas tajam
              }
            `}
          >
            <p className="block">{message.text}</p>
          </div>
  
          {/* Metadata (Nama & Waktu) */}
          <span className={`text-[10px] font-medium mt-1 block 
            ${isMe ? 'text-slate-400 text-right mr-1' : 'text-slate-400 text-left ml-1'}
          `}>
            {message.sender_username} • {formatTime(message.timestamp)}
          </span>
  
        </div>
      </div>
    );
  };
  
  export default ChatBubble;