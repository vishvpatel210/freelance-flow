"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Building,
  Mail,
  Phone,
  MapPin,
  FileText,
  Briefcase,
  CreditCard,
  Edit2,
  Trash2,
  Plus,
  ArrowLeft,
  Calendar
} from "lucide-react";
import api from "@/lib/api";
import { Client, Project, Payment } from "@/types";
import { useToast } from "@/components/ToastContext";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";

export default function ClientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const clientId = resolvedParams.id;
  const router = useRouter();
  const { addToast } = useToast();

  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchClientDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const [clientData, projectsData, paymentsData] = await Promise.all([
        api.clients.getById(clientId),
        api.projects.getAll({ client: clientId }).catch(() => []),
        api.payments.getAll({ client: clientId }).catch(() => [])
      ]);
      setClient(clientData);
      setProjects(projectsData);
      setPayments(paymentsData);
    } catch (err: any) {
      console.error("Error fetching client details:", err);
      const msg = err.message || "Failed to load client details";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientDetails();
  }, [clientId]);

  const handleDeleteClient = async () => {
    if (!client) return;
    try {
      setDeleting(true);
      await api.clients.delete(client._id);
      addToast(`Client "${client.name}" deleted successfully`, "success");
      router.push("/clients");
    } catch (err: any) {
      console.error("Error deleting client:", err);
      addToast(err.message || "Failed to delete client", "error");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading client profile..." />;
  }

  if (error || !client) {
    return (
      <ErrorState
        message={error || "Client not found"}
        onRetry={fetchClientDetails}
      />
    );
  }

  const totalBilled = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const totalPendingPayment = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title={client.name}
        subtitle={client.company ? `${client.company} • Client Profile` : "Client Profile"}
        backHref="/clients"
      >
        <Link
          href={`/clients/${client._id}/edit`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-all"
        >
          <Edit2 className="w-3.5 h-3.5" /> Edit Client
        </Link>
        <button
          onClick={() => setDeleteModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 text-xs font-semibold border border-rose-200 shadow-xs transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </PageHeader>

      {/* Info Card & Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Contact Details
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <a href={`mailto:${client.email}`} className="text-indigo-600 hover:underline">
                {client.email}
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-slate-800">{client.phone}</span>
            </div>
            {client.company && (
              <div className="flex items-center gap-3">
                <Building className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-800">{client.company}</span>
              </div>
            )}
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span className="text-slate-800">{client.address}</span>
            </div>
          </div>

          {client.notes && (
            <div className="pt-4 border-t border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Notes
              </span>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                {client.notes}
              </p>
            </div>
          )}
        </div>

        {/* Client KPI Summary */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Projects
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {projects.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Assigned projects</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Paid Revenue
            </span>
            <div className="text-2xl font-bold text-emerald-600 mt-2">
              ${totalBilled.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">Completed payments</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pending Invoices
            </span>
            <div className="text-2xl font-bold text-amber-600 mt-2">
              ${totalPendingPayment.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">Awaiting settlement</p>
          </div>
        </div>
      </div>

      {/* Associated Projects */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Projects with {client.name}</h3>
            <p className="text-xs text-slate-500">All contracts and active scopes</p>
          </div>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> New Project
          </Link>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            title="No projects for this client yet"
            description="Create a project contract to track tasks and milestones."
            actionLabel="Create Project"
            actionHref="/projects/new"
            icon={Briefcase}
          />
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 font-semibold">Title</th>
                  <th className="pb-3 font-semibold">Budget</th>
                  <th className="pb-3 font-semibold">Deadline</th>
                  <th className="pb-3 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map((project) => (
                  <tr key={project._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 pr-2">
                      <Link
                        href={`/projects/${project._id}`}
                        className="font-semibold text-slate-900 hover:text-indigo-600"
                      >
                        {project.title}
                      </Link>
                    </td>
                    <td className="py-3.5 px-2 text-xs font-bold text-slate-900">
                      ${Number(project.budget || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-2 text-xs text-slate-500">
                      {project.deadline ? new Date(project.deadline).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3.5 pl-2 text-right">
                      <StatusBadge status={project.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Associated Payments */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Payment History</h3>
            <p className="text-xs text-slate-500">Invoices and settlements recorded for this client</p>
          </div>
          <Link
            href="/payments/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Record Payment
          </Link>
        </div>

        {payments.length === 0 ? (
          <EmptyState
            title="No payments recorded"
            description="Record payments or track upcoming milestones."
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

      {/* Delete Confirmation Modal */}
      <ConfirmationDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteClient}
        title="Delete Client"
        itemName={client.name}
        message="Are you sure you want to delete this client? All connected records will be unlinked."
        loading={deleting}
      />
    </div>
  );
}

