"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  PackageCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Calendar,
  CheckCircle,
  Clock,
  RefreshCw,
  FolderKanban,
  FileText
} from "lucide-react";
import api from "@/lib/api";
import { Deliverable, Project } from "@/types";
import { useToast } from "@/components/ToastContext";
import PageHeader from "@/components/PageHeader";
import SearchInput from "@/components/SearchInput";
import FilterDropdown from "@/components/FilterDropdown";
import StatusBadge from "@/components/StatusBadge";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";

export default function DeliverablesPage() {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deliverableToDelete, setDeliverableToDelete] = useState<Deliverable | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { addToast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [delivData, projectsData] = await Promise.all([
        api.deliverables.getAll(),
        api.projects.getAll().catch(() => [])
      ]);
      setDeliverables(delivData);
      setProjects(projectsData);
    } catch (err: any) {
      console.error("Error fetching deliverables:", err);
      const msg = err.message || "Failed to load deliverables";
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
    if (!deliverableToDelete) return;
    try {
      setDeleting(true);
      await api.deliverables.delete(deliverableToDelete._id);
      addToast(`Deliverable "${deliverableToDelete.title}" deleted successfully`, "success");
      setDeliverables((prev) => prev.filter((d) => d._id !== deliverableToDelete._id));
      setDeleteModalOpen(false);
      setDeliverableToDelete(null);
    } catch (err: any) {
      console.error("Error deleting deliverable:", err);
      addToast(err.message || "Failed to delete deliverable", "error");
    } finally {
      setDeleting(false);
    }
  };

  const filteredDeliverables = deliverables.filter((d) => {
    const q = search.toLowerCase();
    const matchesSearch =
      d.title.toLowerCase().includes(q) ||
      (d.description && d.description.toLowerCase().includes(q));

    const matchesStatus = statusFilter === "all" || d.status === statusFilter;

    const projectId = typeof d.project === "object" ? d.project?._id : d.project;
    const matchesProject = projectFilter === "all" || projectId === projectFilter;

    return matchesSearch && matchesStatus && matchesProject;
  });

  const projectOptions = [
    { label: "All Projects", value: "all" },
    ...projects.map((p) => ({ label: p.title, value: p._id }))
  ];

  const statusOptions = [
    { label: "All Statuses", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Submitted", value: "submitted" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deliverables"
        subtitle="Manage client review assets, approval statuses, and delivered work."
        actionLabel="Submit Deliverable"
        actionHref="/deliverables/new"
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search deliverables by title or description..."
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
        <LoadingSpinner text="Loading deliverables..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : filteredDeliverables.length === 0 ? (
        <EmptyState
          title={search || projectFilter !== "all" || statusFilter !== "all" ? "No matching deliverables found" : "No deliverables submitted yet"}
          description={
            search || projectFilter !== "all" || statusFilter !== "all"
              ? "Try adjusting your filters or search keywords."
              : "Upload or submit your first client deliverable for approval."
          }
          actionLabel={search || projectFilter !== "all" || statusFilter !== "all" ? undefined : "Submit Deliverable"}
          actionHref={search || projectFilter !== "all" || statusFilter !== "all" ? undefined : "/deliverables/new"}
          icon={PackageCheck}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Deliverable</th>
                  <th className="py-3.5 px-6">Project</th>
                  <th className="py-3.5 px-6">Resource / File</th>
                  <th className="py-3.5 px-6">Due Date</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDeliverables.map((deliv) => {
                  const projectObj = typeof deliv.project === "object" ? deliv.project : null;
                  return (
                    <tr key={deliv._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-semibold text-slate-900 block">
                          {deliv.title}
                        </span>
                        {deliv.description && (
                          <p className="text-xs text-slate-500 truncate max-w-xs mt-0.5">
                            {deliv.description}
                          </p>
                        )}
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
                      <td className="py-4 px-6 text-xs">
                        {deliv.fileUrl ? (
                          <a
                            href={deliv.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Open Asset
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">No link</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {deliv.dueDate ? new Date(deliv.dueDate).toLocaleDateString() : "—"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={deliv.status} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/deliverables/${deliv._id}/edit`}
                            title="Edit Deliverable"
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setDeliverableToDelete(deliv);
                              setDeleteModalOpen(true);
                            }}
                            title="Delete Deliverable"
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
          setDeliverableToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Deliverable"
        itemName={deliverableToDelete?.title}
        message="Are you sure you want to delete this deliverable submission?"
        loading={deleting}
      />
    </div>
  );
}

