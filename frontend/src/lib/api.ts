import {
  Client,
  Project,
  Task,
  Deliverable,
  Payment,
  DashboardStats
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.message || `Request failed with status ${res.status}`;
      const err = new Error(errorMsg) as Error & { status?: number; data?: any };
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data as T;
  } catch (err: any) {
    if (!err.status) {
      console.error(`Network or CORS error connecting to ${url}:`, err);
    }
    throw err;
  }
}

export const api = {
  // Dashboard
  dashboard: {
    getStats: async (): Promise<{ success: boolean; stats: DashboardStats }> => {
      return request<{ success: boolean; stats: DashboardStats }>("/dashboard");
    }
  },

  // Clients
  clients: {
    getAll: async (): Promise<Client[]> => {
      const res = await request<{ success: boolean; allClients?: Client[]; clients?: Client[] }>("/clients");
      return res.allClients || res.clients || [];
    },
    getById: async (id: string): Promise<Client> => {
      const res = await request<{ success: boolean; client: Client }>(`/clients/${id}`);
      return res.client;
    },
    create: async (data: Partial<Client>): Promise<Client> => {
      const res = await request<{ success: boolean; client: Client }>("/clients", {
        method: "POST",
        body: JSON.stringify(data)
      });
      return res.client;
    },
    update: async (id: string, data: Partial<Client>): Promise<Client> => {
      const res = await request<{ success: boolean; client: Client }>(`/clients/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data)
      });
      return res.client;
    },
    delete: async (id: string): Promise<Client> => {
      const res = await request<{ success: boolean; client: Client }>(`/clients/${id}`, {
        method: "DELETE"
      });
      return res.client;
    }
  },

  // Projects
  projects: {
    getAll: async (params: { client?: string; status?: string } = {}): Promise<Project[]> => {
      const q = new URLSearchParams();
      if (params.client) q.append("client", params.client);
      if (params.status) q.append("status", params.status);
      const queryStr = q.toString() ? `?${q.toString()}` : "";
      const res = await request<{ success: boolean; projects: Project[] }>(`/projects${queryStr}`);
      return res.projects || [];
    },
    getById: async (id: string): Promise<Project> => {
      const res = await request<{ success: boolean; project: Project }>(`/projects/${id}`);
      return res.project;
    },
    create: async (data: Partial<Project>): Promise<Project> => {
      const res = await request<{ success: boolean; project: Project }>("/projects", {
        method: "POST",
        body: JSON.stringify(data)
      });
      return res.project;
    },
    update: async (id: string, data: Partial<Project>): Promise<Project> => {
      const res = await request<{ success: boolean; project: Project }>(`/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data)
      });
      return res.project;
    },
    delete: async (id: string): Promise<Project> => {
      const res = await request<{ success: boolean; project: Project }>(`/projects/${id}`, {
        method: "DELETE"
      });
      return res.project;
    }
  },

  // Tasks
  tasks: {
    getAll: async (params: { project?: string; status?: string; priority?: string } = {}): Promise<Task[]> => {
      const q = new URLSearchParams();
      if (params.project) q.append("project", params.project);
      if (params.status) q.append("status", params.status);
      if (params.priority) q.append("priority", params.priority);
      const queryStr = q.toString() ? `?${q.toString()}` : "";
      const res = await request<{ success: boolean; tasks: Task[] }>(`/tasks${queryStr}`);
      return res.tasks || [];
    },
    getById: async (id: string): Promise<Task> => {
      const res = await request<{ success: boolean; task: Task }>(`/tasks/${id}`);
      return res.task;
    },
    create: async (data: Partial<Task>): Promise<Task> => {
      const res = await request<{ success: boolean; task: Task }>("/tasks", {
        method: "POST",
        body: JSON.stringify(data)
      });
      return res.task;
    },
    update: async (id: string, data: Partial<Task>): Promise<Task> => {
      const res = await request<{ success: boolean; task: Task }>(`/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data)
      });
      return res.task;
    },
    delete: async (id: string): Promise<Task> => {
      const res = await request<{ success: boolean; task: Task }>(`/tasks/${id}`, {
        method: "DELETE"
      });
      return res.task;
    }
  },

  // Deliverables
  deliverables: {
    getAll: async (params: { project?: string; task?: string; status?: string } = {}): Promise<Deliverable[]> => {
      const q = new URLSearchParams();
      if (params.project) q.append("project", params.project);
      if (params.task) q.append("task", params.task);
      if (params.status) q.append("status", params.status);
      const queryStr = q.toString() ? `?${q.toString()}` : "";
      const res = await request<{ success: boolean; deliverables: Deliverable[] }>(`/deliverables${queryStr}`);
      return res.deliverables || [];
    },
    getById: async (id: string): Promise<Deliverable> => {
      const res = await request<{ success: boolean; deliverable: Deliverable }>(`/deliverables/${id}`);
      return res.deliverable;
    },
    create: async (data: Partial<Deliverable>): Promise<Deliverable> => {
      const res = await request<{ success: boolean; deliverable: Deliverable }>("/deliverables", {
        method: "POST",
        body: JSON.stringify(data)
      });
      return res.deliverable;
    },
    update: async (id: string, data: Partial<Deliverable>): Promise<Deliverable> => {
      const res = await request<{ success: boolean; deliverable: Deliverable }>(`/deliverables/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data)
      });
      return res.deliverable;
    },
    delete: async (id: string): Promise<Deliverable> => {
      const res = await request<{ success: boolean; deliverable: Deliverable }>(`/deliverables/${id}`, {
        method: "DELETE"
      });
      return res.deliverable;
    }
  },

  // Payments
  payments: {
    getAll: async (params: { project?: string; client?: string; status?: string } = {}): Promise<Payment[]> => {
      const q = new URLSearchParams();
      if (params.project) q.append("project", params.project);
      if (params.client) q.append("client", params.client);
      if (params.status) q.append("status", params.status);
      const queryStr = q.toString() ? `?${q.toString()}` : "";
      const res = await request<{ success: boolean; payments: Payment[] }>(`/payments${queryStr}`);
      return res.payments || [];
    },
    getById: async (id: string): Promise<Payment> => {
      const res = await request<{ success: boolean; payment: Payment }>(`/payments/${id}`);
      return res.payment;
    },
    create: async (data: Partial<Payment>): Promise<Payment> => {
      const res = await request<{ success: boolean; payment: Payment }>("/payments", {
        method: "POST",
        body: JSON.stringify(data)
      });
      return res.payment;
    },
    update: async (id: string, data: Partial<Payment>): Promise<Payment> => {
      const res = await request<{ success: boolean; payment: Payment }>(`/payments/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data)
      });
      return res.payment;
    },
    delete: async (id: string): Promise<Payment> => {
      const res = await request<{ success: boolean; payment: Payment }>(`/payments/${id}`, {
        method: "DELETE"
      });
      return res.payment;
    }
  }
};

export default api;

