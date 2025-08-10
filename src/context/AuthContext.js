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
				setUser(data.data);
				localStorage.setItem("user", JSON.stringify(data.data));
				return;
			}
		} catch {}
		setUser(userData);
		localStorage.setItem("user", JSON.stringify(userData));
	};

	const logout = () => {
		setUser(null);
		localStorage.removeItem("user");
	};

	return (
		<AuthContext.Provider value={{ user, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
