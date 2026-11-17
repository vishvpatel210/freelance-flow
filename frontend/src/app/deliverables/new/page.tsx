"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Project, Task } from "@/types";
import { useToast } from "@/components/ToastContext";
import PageHeader from "@/components/PageHeader";
import { FormInput, FormTextarea } from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function NewDeliverablePage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project: "",
    task: "",
    fileUrl: "",
    status: "pending",
    dueDate: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingData(true);
        const [projectsList, tasksList] = await Promise.all([
          api.projects.getAll(),
          api.tasks.getAll().catch(() => [])
        ]);

        setProjects(projectsList);
        setTasks(tasksList);

        if (projectsList.length > 0) {
          setFormData((prev) => ({ ...prev, project: projectsList[0]._id }));
        }
      } catch (err: any) {
        console.error("Error loading projects/tasks:", err);
        addToast("Failed to load reference options", "error");
      } finally {
        setLoadingData(false);
      }
    };
    fetchInitialData();
  }, []);

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
      await api.deliverables.create({
        title: formData.title,
        description: formData.description,
        project: formData.project,
        task: formData.task || null,
        fileUrl: formData.fileUrl,
        status: formData.status as any,
        dueDate: formData.dueDate || undefined
      });
      addToast("Deliverable submitted successfully!", "success");
      router.push("/deliverables");
    } catch (err: any) {
      console.error("Error creating deliverable:", err);
      addToast(err.message || "Failed to create deliverable", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return <LoadingSpinner text="Preparing deliverable options..." />;
  }

  const projectOptions = projects.map((p) => ({
    label: p.title,
    value: p._id
  }));

  // Tasks associated with selected project
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
        title="Submit Deliverable"
        subtitle="Log an asset, prototype link, or document for client approval."
        backHref="/deliverables"
      />

      {projects.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-4">
          <p className="text-sm text-slate-600">
            You need at least one project before adding deliverables.
          </p>
          <button
            onClick={() => router.push("/projects/new")}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all"
          >
            Create Project First
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <FormInput
            label="Deliverable Title"
            placeholder="e.g. Design System V1.0 (Figma)"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            error={errors.title}
          />

          <FormTextarea
            label="Deliverable Description"
            placeholder="Summary of changes, instructions for client review, or changelog..."
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
              onChange={(e) =>
                setFormData({ ...formData, project: e.target.value, task: "" })
              }
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
            placeholder="e.g. https://www.figma.com/file/... or Google Drive URL"
            value={formData.fileUrl}
            onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
            helperText="Direct URL where the client can inspect or download the deliverable."
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
              {submitting ? "Submitting..." : "Submit Deliverable"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

