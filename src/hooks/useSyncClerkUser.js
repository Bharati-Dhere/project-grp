import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";


// This hook will sync Clerk user to your backend on every login/signup
// Accepts an optional onNoAccount callback for handling 'no account found' error
function useSyncClerkUser(onNoAccount) {
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      axios.post("/api/users", {
        email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress,
        name: user.fullName || user.firstName || "",
      }).catch((err) => {
        const msg = err?.response?.data?.message || err.message;
        if (msg && msg.includes('No account found')) {
          if (typeof onNoAccount === 'function') onNoAccount(msg);
        }
        console.error("User sync failed:", msg);
      });
    }
  }, [isSignedIn, user, onNoAccount]);
}

export default useSyncClerkUser;
