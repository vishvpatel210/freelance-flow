"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  User,
  Calendar,
  DollarSign,
  CheckSquare,
  PackageCheck,
  CreditCard,
  Edit2,
  Trash2,
  Plus,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Clock
} from "lucide-react";
import api from "@/lib/api";
import { Project, Task, Deliverable, Payment } from "@/types";
import { useToast } from "@/components/ToastContext";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const router = useRouter();
  const { addToast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [activeTab, setActiveTab] = useState<"tasks" | "deliverables" | "payments">("tasks");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [projData, tasksData, delivData, payData] = await Promise.all([
        api.projects.getById(projectId),
        api.tasks.getAll({ project: projectId }).catch(() => []),
        api.deliverables.getAll({ project: projectId }).catch(() => []),
        api.payments.getAll({ project: projectId }).catch(() => [])
      ]);
      setProject(projData);
      setTasks(tasksData);
      setDeliverables(delivData);
      setPayments(payData);
    } catch (err: any) {
      console.error("Error loading project details:", err);
      const msg = err.message || "Failed to load project details";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const handleDeleteProject = async () => {
    if (!project) return;
    try {
      setDeleting(true);
      await api.projects.delete(project._id);
      addToast(`Project "${project.title}" deleted successfully`, "success");
      router.push("/projects");
    } catch (err: any) {
      console.error("Error deleting project:", err);
      addToast(err.message || "Failed to delete project", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleTaskStatus = async (task: Task) => {
    const nextStatus = task.status === "completed" ? "in-progress" : "completed";
    try {
      const updated = await api.tasks.update(task._id, { status: nextStatus as any });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? updated : t)));
      addToast(`Task marked as ${nextStatus}`, "success");
    } catch (err: any) {
      console.error("Error updating task status:", err);
      addToast(err.message || "Failed to update task", "error");
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading project details..." />;
  }

  if (error || !project) {
    return (
      <ErrorState
        message={error || "Project not found"}
        onRetry={fetchProjectData}
      />
    );
  }

  const clientObj = typeof project.client === "object" ? project.client : null;

  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const completedTasksCount = tasks.filter((t) => t.status === "completed").length;
  const taskProgress = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title={project.title}
        subtitle={`Contract Details • Client: ${clientObj?.name || "Client"}`}
        backHref="/projects"
      >
        <Link
          href={`/projects/${project._id}/edit`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-all"
        >
          <Edit2 className="w-3.5 h-3.5" /> Edit Project
        </Link>
        <button
          onClick={() => setDeleteModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 text-xs font-semibold border border-rose-200 shadow-xs transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </PageHeader>

      {/* Main Details & Metrics Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Scope & Client Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Project Scope & Overview
            </span>
            <StatusBadge status={project.status} />
          </div>

          <p className="text-sm text-slate-700 leading-relaxed">
            {project.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Client
              </span>
              {clientObj ? (
                <Link
                  href={`/clients/${clientObj._id}`}
                  className="font-bold text-slate-900 text-sm hover:text-indigo-600 flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {clientObj.name}
                </Link>
              ) : (
                <span className="text-sm text-slate-800 font-semibold">—</span>
              )}
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Timeline
              </span>
              <span className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {project.startDate ? new Date(project.startDate).toLocaleDateString() : "—"} &rarr;{" "}
                {project.deadline ? new Date(project.deadline).toLocaleDateString() : "—"}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Contract Budget
              </span>
              <span className="text-base font-bold text-slate-900">
                ${Number(project.budget || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Progress & Financial Health */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Task Velocity
              </span>
              <span className="text-xs font-bold text-emerald-600">{taskProgress}% Completed</span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
              <div
                style={{ width: `${taskProgress}%` }}
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              />
            </div>
            <p className="text-xs text-slate-500">
              {completedTasksCount} of {tasks.length} tasks completed
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Payment Invoicing
            </span>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xs text-slate-600">Collected:</span>
              <span className="text-sm font-bold text-slate-900">
                ${totalPaid.toLocaleString()} / ${Number(project.budget || 0).toLocaleString()}
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                style={{
                  width: `${Math.min(
                    100,
                    project.budget > 0 ? Math.round((totalPaid / project.budget) * 100) : 0
                  )}%`
                }}
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 flex items-center gap-6">
        <button
          onClick={() => setActiveTab("tasks")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "tasks"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          Tasks ({tasks.length})
        </button>
        <button
          onClick={() => setActiveTab("deliverables")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "deliverables"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          Deliverables ({deliverables.length})
        </button>
        <button
          onClick={() => setActiveTab("payments")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "payments"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Payments ({payments.length})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "tasks" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Project Tasks</h3>
            <Link
              href={`/tasks/new`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add Task
            </Link>
          </div>

          {tasks.length === 0 ? (
            <EmptyState
              title="No tasks created yet"
              description="Break this project down into actionable milestones."
              actionLabel="Add Task"
              actionHref="/tasks/new"
              icon={CheckSquare}
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/70 p-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => handleToggleTaskStatus(task)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        task.status === "completed"
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "border-slate-300 hover:border-indigo-600"
                      }`}
                    >
                      {task.status === "completed" && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          task.status === "completed"
                            ? "line-through text-slate-400"
                            : "text-slate-900"
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.assignedTo && (
                        <p className="text-[11px] text-slate-400">Assigned: {task.assignedTo}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={task.priority} type="priority" />
                    <StatusBadge status={task.status} />
                    <Link
                      href={`/tasks/${task._id}/edit`}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "deliverables" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Project Deliverables</h3>
            <Link
              href="/deliverables/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Submit Deliverable
            </Link>
          </div>

          {deliverables.length === 0 ? (
            <EmptyState
              title="No deliverables submitted"
              description="Upload files or submit project assets for client approval."
              actionLabel="Submit Deliverable"
              actionHref="/deliverables/new"
              icon={PackageCheck}
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {deliverables.map((deliv) => (
                <div
                  key={deliv._id}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/70 p-2 rounded-xl transition-colors"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{deliv.title}</h4>
                    {deliv.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{deliv.description}</p>
                    )}
                    {deliv.fileUrl && (
                      <a
                        href={deliv.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-600 hover:underline inline-flex items-center gap-1 mt-1 font-medium"
                      >
                        <ExternalLink className="w-3 h-3" /> View Asset File
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={deliv.status} />
                    <Link
                      href={`/deliverables/${deliv._id}/edit`}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "payments" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Project Payments</h3>
            <Link
              href="/payments/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Record Payment
            </Link>
          </div>

          {payments.length === 0 ? (
            <EmptyState
              title="No payments recorded"
              description="Track invoices and milestone settlements for this project."
              actionLabel="Record Payment"
              actionHref="/payments/new"
              icon={CreditCard}
            />
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Method</th>
                    <th className="pb-3 font-semibold">Transaction ID</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 text-right font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 pr-2 font-bold text-slate-900">
                        ${Number(payment.amount || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-2 text-xs text-slate-600">
                        {payment.paymentMethod || "Bank"}
                      </td>
                      <td className="py-3.5 px-2 text-xs font-mono text-slate-500">
                        {payment.transactionId || "—"}
                      </td>
                      <td className="py-3.5 px-2 text-xs text-slate-500">
                        {payment.paymentDate
                          ? new Date(payment.paymentDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="py-3.5 pl-2 text-right">
                        <StatusBadge status={payment.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        itemName={project.title}
        message="Are you sure you want to delete this project? Associated tasks and deliverables will also be removed."
        loading={deleting}
      />
    </div>
  );
}

