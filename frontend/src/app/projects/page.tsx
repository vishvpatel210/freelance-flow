"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  DollarSign,
  User,
  RefreshCw,
  Clock
} from "lucide-react";
import api from "@/lib/api";
import { Project, Client } from "@/types";
import { useToast } from "@/components/ToastContext";
import PageHeader from "@/components/PageHeader";
import SearchInput from "@/components/SearchInput";
import FilterDropdown from "@/components/FilterDropdown";
import StatusBadge from "@/components/StatusBadge";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { addToast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [projectsData, clientsData] = await Promise.all([
        api.projects.getAll(),
        api.clients.getAll().catch(() => [])
      ]);
      setProjects(projectsData);
      setClients(clientsData);
    } catch (err: any) {
      console.error("Error fetching projects:", err);
      const msg = err.message || "Failed to load projects";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    try {
      setDeleting(true);
      await api.projects.delete(projectToDelete._id);
      addToast(`Project "${projectToDelete.title}" deleted successfully`, "success");
      setProjects((prev) => prev.filter((p) => p._id !== projectToDelete._id));
      setDeleteModalOpen(false);
      setProjectToDelete(null);
    } catch (err: any) {
      console.error("Error deleting project:", err);
      addToast(err.message || "Failed to delete project", "error");
    } finally {
      setDeleting(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q));

    const matchesStatus = statusFilter === "all" || p.status === statusFilter;

    const clientId = typeof p.client === "object" ? p.client?._id : p.client;
    const matchesClient = clientFilter === "all" || clientId === clientFilter;

    return matchesSearch && matchesStatus && matchesClient;
  });

  const clientOptions = [
    { label: "All Clients", value: "all" },
    ...clients.map((c) => ({ label: c.name, value: c._id }))
  ];

  const statusOptions = [
    { label: "All Statuses", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "in-progress" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        subtitle="Track delivery, budgets, deadlines, and project milestones."
        actionLabel="New Project"
        actionHref="/projects/new"
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search projects by title or description..."
          className="w-full lg:w-72"
        />

        <div className="flex flex-wrap items-center gap-3">
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
          />
          <FilterDropdown
            label="Client"
            value={clientFilter}
            onChange={setClientFilter}
            options={clientOptions}
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
        <LoadingSpinner text="Loading projects..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          title={search || statusFilter !== "all" || clientFilter !== "all" ? "No matching projects" : "No projects created yet"}
          description={
            search || statusFilter !== "all" || clientFilter !== "all"
              ? "Try adjusting your filters or search keywords."
              : "Create your first project to start tracking deliverables and tasks."
          }
          actionLabel={search || statusFilter !== "all" || clientFilter !== "all" ? undefined : "Create Project"}
          actionHref={search || statusFilter !== "all" || clientFilter !== "all" ? undefined : "/projects/new"}
          icon={Briefcase}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Project</th>
                  <th className="py-3.5 px-6">Client</th>
                  <th className="py-3.5 px-6">Budget</th>
                  <th className="py-3.5 px-6">Deadline</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.map((project) => {
                  const clientObj = typeof project.client === "object" ? project.client : null;
                  return (
                    <tr key={project._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <Link
                          href={`/projects/${project._id}`}
                          className="font-semibold text-slate-900 hover:text-indigo-600 block transition-colors"
                        >
                          {project.title}
                        </Link>
                        {project.description && (
                          <p className="text-xs text-slate-500 truncate max-w-xs mt-0.5">
                            {project.description}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600">
                        {clientObj ? (
                          <Link
                            href={`/clients/${clientObj._id}`}
                            className="font-medium text-slate-700 hover:text-indigo-600 inline-flex items-center gap-1.5"
                          >
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {clientObj.name}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs font-bold text-slate-900">
                        ${Number(project.budget || 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {project.deadline
                            ? new Date(project.deadline).toLocaleDateString()
                            : "—"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/projects/${project._id}`}
                            title="View Project"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/projects/${project._id}/edit`}
                            title="Edit Project"
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setProjectToDelete(project);
                              setDeleteModalOpen(true);
                            }}
                            title="Delete Project"
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
          setProjectToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Project"
        itemName={projectToDelete?.title}
        message="Are you sure you want to delete this project? Associated tasks, deliverables, and payment links will be affected."
        loading={deleting}
      />
    </div>
  );
}

