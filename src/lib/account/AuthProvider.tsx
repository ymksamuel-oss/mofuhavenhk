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

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerAuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    let client: ReturnType<typeof getSupabaseBrowserClient>;
    try {
      client = getSupabaseBrowserClient();
    } catch {
      setReady(true);
      return;
    }
    if (!client) {
      setReady(true);
      return;
    }

    const { data } = client.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(toCustomerUser(session?.user));
      setReady(true);
    });

    // Restore the browser's persisted session without making every public page
    // perform a server-side auth lookup during rendering.
    void client.auth.getSession().then(({ data: sessionData, error }) => {
      if (!active) return;
      setUser(error ? null : toCustomerUser(sessionData.session?.user));
      setReady(true);
    }).catch(() => {
      if (!active) return;
      setUser(null);
      setReady(true);
    });

    return () => {
      active = false;
      data.subscription?.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({ user, ready }), [user, ready]);
  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

export function useCustomerAuth() {
  return useContext(CustomerAuthContext);
}
