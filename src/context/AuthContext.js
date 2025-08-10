import React, { createContext, useContext, useState, useEffect } from "react";


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);

	// On mount, hydrate user from backend if token exists
	useEffect(() => {
		async function hydrateUser() {
			const stored = localStorage.getItem("user");
			if (stored) {
				setUser(JSON.parse(stored));
				return;
			}
			// Try to fetch user from backend using token (if exists)
			try {
				const res = await fetch("/api/auth/me", { credentials: "include" });
				if (res.ok) {
					const data = await res.json();
					if (data && data.user) {
						setUser(data.user);
						localStorage.setItem("user", JSON.stringify(data.user));
					}
				}
			} catch {}
		}
		hydrateUser();
	}, []);

	useEffect(() => {
		if (user) {
			localStorage.setItem("user", JSON.stringify(user));
		} else {
			localStorage.removeItem("user");
		}
	}, [user]);


	const login = async (userData) => {
	       // Always fetch latest user from backend by email to get _id
	       try {
		       const res = await fetch(`/api/users/by-email/${encodeURIComponent(userData.email)}`);
		       const data = await res.json();
		       if (data && data.data) {
			       const prevUser = localStorage.getItem("user");
			       setUser(data.data);
			       localStorage.setItem("user", JSON.stringify(data.data));
			       // Only reload if user actually changed
			       if (!prevUser || (JSON.parse(prevUser).email !== data.data.email)) {
				       window.location.reload();
			       }
			       return;
		       }
	       } catch {}
	       const prevUser = localStorage.getItem("user");
	       setUser(userData);
	       localStorage.setItem("user", JSON.stringify(userData));
	       if (!prevUser || (JSON.parse(prevUser).email !== userData.email)) {
		       window.location.reload();
	       }
	};

	const logout = async () => {
	       const hadUser = !!localStorage.getItem("user");
	       setUser(null);
	       // Remove all user-related localStorage keys to prevent auto-login
	       localStorage.removeItem("user");
	       localStorage.removeItem("users");
	       localStorage.removeItem("loggedInUser");
	       // Optionally clear other session keys if used
	       // Call backend to clear session cookie
	       try {
		       await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
	       } catch {}
	       // Only reload if there was a user before
	       if (hadUser) {
		       window.location.reload();
	       }
	};

	return (
		<AuthContext.Provider value={{ user, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
