import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("users")) || [];

    if (!form.username || !form.password || (!isLogin && !form.email)) {
      setMessage("All fields are required.");
      return;
    }

    if (isLogin) {
      const found = users.find((u) => u.username === form.username);
      if (!found) return setMessage("User not found.");
      if (found.password !== form.password) return setMessage("Wrong password.");

      localStorage.setItem("loggedInUser", JSON.stringify(found));
      setShowPopup(true);
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } else {
      const exists = users.some((u) => u.username === form.username);
      if (exists) return setMessage("Username already exists.");

      const newUser = { ...form, orders: [], wishlist: [] };
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("adminUserUpdates", JSON.stringify(users));
      setForm({ username: "", email: "", password: "" });
      setIsLogin(true);
      setMessage("Signup successful. Please log in.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">{isLogin ? "Login" : "Sign Up"}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full border px-4 py-2 rounded"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
          {!isLogin && (
            <input
              type="email"
              placeholder="Email"
              className="w-full border px-4 py-2 rounded"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          )}
          <input
            type="password"
            placeholder="Password"
            className="w-full border px-4 py-2 rounded"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={() => { setIsLogin(!isLogin); setMessage(""); }} className="text-blue-500 underline">
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>

        {message && <p className="mt-2 text-red-500 text-sm text-center">{message}</p>}
      </div>

      {showPopup && (
        <div className="fixed top-5 bg-green-500 text-white px-6 py-2 rounded shadow-lg animate-bounce">
          Login Successful!
        </div>
      )}
    </div>
  );
};

export default Auth;
