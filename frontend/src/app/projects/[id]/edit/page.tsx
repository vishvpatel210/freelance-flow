"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Client } from "@/types";
import { useToast } from "@/components/ToastContext";
import PageHeader from "@/components/PageHeader";
import { FormInput, FormTextarea } from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const router = useRouter();
  const { addToast } = useToast();

  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    client: "",
    budget: "",
    status: "pending",
    startDate: "",
    deadline: ""
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [project, clientsList] = await Promise.all([
          api.projects.getById(projectId),
          api.clients.getAll().catch(() => [])
        ]);

        setClients(clientsList);

        const clientId = typeof project.client === "object" ? project.client?._id : project.client;

        setFormData({
          title: project.title || "",
          description: project.description || "",
          client: clientId || "",
          budget: project.budget !== undefined ? String(project.budget) : "",
          status: project.status || "pending",
          startDate: project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : "",
          deadline: project.deadline ? new Date(project.deadline).toISOString().split("T")[0] : ""
        });
      } catch (err: any) {
        console.error("Error loading project:", err);
        setError(err.message || "Failed to load project details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.title.trim()) errs.title = "Project title is required";
    if (!formData.description.trim()) errs.description = "Project description is required";
    if (!formData.client) errs.client = "Please select a client";
    if (formData.budget === "" || isNaN(Number(formData.budget)) || Number(formData.budget) < 0) {
      errs.budget = "Please enter a valid non-negative budget amount";
    }
    if (!formData.startDate) errs.startDate = "Start date is required";
    if (!formData.deadline) errs.deadline = "Deadline is required";
    if (formData.startDate && formData.deadline && formData.deadline < formData.startDate) {
      errs.deadline = "Deadline cannot be before the start date";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      await api.projects.update(projectId, {
        title: formData.title,
        description: formData.description,
        client: formData.client,
        budget: Number(formData.budget),
        status: formData.status as any,
        startDate: formData.startDate,
        deadline: formData.deadline
      });
      addToast("Project updated successfully!", "success");
      router.push(`/projects/${projectId}`);
    } catch (err: any) {
      console.error("Error updating project:", err);
      addToast(err.message || "Failed to update project", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading project details..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  const clientOptions = clients.map((c) => ({
    label: `${c.name}${c.company ? ` (${c.company})` : ""}`,
    value: c._id
  }));

  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "in-progress" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title={`Edit ${formData.title || "Project"}`}
        subtitle="Update project scope, deadline, budget, and status."
        backHref={`/projects/${projectId}`}
      />

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <FormInput
          label="Project Title"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          error={errors.title}
        />

        <FormTextarea
          label="Project Description"
          required
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          error={errors.description}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormSelect
            label="Client"
            required
            options={clientOptions}
            value={formData.client}
            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
            error={errors.client}
          />
          <FormInput
            label="Budget (USD)"
            type="number"
            min="0"
            step="any"
            required
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            error={errors.budget}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <FormSelect
            label="Project Status"
            required
            options={statusOptions}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          />
          <FormInput
            label="Start Date"
            type="date"
            required
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            error={errors.startDate}
          />
          <FormInput
            label="Deadline"
            type="date"
            required
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            error={errors.deadline}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => router.push(`/projects/${projectId}`)}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            {submitting ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

