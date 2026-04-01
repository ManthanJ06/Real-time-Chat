import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

function Chat({ username }) {
  const socketRef = useRef(null);

  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // messages: { user1: [...], user2: [...] }
  const [messages, setMessages] = useState({});

  useEffect(() => {
    const socket = io("http://localhost:5000");
    socketRef.current = socket;

    socket.emit("join", username);

    // ✅ FIXED MESSAGE HANDLING
   socket.on("private message", (msg) => {
     const { from, to, text } = msg;

     // identify the other user correctly
     const chatUser = from === username ? to : from;

     setMessages((prev) => ({
       ...prev,
       [chatUser]: [...(prev[chatUser] || []), { user: from, text }],
     }));
   });
    socket.on("users", (list) => {
      const filtered = list.filter((u) => u !== username);
      setUsers(filtered);

      // auto-select safely
      setSelectedUser((prev) => prev || filtered[0] || null);
    });

    return () => socket.disconnect();
  }, [username]);

  // ✅ SEND MESSAGE (NO DUPLICATE ADD)
const sendMessage = (e) => {
  e.preventDefault();

  console.log("SENDING:", message, "TO:", selectedUser); // 🔥 DEBUG

  if (!message.trim() || !selectedUser) {
    console.log("BLOCKED SEND");
    return;
  }

  socketRef.current.emit("private message", {
    from: username,
    to: selectedUser,
    text: message,
  });

  setMessage("");
};

  const currentMessages = messages[selectedUser] || [];

  return (
    <div style={{ display: "flex", height: "90vh" }}>
      {/* USERS */}
      <div className="users"
        style={{
          width: "25%",
          background: "#2c3e50",
          color: "white",
          padding: "10px",
          
        }}
      >
        <h3>Users</h3>

        {users.map((u, i) => (
          <div
            key={i}
            onClick={() => setSelectedUser(u)}
            style={{
              padding: "10px",
              cursor: "pointer",
              background: selectedUser === u ? "#1abc9c" : "transparent",
              color: selectedUser === u ? "black" : "white",
              borderRadius: "5px",
              marginBottom: "5px",
            }}
          >
            👤 {u}
          </div>
        ))}
      </div>

      {/* CHAT */}
      <div style={{ width: "75%", display: "flex", flexDirection: "column" }}>
        <h2 style={{ padding: "10px" }}>
          {selectedUser ? `Chat with: ${selectedUser}` : "Select a user"}
        </h2>

        <div
          style={{
            flex: 1,
            padding: "10px",
            background: "#ecf0f1",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {currentMessages.length === 0 ? (
            <p>No messages yet</p>
          ) : (
            currentMessages.map((m, i) => {
              const isMe = m.user === username;

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: isMe ? "flex-end" : "flex-start",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "60%",
                      padding: "10px",
                      borderRadius: "10px",
                      background: isMe ? "#1abc9c" : "#bdc3c7",
                      color: isMe ? "black" : "black",
                      textAlign: "left",
                    }}
                  >
                    <strong>{isMe ? "You" : m.user}</strong>
                    <br />
                    {m.text}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={sendMessage} style={{ display: "flex" }}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type message..."
            style={{ flex: 1, padding: "10px" }}
          />
          <button style={{ padding: "10px 20px" }}>Send</button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
