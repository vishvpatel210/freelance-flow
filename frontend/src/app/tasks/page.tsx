"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  RefreshCw,
  FolderKanban
} from "lucide-react";
import api from "@/lib/api";
import { Task, Project } from "@/types";
import { useToast } from "@/components/ToastContext";
import PageHeader from "@/components/PageHeader";
import SearchInput from "@/components/SearchInput";
import FilterDropdown from "@/components/FilterDropdown";
import StatusBadge from "@/components/StatusBadge";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { addToast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tasksData, projectsData] = await Promise.all([
        api.tasks.getAll(),
        api.projects.getAll().catch(() => [])
      ]);
      setTasks(tasksData);
      setProjects(projectsData);
    } catch (err: any) {
      console.error("Error fetching tasks:", err);
      const msg = err.message || "Failed to load tasks";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (task: Task) => {
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

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    try {
      setDeleting(true);
      await api.tasks.delete(taskToDelete._id);
      addToast(`Task "${taskToDelete.title}" deleted successfully`, "success");
      setTasks((prev) => prev.filter((t) => t._id !== taskToDelete._id));
      setDeleteModalOpen(false);
      setTaskToDelete(null);
    } catch (err: any) {
      console.error("Error deleting task:", err);
      addToast(err.message || "Failed to delete task", "error");
    } finally {
      setDeleting(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const q = search.toLowerCase();
    const matchesSearch =
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.assignedTo && t.assignedTo.toLowerCase().includes(q));

    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;

    const projectId = typeof t.project === "object" ? t.project?._id : t.project;
    const matchesProject = projectFilter === "all" || projectId === projectFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesProject;
  });

  const projectOptions = [
    { label: "All Projects", value: "all" },
    ...projects.map((p) => ({ label: p.title, value: p._id }))
  ];

  const statusOptions = [
    { label: "All Statuses", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "in-progress" },
    { label: "Completed", value: "completed" }
  ];

  const priorityOptions = [
    { label: "All Priorities", value: "all" },
    { label: "High", value: "high" },
    { label: "Medium", value: "medium" },
    { label: "Low", value: "low" }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        subtitle="Manage daily action items, assigned deliverables, and task priorities."
        actionLabel="New Task"
        actionHref="/tasks/new"
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search tasks or assignees..."
          className="w-full lg:w-72"
        />

        <div className="flex flex-wrap items-center gap-3">
          <FilterDropdown
            label="Project"
            value={projectFilter}
            onChange={setProjectFilter}
            options={projectOptions}
          />
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
          />
          <FilterDropdown
            label="Priority"
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={priorityOptions}
          />
          <button
            onClick={fetchData}
            title="Refresh"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingSpinner text="Loading tasks..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          title={search || projectFilter !== "all" || statusFilter !== "all" || priorityFilter !== "all" ? "No matching tasks found" : "No tasks added yet"}
          description={
            search || projectFilter !== "all" || statusFilter !== "all" || priorityFilter !== "all"
              ? "Try adjusting your filters or search keywords."
              : "Create your first task to start tracking actionable progress."
          }
          actionLabel={search || projectFilter !== "all" || statusFilter !== "all" || priorityFilter !== "all" ? undefined : "Create Task"}
          actionHref={search || projectFilter !== "all" || statusFilter !== "all" || priorityFilter !== "all" ? undefined : "/tasks/new"}
          icon={CheckSquare}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Task</th>
                  <th className="py-3.5 px-6">Project</th>
                  <th className="py-3.5 px-6">Assigned To</th>
                  <th className="py-3.5 px-6">Priority</th>
                  <th className="py-3.5 px-6">Due Date</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map((task) => {
                  const projectObj = typeof task.project === "object" ? task.project : null;
                  return (
                    <tr key={task._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleStatus(task)}
                            title={task.status === "completed" ? "Mark incomplete" : "Mark completed"}
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                              task.status === "completed"
                                ? "bg-emerald-600 border-emerald-600 text-white"
                                : "border-slate-300 hover:border-indigo-600"
                            }`}
                          >
                            {task.status === "completed" && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>
                          <div>
                            <span
                              className={`font-semibold block ${
                                task.status === "completed"
                                  ? "line-through text-slate-400"
                                  : "text-slate-900"
                              }`}
                            >
                              {task.title}
                            </span>
                            {task.description && (
                              <p className="text-xs text-slate-400 truncate max-w-xs mt-0.5">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600">
                        {projectObj ? (
                          <Link
                            href={`/projects/${projectObj._id}`}
                            className="font-medium text-slate-700 hover:text-indigo-600 inline-flex items-center gap-1.5"
                          >
                            <FolderKanban className="w-3.5 h-3.5 text-slate-400" />
                            {projectObj.title}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600">
                        {task.assignedTo ? (
                          <span className="inline-flex items-center gap-1.5">
                            <User className="w-3 h-3 text-slate-400" />
                            {task.assignedTo}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={task.priority} type="priority" />
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/tasks/${task._id}/edit`}
                            title="Edit Task"
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setTaskToDelete(task);
                              setDeleteModalOpen(true);
                            }}
                            title="Delete Task"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationDialog
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        itemName={taskToDelete?.title}
        message="Are you sure you want to delete this task? This action cannot be undone."
        loading={deleting}
      />
    </div>
  );
}

