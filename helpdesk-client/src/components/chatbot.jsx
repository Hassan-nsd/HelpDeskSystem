import { useEffect, useRef, useState } from "react";
import {
  clearChatHistory,
  getChatHistory,
  sendChatMessage,
} from "../services/api";
import "../styles/chatbot.css";

const CHAT_STORAGE_KEY = "helpdeskChatMessages";

const defaultMessages = [
  {
    role: "assistant",
    content: "Hello! How can I help you today?",
  },
];

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState(() => {
    try {
      const savedMessages = sessionStorage.getItem(CHAT_STORAGE_KEY);

      if (!savedMessages) {
        return defaultMessages;
      }

      const parsedMessages = JSON.parse(savedMessages);

      return Array.isArray(parsedMessages) ? parsedMessages : defaultMessages;
    } catch (error) {
      console.error("Failed to load chatbot messages:", error);

      return defaultMessages;
    }
  });

  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const savedMessages = await getChatHistory();

        if (Array.isArray(savedMessages) && savedMessages.length > 0) {
          setMessages(
            savedMessages.map((savedMessage) => ({
              role: savedMessage.role,
              content: savedMessage.content,
            })),
          );
        } else {
          setMessages(defaultMessages);
        }
      } catch (error) {
        console.error("Failed to load database chat history:", error);
      }
    };

    loadChatHistory();
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error("Failed to save chatbot messages:", error);
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages, isSending, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || isSending) {
      return;
    }

    const userMessage = {
      role: "user",
      content: trimmedMessage,
    };

    const previousMessages = messages;

    setMessages((currentMessages) => [...currentMessages, userMessage]);

    setMessage("");
    setIsSending(true);

    try {
      const history = previousMessages
        .filter(
          (chatMessage) =>
            chatMessage.role === "user" || chatMessage.role === "assistant",
        )
        .map((chatMessage) => ({
          role: chatMessage.role,
          content: chatMessage.content,
        }));

      const result = await sendChatMessage(trimmedMessage, history);

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          content: result.reply || "I could not generate a response.",
        },
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          content: error.message || "The chatbot is currently unavailable.",
          isError: true,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearChat = async () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear the conversation?",
    );

    if (!confirmClear || isSending) {
      return;
    }

    try {
      await clearChatHistory();

      setMessages(defaultMessages);
      sessionStorage.removeItem(CHAT_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear chat:", error);

      window.alert(error.message || "Failed to clear the conversation.");
    }
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div>
              <h3>HelpDesk Assistant</h3>
              <span>{isSending ? "Thinking..." : "Online"}</span>
            </div>

            <div className="chatbot-header-actions">
              <button
                type="button"
                className="chatbot-clear-btn"
                onClick={handleClearChat}
                disabled={isSending}
              >
                Clear
              </button>

              <button
                type="button"
                className="chatbot-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close chatbot"
              >
                ×
              </button>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((chatMessage, index) => (
              <div
                key={`${chatMessage.role}-${index}`}
                className={`chatbot-message ${
                  chatMessage.role
                } ${chatMessage.isError ? "error" : ""}`}
              >
                <div className="chatbot-message-content">
                  {chatMessage.content}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="chatbot-message assistant">
                <div className="chatbot-message-content chatbot-typing">
                  Thinking...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-area" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                isSending
                  ? "Waiting for a response..."
                  : "Describe your issue..."
              }
              disabled={isSending}
            />

            <button type="submit" disabled={!message.trim() || isSending}>
              {isSending ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="chatbot-toggle-btn"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
      >
        {isOpen ? "×" : "💬"}
      </button>
    </div>
  );
}

export default Chatbot;
