import type { ReactNode } from "react";
import type { Metadata } from "next";
import SignalsShell from "./SignalsShell";

export const metadata: Metadata = {
  title: "Pippinway Signals",
  description: "Live crypto market analysis powered by PipSignal AI. Trade smarter. See the signals.",
};

export default function SignalsLayout({ children }: { children: ReactNode }) {
  return <SignalsShell>{children}</SignalsShell>;
}
