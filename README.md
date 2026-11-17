# FreelanceFlow — Complete Freelancer Management Platform

FreelanceFlow is a full-stack, enterprise-grade freelancer workspace built with Next.js (App Router, TypeScript, Tailwind CSS), Node.js, Express.js, and MongoDB with Mongoose. It centralizes client relationships, project scopes, task tracking, deliverable approvals, payment invoicing, and real-time dashboard analytics.

---

## 1. Project Architecture & Folder Structure

```
freelance-flow/
├── backend/
│   ├── config/
│   │   └── db.js                        # MongoDB Mongoose connection with DNS fallback
│   ├── controller/
│   │   ├── clientcontroller.js          # Clients CRUD logic
│   │   ├── projectcontroller.js         # Projects CRUD with client population
│   │   ├── taskcontroller.js            # Tasks CRUD with status & priority filters
│   │   ├── deliverablecontroller.js     # Deliverables CRUD with project/task links
│   │   ├── paymentcontroller.js         # Payments CRUD with financial validation
│   │   └── dashboardcontroller.js       # Real-time analytics & MongoDB aggregations
│   ├── model/
│   │   ├── Client.js                    # Client schema (name, email, phone, company, address)
│   │   ├── Project.js                   # Project schema (title, client ref, budget >= 0, status, dates)
│   │   ├── Task.js                      # Task schema (title, project ref, priority, status, dueDate)
│   │   ├── Deliverable.js               # Deliverable schema (title, project ref, task ref, fileUrl, status)
│   │   └── Payment.js                   # Payment schema (project ref, client ref, amount >= 0, status)
│   ├── routes/
│   │   ├── clientRoutes.js              # /api/clients endpoints
│   │   ├── projectRoutes.js             # /api/projects endpoints
│   │   ├── taskRoutes.js                # /api/tasks endpoints
│   │   ├── deliverableRoutes.js         # /api/deliverables endpoints
│   │   ├── paymentRoutes.js             # /api/payments endpoints
│   │   └── dashboardRoutes.js           # /api/dashboard endpoint
│   ├── .env                             # Environment configuration (PORT, MONGODB_URI)
│   ├── app.js                           # Express app with CORS & mounted API routers
│   ├── server.js                        # Entrypoint listening on PORT 5000
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── clients/
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── edit/page.tsx    # Edit Client
│   │   │   │   │   └── page.tsx         # Client Details & related history
│   │   │   │   ├── new/page.tsx         # Add Client
│   │   │   │   └── page.tsx             # Clients List & search
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx             # Analytics Dashboard
│   │   │   ├── deliverables/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── edit/page.tsx    # Edit Deliverable
│   │   │   │   ├── new/page.tsx         # Submit Deliverable
│   │   │   │   └── page.tsx             # Deliverables List & status filters
│   │   │   ├── payments/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── edit/page.tsx    # Edit Payment
│   │   │   │   ├── new/page.tsx         # Record Payment
│   │   │   │   └── page.tsx             # Payments & Invoices List
│   │   │   ├── projects/
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── edit/page.tsx    # Edit Project
│   │   │   │   │   └── page.tsx         # Project Details (Tasks, Deliverables, Payments tabs)
│   │   │   │   ├── new/page.tsx         # Create Project
│   │   │   │   └── page.tsx             # Projects List & status/client filters
│   │   │   ├── settings/
│   │   │   │   └── page.tsx             # Workspace Settings & Health Check
│   │   │   ├── tasks/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── edit/page.tsx    # Edit Task
│   │   │   │   ├── new/page.tsx         # Create Task
│   │   │   │   └── page.tsx             # Tasks List with quick status toggles
│   │   │   ├── globals.css              # Tailwind CSS styles & modern SaaS theme
│   │   │   ├── layout.tsx               # Root Dashboard Layout
│   │   │   └── page.tsx                 # Home redirect to /dashboard
│   │   ├── components/
│   │   │   ├── Charts.tsx               # Project, Task, and Revenue visual charts
│   │   │   ├── ConfirmationDialog.tsx   # Modal confirmation before record deletion
│   │   │   ├── DashboardLayout.tsx      # Sidebar + Navbar + Content wrapper
│   │   │   ├── EmptyState.tsx           # Empty state with actionable button
│   │   │   ├── ErrorState.tsx           # Error banner with retry trigger
│   │   │   ├── FilterDropdown.tsx       # Dropdown filter component
│   │   │   ├── FormInput.tsx            # Form text & textarea inputs with validation
│   │   │   ├── FormSelect.tsx           # Form select input with options
│   │   │   ├── LoadingSpinner.tsx       # Spinner and skeleton table loaders
│   │   │   ├── Navbar.tsx               # Top navigation bar with quick create menu
│   │   │   ├── PageHeader.tsx           # Page header with title and action buttons
│   │   │   ├── SearchInput.tsx          # Real-time search input with clear button
│   │   │   ├── Sidebar.tsx              # Collapsible responsive sidebar
│   │   │   ├── StatCard.tsx             # KPI metric cards
│   │   │   ├── StatusBadge.tsx          # Status and priority badges
│   │   │   └── ToastContext.tsx         # Global toast notification provider
│   │   ├── lib/
│   │   │   └── api.ts                   # Centralized typed API service
│   │   └── types/
│   │       └── index.ts                 # Full TypeScript interfaces & types
│   ├── .env.local                       # NEXT_PUBLIC_API_URL
│   ├── next.config.ts                   # Next.js configuration
│   ├── package.json
│   └── tsconfig.json
│
└── postman_collection.json              # Ready-to-import Postman Collection
```

