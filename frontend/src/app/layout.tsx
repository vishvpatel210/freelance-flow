import type { Metadata } from "next";
import "./globals.css";
import DashboardLayout from "@/components/DashboardLayout";

export const metadata: Metadata = {
  title: "FreelanceFlow — Freelance Management Platform",
  description: "Modern Freelancer Management Platform for Clients, Projects, Tasks, Deliverables, and Payments."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  );
}
