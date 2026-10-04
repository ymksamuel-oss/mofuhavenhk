"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export type CustomerAuthUser = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
};

type CustomerAuthContextValue = {
  user: CustomerAuthUser | null;
  ready: boolean;
};

const CustomerAuthContext = createContext<CustomerAuthContextValue>({ user: null, ready: false });

function toCustomerUser(user: User | null | undefined): CustomerAuthUser | null {
  if (!user) return null;
  const metadata = user.user_metadata ?? {};
  return {
    id: user.id,
    email: user.email ?? "",
    displayName: String(metadata.display_name ?? metadata.full_name ?? metadata.name ?? "").slice(0, 100),
    avatarUrl: String(metadata.avatar_url ?? metadata.picture ?? "").slice(0, 1000),
  };
}

export function CustomerAuthProvider({
  initialUser,
  children,
}: {
  initialUser: CustomerAuthUser | null;
  children: ReactNode;
}) {
  const [user, setUser] = useState<CustomerAuthUser | null>(initialUser);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(initialUser);
    setReady(true);
  }, [initialUser?.id, initialUser?.email, initialUser?.displayName, initialUser?.avatarUrl]);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined;
    try {
      const client = getSupabaseBrowserClient();
      if (!client) {
        setReady(true);
        return;
      }
      const result = client.auth.onAuthStateChange((_event, session) => {
        setUser(toCustomerUser(session?.user));
        setReady(true);
      });
      subscription = result.data?.subscription;
    } catch {
      setUser((current) => current ?? null);
      setReady(true);
    }
    setReady(true);
    return () => subscription?.unsubscribe();
  }, []);

  const value = useMemo(() => ({ user, ready }), [user, ready]);
  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

export function useCustomerAuth() {
  return useContext(CustomerAuthContext);
}
