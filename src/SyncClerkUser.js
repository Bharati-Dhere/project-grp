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
          console.log("Clerk user synced to backend:", data);
        })
        .catch(err => {
          console.error("Error syncing Clerk user to backend:", err);
        });
    }
  }, [isSignedIn, user]);

  return null;
}
