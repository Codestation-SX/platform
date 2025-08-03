"use client";
import { signOut, useSession } from "next-auth/react";
import { useCallback, useEffect } from "react";
export default function Logout() {
  const { status } = useSession();
  const redirectUrl = "/";

  const processLogout = useCallback(() => {
    if (status === "authenticated") {
      signOut({
        redirect: true,
        callbackUrl: "/",
      });
    } else if (status === "unauthenticated") {
      location.href = redirectUrl;
    }
  }, [redirectUrl, status]);

  useEffect(() => {
    processLogout();
  }, [processLogout]);

  return null;
}
