"use client";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div data-admin-layout="true" className="min-h-screen w-full overflow-x-clip">{children}</div>;
}
