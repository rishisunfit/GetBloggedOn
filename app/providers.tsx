"use client";

import { DialogProvider } from "@/contexts/DialogContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DialogProvider>{children}</DialogProvider>
  );
}
