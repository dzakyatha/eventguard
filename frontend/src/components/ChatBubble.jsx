// src/components/ChatBubble.jsx
const ChatBubble = ({ message, isMe }) => {
  return (
    <div className={`flex w-full mt-3 space-x-3 max-w-xs ${isMe ? 'ml-auto justify-end' : ''}`}>
      <div className={`relative ${isMe ? 'order-1' : 'order-2'}`}>
        <div className={`px-4 py-2 rounded-lg shadow-sm text-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none'}`}>
          <p className="block">{message.text}</p>
        </div>
        <span className={`text-[10px] text-gray-400 mt-1 block ${isMe ? 'text-right' : 'text-left'}`}>
          {message.sender_username} • {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </span>
      </div>
    </div>
  );
};

export default ChatBubble;