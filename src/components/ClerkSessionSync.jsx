
import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useClerk } from "@clerk/clerk-react";


export default function ClerkSessionSync() {
  const { login } = useAuth();
  const { user } = useClerk();
  const hasSyncedRef = useRef(false);


  useEffect(() => {
    // Only run once per session
    if (!user || hasSyncedRef.current) return;
    let email = null;
    let name = null;
    if (user.primaryEmailAddress) {
      email = user.primaryEmailAddress.emailAddress;
    } else if (user.emailAddresses && user.emailAddresses[0]) {
      email = user.emailAddresses[0].emailAddress;
    }
    if (user.fullName) {
      name = user.fullName;
    }
    if (!email) return;

    // Prevent duplicate upserts
    hasSyncedRef.current = true;

    // Check if user exists in backend first
    (async () => {
      try {
        console.log("[ClerkSessionSync] Checking/Upserting user in backend:", { email, name });
  const checkRes = await fetch(`/api/users/by-email/${encodeURIComponent(email)}`);
        let exists = false;
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          if (checkData && checkData.email) exists = true;
        }
        if (!exists) {
          // Upsert user in backend
          const upsertRes = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, name, role: "user" })
          });
          const upsertData = await upsertRes.json().catch(() => ({}));
          if (!upsertRes.ok) {
            console.error("[ClerkSessionSync] Backend upsert error:", upsertData);
          } else {
            console.log("[ClerkSessionSync] User upserted in backend:", upsertData);
          }
        } else {
          console.log("[ClerkSessionSync] User already exists in backend:", email);
        }
        login({ email, role: "user" });
      } catch (err) {
        console.error("[ClerkSessionSync] Error syncing user to backend:", err);
      }
    })();
  }, [user, login]);

  return null;
}