---

## 2. Completed Backend Modules & API Endpoints

All APIs are mounted under `/api` and return standardized JSON responses.

### A. Dashboard (`/api/dashboard`)
- `GET /api/dashboard`: Aggregates total clients, total projects, total tasks, completed tasks, pending tasks, total revenue from paid payments, pending payments (amount & count), status breakdowns, recent projects, and recent payments.

### B. Clients (`/api/clients`)
- `POST /api/clients`: Create new client (validates required fields & unique email)
- `GET /api/clients`: Retrieve all clients
- `GET /api/clients/:id`: Retrieve client by MongoDB ID
- `PATCH /api/clients/:id`: Update client (updates only supplied fields)
- `DELETE /api/clients/:id`: Delete client

### C. Projects (`/api/projects`)
- `POST /api/projects`: Create project (validates client existence & non-negative budget)
- `GET /api/projects`: Retrieve all projects (populates client details)
- `GET /api/projects/:id`: Retrieve project by ID (populates client details)
- `PATCH /api/projects/:id`: Update project
- `DELETE /api/projects/:id`: Delete project

### D. Tasks (`/api/tasks`)
- `POST /api/tasks`: Create task (validates project reference, priority, status)
- `GET /api/tasks`: Retrieve all tasks (supports `?project=`, `?status=`, `?priority=` query filters)
- `GET /api/tasks/:id`: Retrieve task by ID (populates project and client details)
- `PATCH /api/tasks/:id`: Partial update of task fields
- `DELETE /api/tasks/:id`: Delete task

### E. Deliverables (`/api/deliverables`)
- `POST /api/deliverables`: Submit deliverable (validates project and optional task reference)
- `GET /api/deliverables`: Retrieve deliverables (supports `?project=`, `?task=`, `?status=` filters)
- `GET /api/deliverables/:id`: Retrieve deliverable by ID
- `PATCH /api/deliverables/:id`: Update deliverable status or asset link
- `DELETE /api/deliverables/:id`: Delete deliverable

### F. Payments (`/api/payments`)
- `POST /api/payments`: Record payment (validates amount >= 0, project, and client references)
- `GET /api/payments`: Retrieve payments (supports `?project=`, `?client=`, `?status=` filters)
- `GET /api/payments/:id`: Retrieve payment by ID
- `PATCH /api/payments/:id`: Update payment transaction or status
- `DELETE /api/payments/:id`: Delete payment record

