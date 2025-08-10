// This component ensures that every signed-in Clerk user is synced to your backend DB for admin/login/etc.
import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";

export default function SyncClerkUser() {
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn && user?.primaryEmailAddress?.emailAddress) {
      const payload = {
        email: user.primaryEmailAddress.emailAddress,
        name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : undefined,
        clerkId: user.id,
      }; 
      fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(res => res.json())
        .then(data => {
          // After syncing, fetch user from new public route
          return fetch(`/api/users/by-email/${encodeURIComponent(payload.email)}`);
        })
        .then(res => res.json())
        .then(userData => {
          console.log("Clerk user fetched from backend:", userData);
          // Log in Clerk user to set JWT cookie for session
          return fetch("/api/auth/login/clerk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: payload.email })
          });
        })
        .then(res => res.json())
        .then(loginData => {
          console.log("Clerk user session established:", loginData);
        })
        .catch(err => {
          console.error("Error syncing, fetching, or logging in Clerk user:", err);
        });
    }
  }, [isSignedIn, user]);

  return null;
}
