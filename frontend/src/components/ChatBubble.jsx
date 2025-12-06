const ChatBubble = ({ message, isMe }) => {
    return (
        <div className={`flex w-full mt-2 space-x-3 max-w-xs ${isMe ? 'ml-auto justify-end' : ''}`}>
        <div>
            <div className={`${isMe ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'} p-3 rounded-r-lg rounded-bl-lg`}>
            <p className="text-sm">{message.text}</p>
            </div>
            <span className="text-xs text-gray-500 leading-none block mt-1">
            {message.timestamp || 'Just now'}
            </span>
        </div>
        </div>
    );
};

export default ChatBubble;