---

## 3. Completed Frontend Pages (TypeScript & Next.js App Router)

1. **Dashboard** (`/dashboard` & `/`): KPI cards, Revenue Flow chart, Project pipeline distribution, Task velocity chart, Recent projects table, Recent payments table, Quick Action modal.
2. **Clients List** (`/clients`): Client directory, instant search, responsive table with contact cards, view/edit/delete actions.
3. **Add Client** (`/clients/new`): Client creation form with email and phone validation.
4. **Client Details** (`/clients/[id]`): Client profile with associated projects and payments history.
5. **Edit Client** (`/clients/[id]/edit`): Pre-populated update form.
6. **Projects List** (`/projects`): Projects directory, search, status filter, client filter, budgets, deadlines, and status badges.
7. **Create Project** (`/projects/new`): Project creation with live client dropdown selector, non-negative budget validation, and start/deadline date pickers.
8. **Project Details** (`/projects/[id]`): Full project overview, client summary, task completion bar, invoicing health bar, and tabs for Tasks, Deliverables, and Payments.
9. **Edit Project** (`/projects/[id]/edit`): Project update form.
10. **Tasks Tracker** (`/tasks`): Task list, filter by project, priority, and status, with one-click completion toggle.
11. **Create Task** (`/tasks/new`): Task creation form with project selector, assignee, priority, status, and due date.
12. **Edit Task** (`/tasks/[id]/edit`): Task update form.
13. **Deliverables Hub** (`/deliverables`): Deliverables list with review statuses, asset links, and project links.
14. **Submit Deliverable** (`/deliverables/new`): Deliverable creation with project selector, dynamically filtered task dropdown, asset URL, and due date.
15. **Edit Deliverable** (`/deliverables/[id]/edit`): Deliverable update form.
16. **Payments & Invoices** (`/payments`): Payment registry with financial summary cards, method, transaction ID, date, and status badges.
17. **Record Payment** (`/payments/new`): Payment creation with project selector, auto-linked client, method, non-negative amount validation, and transaction ID.
18. **Edit Payment** (`/payments/[id]/edit`): Payment update form.
19. **Workspace Settings** (`/settings`): Workspace preferences and live backend health check tester.

---

## 4. Environment Variables

### Backend (`freelance-flow/backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.ikmsfsj.mongodb.net/freelanceflow?retryWrites=true&w=majority
```

### Frontend (`freelance-flow/frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 5. How to Run Backend and Frontend

### Step 1: Start Backend Server
```bash
cd freelance-flow/backend
node server.js
```
The backend server will start on port `5000`:
```
Server is running successfully on PORT 5000
Database connected successfully
```

### Step 2: Start Frontend Application
In a separate terminal:
```bash
cd freelance-flow/frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) or [http://localhost:3001](http://localhost:3001) in your browser.

To verify a production build:
```bash
cd freelance-flow/frontend
npm run build
npm run start
```

---

## 6. Postman Testing Instructions

1. Open Postman.
2. Click **Import** in the upper left.
3. Select `freelance-flow/postman_collection.json`.
4. Ensure the collection variable `baseUrl` is set to `http://localhost:5000/api`.
5. Execute requests sequentially:
   - **Clients > Create Client**: Creates a client and automatically stores `clientId` as a collection variable.
   - **Projects > Create Project**: Uses `{{clientId}}` to create a project and stores `projectId`.
   - **Tasks > Create Task**: Uses `{{projectId}}` to create a task and stores `taskId`.
   - **Deliverables > Create Deliverable**: Uses `{{projectId}}` and `{{taskId}}`.
   - **Payments > Create Payment**: Uses `{{projectId}}` and `{{clientId}}`.
   - **Dashboard > Get Dashboard Statistics**: Verifies updated revenue, project, and task counts.
