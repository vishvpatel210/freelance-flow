export interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ProjectStatus = "pending" | "in-progress" | "completed" | "cancelled";

export interface Project {
  _id: string;
  title: string;
  description: string;
  client: string | Client;
  budget: number;
  status: ProjectStatus;
  startDate: string;
  deadline: string;
  createdAt?: string;
  updatedAt?: string;
}

export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "pending" | "in-progress" | "completed";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  project: string | Project;
  assignedTo?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type DeliverableStatus = "pending" | "submitted" | "approved" | "rejected";

export interface Deliverable {
  _id: string;
  title: string;
  description?: string;
  project: string | Project;
  task?: string | Task | null;
  fileUrl?: string;
  status: DeliverableStatus;
  submittedAt?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Payment {
  _id: string;
  project: string | Project;
  client: string | Client;
  amount: number;
  paymentMethod: string;
  status: PaymentStatus;
  transactionId?: string;
  paymentDate?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  totalClients: number;
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks?: number;
  totalRevenue: number;
  pendingPayments: {
    amount: number;
    count: number;
  };
  projectStatusStats: {
    pending: number;
    "in-progress": number;
    completed: number;
    cancelled: number;
  };
  taskStatusStats: {
    pending: number;
    "in-progress": number;
    completed: number;
  };
  recentProjects: Project[];
  recentPayments: Payment[];
}

