"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Plus,
  Users,
  Briefcase,
  CheckSquare,
  PackageCheck,
  CreditCard,
  ChevronDown,
  Bell,
  Search,
  User,
  Sliders
} from "lucide-react";

interface NavbarProps {
  onToggleMobile: () => void;
  collapsed: boolean;
}

export function Navbar({ onToggleMobile, collapsed }: NavbarProps) {
  const pathname = usePathname();
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setQuickMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPageTitle = () => {
    if (pathname === "/" || pathname === "/dashboard") return "Dashboard";
    if (pathname === "/clients") return "Clients";
    if (pathname === "/clients/new") return "Add Client";
    if (pathname.includes("/clients/") && pathname.endsWith("/edit")) return "Edit Client";
    if (pathname.includes("/clients/")) return "Client Details";

    if (pathname === "/projects") return "Projects";
    if (pathname === "/projects/new") return "New Project";
    if (pathname.includes("/projects/") && pathname.endsWith("/edit")) return "Edit Project";
    if (pathname.includes("/projects/")) return "Project Details";

    if (pathname === "/tasks") return "Tasks";
    if (pathname === "/tasks/new") return "New Task";
    if (pathname.includes("/tasks/") && pathname.endsWith("/edit")) return "Edit Task";

    if (pathname === "/deliverables") return "Deliverables";
    if (pathname === "/deliverables/new") return "New Deliverable";
    if (pathname.includes("/deliverables/") && pathname.endsWith("/edit")) return "Edit Deliverable";

    if (pathname === "/payments") return "Payments";
    if (pathname === "/payments/new") return "Record Payment";
    if (pathname.includes("/payments/") && pathname.endsWith("/edit")) return "Edit Payment";

    if (pathname === "/settings") return "Settings";

    return "FreelanceFlow";
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between transition-all">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Workspace /</span>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Bar UI */}
        <div className="relative hidden md:flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search workspace..."
            className="w-48 lg:w-64 pl-9 pr-4 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Notifications Icon & Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white"></span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 text-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Notifications</span>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                  Live System
                </span>
              </div>
              <div className="py-3 space-y-2.5">
                <div className="text-xs">
                  <p className="font-semibold text-slate-800">Workspace connected</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    MongoDB database and API backend are in sync.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Action "+ New" Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setQuickMenuOpen(!quickMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Create</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                quickMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {quickMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50 text-slate-700">
              <Link
                href="/clients/new"
                onClick={() => setQuickMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>New Client</span>
              </Link>
              <Link
                href="/projects/new"
                onClick={() => setQuickMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
              >
                <Briefcase className="w-3.5 h-3.5 text-sky-600" />
                <span>New Project</span>
              </Link>
              <Link
                href="/tasks/new"
                onClick={() => setQuickMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
              >
                <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>New Task</span>
              </Link>
              <Link
                href="/deliverables/new"
                onClick={() => setQuickMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
              >
                <PackageCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>New Deliverable</span>
              </Link>
              <div className="my-1 border-t border-slate-100" />
              <Link
                href="/payments/new"
                onClick={() => setQuickMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5 text-rose-600" />
                <span>Record Payment</span>
              </Link>
            </div>
          )}
        </div>

        {/* User profile avatar */}
        <div className="flex items-center pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xs">
            JD
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;

