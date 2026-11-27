import type { Metadata } from "next";
import StudioLayout from "./StudioLayout";
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudioLayout>{children}</StudioLayout>;
}
