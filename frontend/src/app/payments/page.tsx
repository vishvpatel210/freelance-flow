"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Plus,
  Search,
  Edit2,
  Trash2,
  DollarSign,
  Calendar,
  User,
  FolderKanban,
  RefreshCw,
  CheckCircle2,
  Clock
} from "lucide-react";
import api from "@/lib/api";
import { Payment, Project, Client } from "@/types";
import { useToast } from "@/components/ToastContext";
import PageHeader from "@/components/PageHeader";
import SearchInput from "@/components/SearchInput";
import FilterDropdown from "@/components/FilterDropdown";
import StatusBadge from "@/components/StatusBadge";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { addToast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [paymentsData, projectsData, clientsData] = await Promise.all([
        api.payments.getAll(),
        api.projects.getAll().catch(() => []),
        api.clients.getAll().catch(() => [])
      ]);
      setPayments(paymentsData);
      setProjects(projectsData);
      setClients(clientsData);
    } catch (err: any) {
      console.error("Error fetching payments:", err);
      const msg = err.message || "Failed to load payments";
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
    if (!paymentToDelete) return;
    try {
      setDeleting(true);
      await api.payments.delete(paymentToDelete._id);
      addToast("Payment record deleted successfully", "success");
      setPayments((prev) => prev.filter((p) => p._id !== paymentToDelete._id));
      setDeleteModalOpen(false);
      setPaymentToDelete(null);
    } catch (err: any) {
      console.error("Error deleting payment:", err);
      addToast(err.message || "Failed to delete payment", "error");
    } finally {
      setDeleting(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const q = search.toLowerCase();
    const projTitle = typeof p.project === "object" ? p.project?.title : "";
    const clientName = typeof p.client === "object" ? p.client?.name : "";
    const txnId = p.transactionId || "";

    const matchesSearch =
      projTitle.toLowerCase().includes(q) ||
      clientName.toLowerCase().includes(q) ||
      txnId.toLowerCase().includes(q) ||
      p.paymentMethod.toLowerCase().includes(q);

    const matchesStatus = statusFilter === "all" || p.status === statusFilter;

    const projId = typeof p.project === "object" ? p.project?._id : p.project;
    const matchesProject = projectFilter === "all" || projId === projectFilter;

    const cliId = typeof p.client === "object" ? p.client?._id : p.client;
    const matchesClient = clientFilter === "all" || cliId === clientFilter;

    return matchesSearch && matchesStatus && matchesProject && matchesClient;
  });

  const projectOptions = [
    { label: "All Projects", value: "all" },
    ...projects.map((p) => ({ label: p.title, value: p._id }))
  ];

  const clientOptions = [
    { label: "All Clients", value: "all" },
    ...clients.map((c) => ({ label: c.name, value: c._id }))
  ];

  const statusOptions = [
    { label: "All Statuses", value: "all" },
    { label: "Paid", value: "paid" },
    { label: "Pending", value: "pending" },
    { label: "Failed", value: "failed" },
    { label: "Refunded", value: "refunded" }
  ];

  const totalCollected = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const totalPending = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments & Invoices"
        subtitle="Manage incoming billing, milestone invoices, and cash flow."
        actionLabel="Record Payment"
        actionHref="/payments/new"
      />

      {/* Financial Quick Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Collected
          </span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            ${totalCollected.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-1">From successful settlements</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Pending Invoices
          </span>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            ${totalPending.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-1">Awaiting client payment</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Invoices
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {payments.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">Recorded transactions</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by project, client, or txn ID..."
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
            label="Project"
            value={projectFilter}
            onChange={setProjectFilter}
            options={projectOptions}
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
        <LoadingSpinner text="Loading payments..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : filteredPayments.length === 0 ? (
        <EmptyState
          title={search || statusFilter !== "all" || projectFilter !== "all" || clientFilter !== "all" ? "No matching payments found" : "No payments recorded yet"}
          description={
            search || statusFilter !== "all" || projectFilter !== "all" || clientFilter !== "all"
              ? "Try adjusting your filters or search terms."
              : "Record your first payment or issue a project invoice."
          }
          actionLabel={search || statusFilter !== "all" || projectFilter !== "all" || clientFilter !== "all" ? undefined : "Record Payment"}
          actionHref={search || statusFilter !== "all" || projectFilter !== "all" || clientFilter !== "all" ? undefined : "/payments/new"}
          icon={CreditCard}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Project & Client</th>
                  <th className="py-3.5 px-6">Method</th>
                  <th className="py-3.5 px-6">Transaction ID</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((pay) => {
                  const projectObj = typeof pay.project === "object" ? pay.project : null;
                  const clientObj = typeof pay.client === "object" ? pay.client : null;
                  return (
                    <tr key={pay._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <span className="text-base font-bold text-slate-900 block">
                          ${Number(pay.amount || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600">
                        <p className="font-semibold text-slate-800">
                          {projectObj?.title || "—"}
                        </p>
                        <p className="text-slate-500 mt-0.5">
                          {clientObj?.name || "—"}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600 font-medium">
                        {pay.paymentMethod || "Bank Transfer"}
                      </td>
                      <td className="py-4 px-6 text-xs font-mono text-slate-500">
                        {pay.transactionId || "—"}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {pay.paymentDate
                            ? new Date(pay.paymentDate).toLocaleDateString()
                            : pay.dueDate
                            ? `Due ${new Date(pay.dueDate).toLocaleDateString()}`
                            : "—"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={pay.status} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/payments/${pay._id}/edit`}
                            title="Edit Payment"
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentToDelete(pay);
                              setDeleteModalOpen(true);
                            }}
                            title="Delete Payment"
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
          setPaymentToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Payment"
        itemName={paymentToDelete ? `$${paymentToDelete.amount}` : undefined}
        message="Are you sure you want to delete this payment record? This will adjust your revenue calculations."
        loading={deleting}
      />
    </div>
  );
}

