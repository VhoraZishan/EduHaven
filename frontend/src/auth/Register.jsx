import { useState, useEffect, useContext  } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";


function Register() {
  const { token } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
  if (token) {
    navigate("/");
  }
}, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("auth/register/", {
        username,
        password,
      });

      navigate("/login");
    } catch {
      setError("Registration failed. Try a different username.");
    }
  };

  if (token) return null;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create an account</h1>
        <p style={styles.subtitle}>
          Join EduHaven and start posting
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button style={styles.button} type="submit">
            Sign up
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "calc(100vh - 70px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    border: "var(--brutal-border)",
    borderRadius: "12px",
    padding: "32px",
    boxShadow: "var(--brutal-shadow)",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    marginTop: "6px",
    marginBottom: "24px",
    fontSize: "15px",
    color: "#4b5563",
    fontWeight: "500",
  },
  error: {
    background: "var(--cat-news)",
    color: "#9f1239",
    padding: "12px",
    borderRadius: "6px",
    fontSize: "14px",
    marginBottom: "16px",
    border: "var(--brutal-border)",
    boxShadow: "2px 2px 0px #000",
    fontWeight: "600",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  input: {
    padding: "12px",
    fontSize: "15px",
    borderRadius: "8px",
    border: "var(--brutal-border)",
    boxShadow: "2px 2px 0px rgba(0,0,0,1)",
    outline: "none",
    fontWeight: "500",
  },
  button: {
    marginTop: "10px",
    padding: "14px",
    fontSize: "16px",
    background: "var(--accent-primary)",
    color: "#ffffff",
  },
  footer: {
    marginTop: "24px",
    fontSize: "15px",
    textAlign: "center",
    color: "#000",
    fontWeight: "600",
  },
  link: {
    color: "var(--accent-primary)",
    textDecoration: "underline",
    fontWeight: "800",
  },
};

export default Register;
