import React, { createContext, useContext, useState, useEffect } from "react";


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);

	// On mount, hydrate user from backend if token exists
	useEffect(() => {
		async function hydrateUser() {
			try {
				const res = await fetch("/api/auth/me", { credentials: "include" });
				if (res.ok) {
					const data = await res.json();
					if (data && data.user) {
						setUser(data.user);
					}
				}
			} catch {}
		}
		hydrateUser();
	}, []);

	// No localStorage usage for user/session


const login = async (userData) => {
       try {
	       const res = await fetch(`/api/users/by-email/${encodeURIComponent(userData.email)}`);
	       const data = await res.json();
	       if (data && data.data) {
		       setUser(data.data);
		       return;
	       }
       } catch {}
       setUser(userData);
};

	const logout = async () => {
		setUser(null);
		try {
			await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
		} catch {}
	};

	return (
		<AuthContext.Provider value={{ user, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
