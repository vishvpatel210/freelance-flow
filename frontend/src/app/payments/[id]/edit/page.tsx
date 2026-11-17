"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Project, Client } from "@/types";
import { useToast } from "@/components/ToastContext";
import PageHeader from "@/components/PageHeader";
import { FormInput } from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";

export default function EditPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const paymentId = resolvedParams.id;
  const router = useRouter();
  const { addToast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const [formData, setFormData] = useState({
    project: "",
    client: "",
    amount: "",
    paymentMethod: "Bank Transfer",
    status: "pending",
    transactionId: "",
    paymentDate: "",
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
        const [payment, projectsList, clientsList] = await Promise.all([
          api.payments.getById(paymentId),
          api.projects.getAll().catch(() => []),
          api.clients.getAll().catch(() => [])
        ]);

        setProjects(projectsList);
        setClients(clientsList);

        const projectId = typeof payment.project === "object" ? payment.project?._id : payment.project;
        const clientId = typeof payment.client === "object" ? payment.client?._id : payment.client;

        setFormData({
          project: projectId || "",
          client: clientId || "",
          amount: payment.amount !== undefined ? String(payment.amount) : "",
          paymentMethod: payment.paymentMethod || "Bank Transfer",
          status: payment.status || "pending",
          transactionId: payment.transactionId || "",
          paymentDate: payment.paymentDate ? new Date(payment.paymentDate).toISOString().split("T")[0] : "",
          dueDate: payment.dueDate ? new Date(payment.dueDate).toISOString().split("T")[0] : ""
        });
      } catch (err: any) {
        console.error("Error loading payment:", err);
        setError(err.message || "Failed to load payment details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [paymentId]);

  const handleProjectChange = (projectId: string) => {
    const selectedProj = projects.find((p) => p._id === projectId);
    let linkedClientId = "";
    if (selectedProj) {
      linkedClientId = typeof selectedProj.client === "object" ? selectedProj.client?._id : selectedProj.client;
    }
    setFormData((prev) => ({
      ...prev,
      project: projectId,
      client: linkedClientId || prev.client
    }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.project) errs.project = "Please select a project";
    if (!formData.client) errs.client = "Please select a client";
    if (
      formData.amount === "" ||
      isNaN(Number(formData.amount)) ||
      Number(formData.amount) < 0
    ) {
      errs.amount = "Please enter a valid non-negative payment amount";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      await api.payments.update(paymentId, {
        project: formData.project,
        client: formData.client,
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        status: formData.status as any,
        transactionId: formData.transactionId,
        paymentDate: formData.paymentDate ? formData.paymentDate : undefined,
        dueDate: formData.dueDate ? formData.dueDate : undefined
      });
      addToast("Payment updated successfully!", "success");
      router.push("/payments");
    } catch (err: any) {
      console.error("Error updating payment:", err);
      addToast(err.message || "Failed to update payment", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading payment record..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  const projectOptions = projects.map((p) => ({
    label: `${p.title} ($${Number(p.budget || 0).toLocaleString()})`,
    value: p._id
  }));

  const clientOptions = clients.map((c) => ({
    label: `${c.name}${c.company ? ` (${c.company})` : ""}`,
    value: c._id
  }));

  const methodOptions = [
    { label: "Bank Transfer", value: "Bank Transfer" },
    { label: "Stripe", value: "Stripe" },
    { label: "PayPal", value: "PayPal" },
    { label: "Credit Card", value: "Credit Card" },
    { label: "Wise", value: "Wise" },
    { label: "Cash / Other", value: "Cash" }
  ];

  const statusOptions = [
    { label: "Paid", value: "paid" },
    { label: "Pending", value: "pending" },
    { label: "Failed", value: "failed" },
    { label: "Refunded", value: "refunded" }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Edit Payment Record"
        subtitle="Update payment transaction status, amount, and receipt dates."
        backHref="/payments"
      />

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormSelect
            label="Associated Project"
            required
            options={projectOptions}
            value={formData.project}
            onChange={(e) => handleProjectChange(e.target.value)}
            error={errors.project}
          />
          <FormSelect
            label="Client"
            required
            options={clientOptions}
            value={formData.client}
            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
            error={errors.client}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormInput
            label="Amount (USD)"
            type="number"
            min="0"
            step="any"
            required
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            error={errors.amount}
          />
          <FormSelect
            label="Payment Method"
            options={methodOptions}
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormSelect
            label="Payment Status"
            options={statusOptions}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          />
          <FormInput
            label="Transaction ID / Ref"
            value={formData.transactionId}
            onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormInput
            label="Payment Date (if paid)"
            type="date"
            value={formData.paymentDate}
            onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
          />
          <FormInput
            label="Due Date (if invoice pending)"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => router.push("/payments")}
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
