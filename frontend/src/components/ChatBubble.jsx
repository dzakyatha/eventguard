// src/components/ChatBubble.jsx

const ChatBubble = ({ message, isMe }) => {
  
  // Fungsi Helper: Mengubah format waktu ke Lokal (Indonesia)
  const formatTime = (dateString) => {
    if (!dateString) return "";
    
    // Trik: Jika backend mengirim string tanpa akhiran 'Z' (UTC marker),
    // kita tambahkan 'Z' agar browser menganggapnya sebagai UTC dan
    // otomatis mengonversinya ke jam lokal pengguna (misal WIB +7).
    const safeDateString = dateString.endsWith("Z") ? dateString : dateString + "Z";
    
    const date = new Date(safeDateString);

    // Cek jika tanggal tidak valid
    if (isNaN(date.getTime())) return "Jam Error";

    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false // Gunakan format 24 jam (13:00), ubah true jika ingin AM/PM
    });
  };

  return (
    <div className={`flex w-full mt-3 space-x-3 max-w-xs ${isMe ? 'ml-auto justify-end' : ''}`}>
      <div className={`relative ${isMe ? 'order-1' : 'order-2'}`}>
        <div className={`px-4 py-2 rounded-lg shadow-sm text-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none'}`}>
          <p className="block">{message.text}</p>
        </div>
        <span className={`text-[10px] text-gray-400 mt-1 block ${isMe ? 'text-right' : 'text-left'}`}>
          {/* Panggil fungsi formatTime di sini */}
          {message.sender_username} • {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
};

export default ChatBubble;