import { useEffect, useState } from "react";
import axios from "axios";
import Chat from "./chat";

function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("login"); // login | register
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("username");
    if (savedUser) setUser(savedUser);
  }, []);

  const handleAuth = async () => {
    if (!username || !password) {
      alert("Enter credentials");
      return;
    }

    try {
      setLoading(true);

      if (mode === "login") {
        const res = await axios.post("http://localhost:5000/login", {
          username,
          password,
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", res.data.username);
        setUser(res.data.username);
      } else {
        await axios.post("http://localhost:5000/register", {
          username,
          password,
        });

        alert("Registered! Now login");
        setMode("login");
      }
    } catch (err) {
      alert(err.response?.data || "Error");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  // ================= AUTH UI =================
  if (!user) {
    return (
      <div style={styles.container}>
        {/* NAVBAR */}
        <div style={styles.navbar}>
          <h2>💬 ChatApp</h2>

          <div>
            <button
              onClick={() => setMode("login")}
              style={{
                ...styles.navBtn,
                background: mode === "login" ? "#1abc9c" : "transparent",
              }}
            >
              Login
            </button>

            <button
              onClick={() => setMode("register")}
              style={{
                ...styles.navBtn,
                background: mode === "register" ? "#1abc9c" : "transparent",
              }}
            >
              Register
            </button>
          </div>
        </div>

        {/* FORM */}
        <div style={styles.card}>
          <h2>{mode === "login" ? "Welcome Back" : "Create Account"}</h2>

          <input
            style={styles.input}
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handleAuth} style={styles.button}>
            {loading ? "Loading..." : mode === "login" ? "Login" : "Register"}
          </button>
        </div>
      </div>
    );
  }

  // ================= CHAT UI =================
  return (
    <div>
      <div style={styles.topbar}>
        <span>👤 {user}</span>
        <button onClick={logout} style={styles.logout}>
          Logout
        </button>
      </div>

      <Chat key={user} username={user} />
    </div>
  );
}

export default App;

// ================= STYLES =================
const styles = {
  container: {
    height: "100vh",
    background: "#ecf0f1",
  },

  navbar: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px 30px",
    background: "#2c3e50",
    color: "white",
    alignItems: "center",
  },

  navBtn: {
    marginLeft: "10px",
    padding: "8px 15px",
    border: "none",
    borderRadius: "5px",
    color: "white",
    cursor: "pointer",
  },

  card: {
    width: "300px",
    margin: "80px auto",
    padding: "30px",
    background: "white",
    borderRadius: "10px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  input: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },

  button: {
    padding: "10px",
    background: "#1abc9c",
    border: "none",
    color: "white",
    borderRadius: "5px",
    cursor: "pointer",
  },

  topbar: {
    background: "#2c3e50",
    color: "white",
    padding: "10px 20px",
    display: "flex",
    justifyContent: "space-between",
  },

  logout: {
    background: "#e74c3c",
    border: "none",
    padding: "8px 15px",
    color: "white",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
