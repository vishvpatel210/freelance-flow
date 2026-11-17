"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Building,
  MapPin,
  RefreshCw
} from "lucide-react";
import api from "@/lib/api";
import { Client } from "@/types";
import { useToast } from "@/components/ToastContext";
import PageHeader from "@/components/PageHeader";
import SearchInput from "@/components/SearchInput";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { addToast } = useToast();

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.clients.getAll();
      setClients(data);
    } catch (err: any) {
      console.error("Error fetching clients:", err);
      const msg = err.message || "Failed to load clients";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    try {
      setDeleting(true);
      await api.clients.delete(clientToDelete._id);
      addToast(`Client "${clientToDelete.name}" deleted successfully`, "success");
      setClients((prev) => prev.filter((c) => c._id !== clientToDelete._id));
      setDeleteModalOpen(false);
      setClientToDelete(null);
    } catch (err: any) {
      console.error("Error deleting client:", err);
      addToast(err.message || "Failed to delete client", "error");
    } finally {
      setDeleting(false);
    }
  };

  const filteredClients = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.company && c.company.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        subtitle="Manage your client relationships, contact details, and contracts."
        actionLabel="Add Client"
        actionHref="/clients/new"
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email, or company..."
          className="w-full sm:w-80"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredClients.length} of {clients.length} clients
          </span>
          <button
            onClick={fetchClients}
            title="Refresh"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingSpinner text="Loading clients list..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchClients} />
      ) : filteredClients.length === 0 ? (
        <EmptyState
          title={search ? "No matching clients found" : "No clients added yet"}
          description={
            search
              ? "Try adjusting your search criteria."
              : "Get started by adding your first client."
          }
          actionLabel={search ? undefined : "Add Client"}
          actionHref={search ? undefined : "/clients/new"}
          icon={Users}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Client</th>
                  <th className="py-3.5 px-6">Company</th>
                  <th className="py-3.5 px-6">Contact</th>
                  <th className="py-3.5 px-6">Address</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map((client) => (
                  <tr key={client._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <Link
                        href={`/clients/${client._id}`}
                        className="font-semibold text-slate-900 hover:text-indigo-600 block transition-colors"
                      >
                        {client.name}
                      </Link>
                      <span className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {client.email}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600 font-medium">
                      {client.company ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                          <Building className="w-3 h-3 text-slate-400" />
                          {client.company}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {client.phone}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600 max-w-xs truncate">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{client.address}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/clients/${client._id}`}
                          title="View Details"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/clients/${client._id}/edit`}
                          title="Edit Client"
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setClientToDelete(client);
                            setDeleteModalOpen(true);
                          }}
                          title="Delete Client"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
          setClientToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Client"
        itemName={clientToDelete?.name}
        message="Are you sure you want to delete this client? All associated projects and payments may be affected."
        loading={deleting}
      />
    </div>
  );
}

