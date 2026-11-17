"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Project } from "@/types";
import { useToast } from "@/components/ToastContext";
import PageHeader from "@/components/PageHeader";
import { FormInput, FormTextarea } from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";

export default function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const taskId = resolvedParams.id;
  const router = useRouter();
  const { addToast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project: "",
    assignedTo: "",
    priority: "medium",
    status: "pending",
    dueDate: ""
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [task, projectsList] = await Promise.all([
          api.tasks.getById(taskId),
          api.projects.getAll().catch(() => [])
        ]);

        setProjects(projectsList);

        const projectId = typeof task.project === "object" ? task.project?._id : task.project;

        setFormData({
          title: task.title || "",
          description: task.description || "",
          project: projectId || "",
          assignedTo: task.assignedTo || "",
          priority: task.priority || "medium",
          status: task.status || "pending",
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
        });
      } catch (err: any) {
        console.error("Error loading task:", err);
        setError(err.message || "Failed to load task details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [taskId]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.title.trim()) errs.title = "Task title is required";
    if (!formData.project) errs.project = "Please select a project";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      await api.tasks.update(taskId, {
        title: formData.title,
        description: formData.description,
        project: formData.project,
        assignedTo: formData.assignedTo,
        priority: formData.priority as any,
        status: formData.status as any,
        dueDate: formData.dueDate ? formData.dueDate : undefined
      });
      addToast("Task updated successfully!", "success");
      router.push("/tasks");
    } catch (err: any) {
      console.error("Error updating task:", err);
      addToast(err.message || "Failed to update task", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading task..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  const projectOptions = projects.map((p) => ({
    label: p.title,
    value: p._id
  }));

  const priorityOptions = [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" }
  ];

  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "in-progress" },
    { label: "Completed", value: "completed" }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title={`Edit ${formData.title || "Task"}`}
        subtitle="Update task assignment, priority, and completion status."
        backHref="/tasks"
      />

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <FormInput
          label="Task Title"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          error={errors.title}
        />

        <FormTextarea
          label="Task Description"
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormSelect
            label="Associated Project"
            required
            options={projectOptions}
            value={formData.project}
            onChange={(e) => setFormData({ ...formData, project: e.target.value })}
            error={errors.project}
          />
          <FormInput
            label="Assigned To"
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <FormSelect
            label="Priority"
            options={priorityOptions}
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          />
          <FormSelect
            label="Status"
            options={statusOptions}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          />
          <FormInput
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => router.push("/tasks")}
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
