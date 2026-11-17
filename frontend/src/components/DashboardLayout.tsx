"use client";

import React, { useState, ReactNode } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { ToastProvider } from "./ToastContext";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            collapsed ? "lg:pl-20" : "lg:pl-64"
          }`}
        >
          <Navbar
            onToggleMobile={() => setMobileOpen((prev) => !prev)}
            collapsed={collapsed}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}

export default DashboardLayout;

