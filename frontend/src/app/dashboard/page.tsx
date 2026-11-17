"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Briefcase,
  CheckSquare,
  DollarSign,
  Clock,
  ArrowUpRight,
  Plus,
  RefreshCw,
  ExternalLink,
  Calendar,
  AlertCircle
} from "lucide-react";
import api from "@/lib/api";
import { DashboardStats, Project, Payment } from "@/types";
import { useToast } from "@/components/ToastContext";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { ProjectStatusChart, TaskProgressChart, RevenueChart } from "@/components/Charts";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.dashboard.getStats();
      if (res.success && res.stats) {
        setStats(res.stats);
      }
    } catch (err: any) {
      console.error("Dashboard stats fetch error:", err);
      const msg = err.message || "Failed to load dashboard metrics";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Fetching workspace analytics..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchStats} />;
  }

  const s = stats || {
    totalClients: 0,
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    totalRevenue: 0,
    pendingPayments: { amount: 0, count: 0 },
    projectStatusStats: { pending: 0, "in-progress": 0, completed: 0, cancelled: 0 },
    taskStatusStats: { pending: 0, "in-progress": 0, completed: 0 },
    recentProjects: [],
    recentPayments: []
  };

  const activeProjectsCount = s.projectStatusStats?.["in-progress"] || 0;
  const completedProjectsCount = s.projectStatusStats?.completed || 0;

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time activity across your clients, projects, tasks, and finances.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> New Project
          </Link>
          <Link
            href="/tasks/new"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> New Task
          </Link>
          <Link
            href="/payments/new"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 shadow-xs transition-all"
          >
            <DollarSign className="w-3.5 h-3.5" /> Record Payment
          </Link>
          <button
            onClick={fetchStats}
            title="Refresh Metrics"
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-200 transition-colors shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`$${(s.totalRevenue || 0).toLocaleString()}`}
          subtitle="From successful payments"
          icon={DollarSign}
          iconColor="emerald"
          trend="Paid Invoices"
          trendType="positive"
        />
        <StatCard
          title="Pending Payments"
          value={`$${(s.pendingPayments?.amount || 0).toLocaleString()}`}
          subtitle={`${s.pendingPayments?.count || 0} invoice(s) pending`}
          icon={Clock}
          iconColor="amber"
          trend="Awaiting"
          trendType="neutral"
        />
        <StatCard
          title="Projects Overview"
          value={s.totalProjects || 0}
          subtitle={`${activeProjectsCount} active • ${completedProjectsCount} completed`}
          icon={Briefcase}
          iconColor="indigo"
          trend={`${s.totalClients || 0} Clients`}
          trendType="positive"
        />
        <StatCard
          title="Tasks Completed"
          value={`${s.completedTasks || 0} / ${s.totalTasks || 0}`}
          subtitle={`${s.pendingTasks || 0} pending • ${s.inProgressTasks || 0} in progress`}
          icon={CheckSquare}
          iconColor="sky"
          trend="Tasks Progress"
          trendType="positive"
        />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Pipeline Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Project Status</h3>
              <p className="text-xs text-slate-500">Pipeline distribution</p>
            </div>
            <Link
              href="/projects"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex-1 min-h-[170px]">
            <ProjectStatusChart stats={s.projectStatusStats || {}} />
          </div>
        </div>

        {/* Task Velocity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Task Completion</h3>
              <p className="text-xs text-slate-500">Milestone velocity</p>
            </div>
            <Link
              href="/tasks"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex-1 min-h-[170px]">
            <TaskProgressChart stats={s.taskStatusStats || {}} />
          </div>
        </div>

        {/* Revenue Health */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Revenue Flow</h3>
              <p className="text-xs text-slate-500">Realized vs. Pending</p>
            </div>
            <Link
              href="/payments"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex-1 min-h-[170px]">
            <RevenueChart
              totalRevenue={s.totalRevenue || 0}
              pendingAmount={s.pendingPayments?.amount || 0}
            />
          </div>
        </div>
      </div>

      {/* Recent Projects and Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Projects</h3>
              <p className="text-xs text-slate-500">Active and upcoming client projects</p>
            </div>
            <Link
              href="/projects"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View all
            </Link>
          </div>

          {(!s.recentProjects || s.recentProjects.length === 0) ? (
            <EmptyState
              title="No projects yet"
              description="Create your first client project to get started."
              actionLabel="Create Project"
              actionHref="/projects/new"
            />
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 font-semibold">Project</th>
                    <th className="pb-3 font-semibold">Client</th>
                    <th className="pb-3 font-semibold">Budget</th>
                    <th className="pb-3 text-right font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {s.recentProjects.map((p: Project) => {
                    const clientObj = typeof p.client === "object" ? p.client : null;
                    return (
                      <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 pr-2">
                          <Link
                            href={`/projects/${p._id}`}
                            className="font-medium text-slate-900 hover:text-indigo-600 block truncate max-w-[150px]"
                          >
                            {p.title}
                          </Link>
                        </td>
                        <td className="py-3 px-2 text-xs text-slate-500 truncate max-w-[120px]">
                          {clientObj?.name || "—"}
                        </td>
                        <td className="py-3 px-2 text-xs font-semibold text-slate-900">
                          ${Number(p.budget || 0).toLocaleString()}
                        </td>
                        <td className="py-3 pl-2 text-right">
                          <StatusBadge status={p.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Payments Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Payments</h3>
              <p className="text-xs text-slate-500">Latest recorded invoices & payments</p>
            </div>
            <Link
              href="/payments"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View all
            </Link>
          </div>

          {(!s.recentPayments || s.recentPayments.length === 0) ? (
            <EmptyState
              title="No payments recorded"
              description="Record payments to monitor invoice collection."
              actionLabel="Record Payment"
              actionHref="/payments/new"
            />
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 font-semibold">Project / Client</th>
                    <th className="pb-3 font-semibold">Method</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 text-right font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {s.recentPayments.map((pay: Payment) => {
                    const projectObj = typeof pay.project === "object" ? pay.project : null;
                    const clientObj = typeof pay.client === "object" ? pay.client : null;
                    return (
                      <tr key={pay._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 pr-2">
                          <p className="font-medium text-slate-900 text-xs truncate max-w-[150px]">
                            {projectObj?.title || "Project"}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate max-w-[150px]">
                            {clientObj?.name || "Client"}
                          </p>
                        </td>
                        <td className="py-3 px-2 text-xs text-slate-500">
                          {pay.paymentMethod || "Bank"}
                        </td>
                        <td className="py-3 px-2 text-xs font-semibold text-slate-900">
                          ${Number(pay.amount || 0).toLocaleString()}
                        </td>
                        <td className="py-3 pl-2 text-right">
                          <StatusBadge status={pay.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

