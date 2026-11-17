"use client";

import React, { useState } from "react";
import {
  Settings,
  Server,
  Globe,
  Shield,
  CheckCircle2,
  RefreshCw,
  Database
} from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/ToastContext";
import PageHeader from "@/components/PageHeader";

export default function SettingsPage() {
  const [testingApi, setTestingApi] = useState(false);
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleTestConnection = async () => {
    try {
      setTestingApi(true);
      setApiStatus(null);
      const res = await api.dashboard.getStats();
      if (res.success) {
        setApiStatus("Connected: API responding normally with live MongoDB Atlas connection.");
        addToast("Backend connection verified successfully!", "success");
      }
    } catch (err: any) {
      console.error("API test error:", err);
      setApiStatus(`Connection error: ${err.message || "Failed to reach API server"}`);
      addToast(err.message || "API connection failed", "error");
    } finally {
      setTestingApi(false);
    }
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage workspace preferences, API endpoints, and platform parameters."
      />

      {/* Backend API & Database Configuration */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Backend API Endpoint</h3>
            <p className="text-xs text-slate-500">Configured API gateway and database connection</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
              Active Base URL
            </span>
            <code className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
              {apiUrl}
            </code>
          </div>
          <button
            onClick={handleTestConnection}
            disabled={testingApi}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingApi ? "animate-spin" : ""}`} />
            {testingApi ? "Testing..." : "Test Health"}
          </button>
        </div>

        {apiStatus && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-medium ${
              apiStatus.includes("Connected")
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {apiStatus}
          </div>
        )}
      </div>

      {/* Workspace Information */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Workspace Information</h3>
            <p className="text-xs text-slate-500">Platform and system version specs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Platform
            </span>
            <span className="text-sm font-bold text-slate-900">FreelanceFlow Enterprise</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Framework & Environment
            </span>
            <span className="text-sm font-bold text-slate-900">Next.js App Router (TypeScript)</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Database
            </span>
            <span className="text-sm font-bold text-slate-900">MongoDB with Mongoose ORM</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Currency
            </span>
            <span className="text-sm font-bold text-slate-900">USD ($)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

