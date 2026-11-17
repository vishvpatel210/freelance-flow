"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Project, Task } from "@/types";
import { useToast } from "@/components/ToastContext";
import PageHeader from "@/components/PageHeader";
import { FormInput, FormTextarea } from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";

export default function EditDeliverablePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const deliverableId = resolvedParams.id;
  const router = useRouter();
  const { addToast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project: "",
    task: "",
    fileUrl: "",
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
        const [deliv, projectsList, tasksList] = await Promise.all([
          api.deliverables.getById(deliverableId),
          api.projects.getAll().catch(() => []),
          api.tasks.getAll().catch(() => [])
        ]);

        setProjects(projectsList);
        setTasks(tasksList);

        const projectId = typeof deliv.project === "object" ? deliv.project?._id : deliv.project;
        const taskId = typeof deliv.task === "object" ? deliv.task?._id : deliv.task;

        setFormData({
          title: deliv.title || "",
          description: deliv.description || "",
          project: projectId || "",
          task: taskId || "",
          fileUrl: deliv.fileUrl || "",
          status: deliv.status || "pending",
          dueDate: deliv.dueDate ? new Date(deliv.dueDate).toISOString().split("T")[0] : ""
        });
      } catch (err: any) {
        console.error("Error loading deliverable:", err);
        setError(err.message || "Failed to load deliverable details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [deliverableId]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.title.trim()) errs.title = "Deliverable title is required";
    if (!formData.project) errs.project = "Please select a project";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      await api.deliverables.update(deliverableId, {
        title: formData.title,
        description: formData.description,
        project: formData.project,
        task: formData.task ? formData.task : null,
        fileUrl: formData.fileUrl,
        status: formData.status as any,
        dueDate: formData.dueDate ? formData.dueDate : undefined
      });
      addToast("Deliverable updated successfully!", "success");
      router.push("/deliverables");
    } catch (err: any) {
      console.error("Error updating deliverable:", err);
      addToast(err.message || "Failed to update deliverable", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading deliverable..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  const projectOptions = projects.map((p) => ({
    label: p.title,
    value: p._id
  }));

  const relevantTasks = tasks.filter((t) => {
    const pid = typeof t.project === "object" ? t.project?._id : t.project;
    return pid === formData.project;
  });

  const taskOptions = [
    { label: "None (Direct project deliverable)", value: "" },
    ...relevantTasks.map((t) => ({ label: t.title, value: t._id }))
  ];

  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Submitted", value: "submitted" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title={`Edit ${formData.title || "Deliverable"}`}
        subtitle="Update deliverable assets, link, and client review status."
        backHref="/deliverables"
      />

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <FormInput
          label="Deliverable Title"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          error={errors.title}
        />

        <FormTextarea
          label="Deliverable Description"
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
            onChange={(e) => setFormData({ ...formData, project: e.target.value, task: "" })}
            error={errors.project}
          />
          <FormSelect
            label="Associated Task (Optional)"
            options={taskOptions}
            value={formData.task}
            onChange={(e) => setFormData({ ...formData, task: e.target.value })}
          />
        </div>

        <FormInput
          label="Asset / File Link"
          type="url"
          value={formData.fileUrl}
          onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormSelect
            label="Review Status"
            options={statusOptions}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          />
          <FormInput
            label="Target Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => router.push("/deliverables")}
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
