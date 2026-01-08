# Feature: Admin Dashboard Frontend

## Status
- [x] Requirements Approved
- [ ] Design Complete
- [ ] Implementation Started
- [ ] Implementation Complete
- [ ] Testing Complete
- [ ] Deployed

## Overview

The admin dashboard provides platform administrators with comprehensive tools to manage the entire SafariPlus ecosystem, including agent management, booking oversight, financial controls, and platform configuration.

## User Stories

- As an admin, I want to see platform-wide metrics at a glance
- As an admin, I want to manage agent applications and accounts
- As an admin, I want to oversee all bookings and payments
- As an admin, I want to process withdrawal requests
- As an admin, I want to configure commission rates
- As an admin, I want to generate business reports
- As an admin, I want to moderate tour content

## Pages & Routes

| Page | Route | Description |
|------|-------|-------------|
| Dashboard Home | `/admin` | Platform overview |
| Manage Agents | `/admin/agents` | Agent list and management |
| Agent Details | `/admin/agents/[id]` | Single agent view |
| Manage Clients | `/admin/clients` | Client list |
| All Bookings | `/admin/bookings` | Platform bookings |
| All Tours | `/admin/tours` | Tour moderation |
| Withdrawals | `/admin/withdrawals` | Payout management |
| Commission | `/admin/settings/commission` | Commission config |
| Reports | `/admin/reports` | Business reports |
| Settings | `/admin/settings` | Platform settings |

## Page Specifications

### 1. Admin Dashboard Home (`/admin`)

#### Layout
```
+------------------------------------------------------------------+
|  [Logo]  Admin Dashboard                    [Alerts] [Profile v]  |
+----------+-------------------------------------------------------+
| Sidebar  |                                                        |
|          |  +----------+ +----------+ +----------+ +----------+   |
| Dashboard|  | $45,200  | |   342    | |   89     | |    12    |   |
| Agents   |  | Revenue  | | Bookings | | Agents   | | Pending  |   |
| Clients  |  | +15% MTD | | This Mo  | | Active   | | Actions  |   |
| Bookings |  +----------+ +----------+ +----------+ +----------+   |
| Tours    |                                                        |
| Withdraw |  +----------------------------------------------------+|
| Settings |  |          REVENUE CHART (12 months)                 ||
| Reports  |  |          [Line chart visualization]                ||
|          |  +----------------------------------------------------+|
|          |                                                        |
|          |  PENDING ACTIONS                                       |
|          |  +------------------------+ +------------------------+ |
|          |  | Agent Approvals    5   | | Withdrawals       7   | |
|          |  | [View All]             | | [View All]            | |
|          |  +------------------------+ +------------------------+ |
|          |                                                        |
|          |  RECENT ACTIVITY                                       |
|          |  [Activity feed list...]                               |
|          |                                                        |
+----------+-------------------------------------------------------+
```

#### Components
- `AdminSidebar` - Collapsible navigation
- `PlatformStatsGrid` - Key metrics
- `RevenueChart` - Revenue trend line chart
- `PendingActionsCards` - Action items
- `ActivityFeed` - Recent platform activity

#### Data Requirements
```typescript
interface AdminDashboardData {
  stats: {
    revenue: { current: number; change: number; period: string }
    bookings: { current: number; change: number; period: string }
    agents: { active: number; pending: number }
    clients: { total: number; newThisMonth: number }
  }
  pendingActions: {
    agentApprovals: number
    withdrawals: number
    flaggedTours: number
    reportedReviews: number
  }
  revenueChart: {
    month: string
    gross: number
    commission: number
  }[]
  recentActivity: ActivityItem[]
}
```

---

### 2. Manage Agents (`/admin/agents`)

#### Layout
```
+------------------------------------------------------------------+
|  Manage Agents                                                    |
+------------------------------------------------------------------+
|  +----------+ +----------+ +----------+ +----------+              |
|  |    89    | |    72    | |     5    | |    12    |              |
|  |  Total   | |  Active  | | Pending  | |Suspended |              |
|  +----------+ +----------+ +----------+ +----------+              |
+------------------------------------------------------------------+
|  Filters:                                                         |
|  Status: [All v]  Search: [                    ]  [Export CSV]    |
+------------------------------------------------------------------+
|                                                                   |
|  | Company        | Email           | Status    | Tours | Action |
|  |----------------|-----------------|-----------|-------|--------|
|  | Safari Co.     | safari@mail.com | APPROVED  |  12   | [...]  |
|  | Wild Tours     | wild@mail.com   | PENDING   |   0   | [...]  |
|  | Nature Exp.    | nature@mail.com | SUSPENDED |   8   | [...]  |
|                                                                   |
|  [< Prev]  Page 1 of 5  [Next >]                                  |
+------------------------------------------------------------------+
```

#### Agent Actions
```typescript
const agentActions = [
  { label: "View Details", action: "view", icon: Eye },
  { label: "Approve", action: "approve", show: "PENDING", icon: Check },
  { label: "Suspend", action: "suspend", show: "APPROVED", icon: Ban },
  { label: "Activate", action: "activate", show: "SUSPENDED", icon: CheckCircle },
  { label: "Edit Commission", action: "commission", icon: Percent },
  { label: "Reset Password", action: "resetPassword", icon: Key },
  { label: "Delete", action: "delete", icon: Trash, variant: "destructive" },
]
```

#### Agent Detail Modal/Page
```
+------------------------------------------------------------------+
|  Safari Adventures Kenya                              [Actions v] |
+------------------------------------------------------------------+
|  Status: [APPROVED]  |  Joined: Jan 15, 2026  |  Verified         |
+------------------------------------------------------------------+
|  [Overview] [Tours] [Bookings] [Documents] [Activity]            |
+------------------------------------------------------------------+
|                                                                   |
|  BUSINESS INFORMATION                                             |
|  Name: Safari Adventures Kenya                                    |
|  Reg #: KE-2024-TOUR-1234                                         |
|  Phone: +254 700 000 000                                          |
|  Email: contact@safariadventures.co.ke                            |
|                                                                   |
|  PERFORMANCE                                                      |
|  +----------+ +----------+ +----------+ +----------+              |
|  |   12     | |  $8,400  | |   4.8    | |    45    |              |
|  | Tours    | | Earnings | | Rating   | | Bookings |              |
|  +----------+ +----------+ +----------+ +----------+              |
|                                                                   |
|  COMMISSION                                                       |
|  Current Rate: 12% (Premium Tier)                                 |
|  [Adjust Rate]                                                    |
|                                                                   |
|  ADMIN NOTES                                                      |
|  [Add note...]                                                    |
|                                                                   |
+------------------------------------------------------------------+
```

---

### 3. All Bookings (`/admin/bookings`)

#### Layout
```
+------------------------------------------------------------------+
|  All Bookings                                                     |
+------------------------------------------------------------------+
|  +----------+ +----------+ +----------+ +----------+              |
|  |   342    | |    28    | |    15    | |   $45K   |              |
|  |  Total   | |  Today   | | Pending  | | Revenue  |              |
|  +----------+ +----------+ +----------+ +----------+              |
+------------------------------------------------------------------+
|  Filters:                                                         |
|  Status: [All v]  Agent: [All v]  Date: [Last 30 days v]         |
|  Payment: [All v]  Amount: [$0 - $10,000]                        |
+------------------------------------------------------------------+
|                                                                   |
|  | Ref       | Client    | Agent      | Tour      | Date   | $   |
|  |-----------|-----------|------------|-----------|--------|-----|
|  | SP2601-X7 | John D.   | Safari Co. | Masai     | Aug 15 | 450 |
|  |           | CONFIRMED | PAID       |           |        |     |
|  |-----------|-----------|------------|-----------|--------|-----|
|  | SP2601-Y3 | Sarah M.  | Wild Tours | Amboseli  | Aug 22 | 890 |
|  |           | PENDING   | UNPAID     |           |        |     |
|                                                                   |
|  [Export CSV]                          [< Prev] [Next >]          |
+------------------------------------------------------------------+
```

---

### 4. Withdrawals (`/admin/withdrawals`)

#### Layout
```
+------------------------------------------------------------------+
|  Withdrawal Requests                                              |
+------------------------------------------------------------------+
|  +----------+ +----------+ +----------+ +----------+              |
|  |    12    | |     7    | |  $8,500  | |  $125K   |              |
|  | Pending  | | This Wk  | | Pending  | | Processed|              |
|  +----------+ +----------+ +----------+ +----------+              |
+------------------------------------------------------------------+
|  Filters:                                                         |
|  Status: [Pending v]  Agent: [All v]  Method: [All v]            |
+------------------------------------------------------------------+
|                                                                   |
|  | ID       | Agent          | Amount  | Method | Requested | Act|
|  |----------|----------------|---------|--------|-----------|-----|
|  | WD-001   | Safari Co.     | $2,000  | M-Pesa | Aug 10    |[Ap]|
|  |          | Bal: $4,250    |         |        |           |[Rj]|
|  |----------|----------------|---------|--------|-----------|-----|
|  | WD-002   | Wild Tours     | $1,500  | Bank   | Aug 9     |[Ap]|
|  |          | Bal: $3,200    |         |        |           |[Rj]|
|                                                                   |
+------------------------------------------------------------------+
```

#### Approval Modal
```
+------------------------------------------+
|  Approve Withdrawal                   X  |
+------------------------------------------+
|                                          |
|  Agent: Safari Adventures Kenya          |
|  Amount: $2,000.00                       |
|  Method: M-Pesa (+254 700 000 000)       |
|  Available Balance: $4,250.00            |
|                                          |
|  Transaction Reference *                 |
|  [MPESA-ABC123456                    ]   |
|                                          |
|  Notes (Optional)                        |
|  [                                   ]   |
|                                          |
|  [Cancel]            [Confirm Approval]  |
+------------------------------------------+
```

#### Rejection Modal
```
+------------------------------------------+
|  Reject Withdrawal                    X  |
+------------------------------------------+
|                                          |
|  Agent: Safari Adventures Kenya          |
|  Amount: $2,000.00                       |
|                                          |
|  Rejection Reason *                      |
|  [                                   ]   |
|  [                                   ]   |
|  Min 10 characters                       |
|                                          |
|  Agent will be notified via email.       |
|                                          |
|  [Cancel]              [Confirm Reject]  |
+------------------------------------------+
```

---

### 5. Commission Settings (`/admin/settings/commission`)

#### Layout
```
+------------------------------------------------------------------+
|  Commission Configuration                                         |
+------------------------------------------------------------------+
|                                                                   |
|  DEFAULT COMMISSION STRUCTURE                                     |
|                                                                   |
|  +--------------------------------------------------------------+|
|  | Tier     | Volume Range        | Rate | Status     | Action  ||
|  |----------|---------------------|------|------------|---------|
|  | Standard | $0 - $5,000/mo      | 15%  | Active     | [Edit]  ||
|  | Premium  | $5,001 - $20,000/mo | 12%  | Active     | [Edit]  ||
|  | Elite    | $20,001+/mo         | 10%  | Active     | [Edit]  ||
|  +--------------------------------------------------------------+|
|                                                                   |
|  [+ Add Tier]                                                     |
|                                                                   |
|  COMMISSION SUMMARY                                               |
|  +----------+ +----------+ +----------+                           |
|  | $45,200  | |  $5,850  | |   13%    |                           |
|  | Gross    | | Commiss. | | Avg Rate |                           |
|  +----------+ +----------+ +----------+                           |
|                                                                   |
|  COMMISSION HISTORY                                               |
|  +--------------------------------------------------------------+|
|  | Date       | Change                    | By          |        |
|  |------------|---------------------------|-------------|--------|
|  | Aug 10     | Premium rate 12% -> 12%   | admin@...   |        |
|  | Jul 1      | Added Elite tier at 10%   | admin@...   |        |
|  +--------------------------------------------------------------+|
|                                                                   |
+------------------------------------------------------------------+
```

#### Edit Tier Modal
```
+------------------------------------------+
|  Edit Commission Tier                 X  |
+------------------------------------------+
|                                          |
|  Tier Name: Premium                      |
|                                          |
|  Volume Range                            |
|  Min: $[5,001        ]                   |
|  Max: $[20,000       ] (blank = no max)  |
|                                          |
|  Commission Rate                         |
|  [12] %                                  |
|                                          |
|  Status                                  |
|  [x] Active                              |
|                                          |
|  [Cancel]                     [Save]     |
+------------------------------------------+
```

---

### 6. Reports (`/admin/reports`)

#### Layout
```
+------------------------------------------------------------------+
|  Reports                                                          |
+------------------------------------------------------------------+
|                                                                   |
|  SELECT REPORT TYPE                                               |
|  +------------------+ +------------------+ +------------------+   |
|  | Revenue Report   | | Bookings Report  | | Agent Perf.      |   |
|  | [Generate]       | | [Generate]       | | [Generate]       |   |
|  +------------------+ +------------------+ +------------------+   |
|  +------------------+ +------------------+                        |
|  | Tour Performance | | User Growth      |                        |
|  | [Generate]       | | [Generate]       |                        |
|  +------------------+ +------------------+                        |
|                                                                   |
|  DATE RANGE                                                       |
|  [Aug 1, 2026] to [Aug 31, 2026]  [Custom v]                      |
|                                                                   |
+------------------------------------------------------------------+
|                                                                   |
|  REVENUE REPORT                                                   |
|                                                                   |
|  Summary                                                          |
|  +----------+ +----------+ +----------+ +----------+              |
|  | $45,200  | |  $5,850  | | $39,350  | |   342    |              |
|  |  Gross   | |  Comm.   | | Payouts  | | Bookings |              |
|  +----------+ +----------+ +----------+ +----------+              |
|                                                                   |
|  [Chart visualization]                                            |
|                                                                   |
|  Breakdown by Agent                                               |
|  | Agent          | Gross    | Commission | Net      | %    |    |
|  |----------------|----------|------------|----------|------|    |
|  | Safari Co.     | $12,500  | $1,625     | $10,875  | 28%  |    |
|  | Wild Tours     | $8,900   | $1,157     | $7,743   | 20%  |    |
|                                                                   |
|  [Export PDF]  [Export CSV]  [Export Excel]                       |
|                                                                   |
+------------------------------------------------------------------+
```

---

## Shared Components

### AdminLayout
```tsx
// components/layout/AdminLayout.tsx
export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <AdminSidebar isOpen={sidebarOpen} />
        <main className={cn(
          "flex-1 p-6 transition-all",
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        )}>
          {children}
        </main>
      </div>
    </div>
  )
}
```

### AdminSidebar
```tsx
// components/layout/AdminSidebar.tsx
const sidebarItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/agents", icon: Users, label: "Agents", badge: 5 },
  { href: "/admin/clients", icon: UserCircle, label: "Clients" },
  { href: "/admin/bookings", icon: Calendar, label: "Bookings" },
  { href: "/admin/tours", icon: Map, label: "Tours" },
  { href: "/admin/withdrawals", icon: Wallet, label: "Withdrawals", badge: 7 },
  { divider: true },
  { href: "/admin/settings/commission", icon: Percent, label: "Commission" },
  { href: "/admin/reports", icon: BarChart3, label: "Reports" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
]
```

### DataTable
```tsx
// components/admin/DataTable.tsx
interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  isLoading?: boolean
  pagination?: PaginationState
  onPaginationChange?: (pagination: PaginationState) => void
  filters?: FilterState
  onFiltersChange?: (filters: FilterState) => void
  onExport?: () => void
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  pagination,
  onPaginationChange,
  filters,
  onFiltersChange,
  onExport,
}: DataTableProps<T>) {
  // Implementation using @tanstack/react-table
}
```

### StatCard
```tsx
// components/admin/StatCard.tsx
interface StatCardProps {
  title: string
  value: string | number
  change?: { value: number; label: string }
  icon?: LucideIcon
  variant?: "default" | "success" | "warning" | "danger"
}

export function StatCard({ title, value, change, icon: Icon, variant }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-gray-400" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={cn(
            "text-xs",
            change.value > 0 ? "text-green-600" : "text-red-600"
          )}>
            {change.value > 0 ? "+" : ""}{change.value}% {change.label}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
```

---

## State Management

### Admin Store
```typescript
// stores/admin-store.ts
interface AdminStore {
  // Dashboard
  dashboardData: AdminDashboardData | null
  isLoadingDashboard: boolean

  // Agents
  agents: Agent[]
  agentFilters: AgentFilters
  isLoadingAgents: boolean

  // Withdrawals
  withdrawals: Withdrawal[]
  withdrawalFilters: WithdrawalFilters
  isLoadingWithdrawals: boolean

  // Actions
  fetchDashboard: () => Promise<void>
  fetchAgents: (filters?: AgentFilters) => Promise<void>
  approveAgent: (id: string) => Promise<void>
  suspendAgent: (id: string, reason: string) => Promise<void>
  fetchWithdrawals: (filters?: WithdrawalFilters) => Promise<void>
  approveWithdrawal: (id: string, transactionRef: string) => Promise<void>
  rejectWithdrawal: (id: string, reason: string) => Promise<void>
}
```

---

## Report Generation

### Report Components
```tsx
// components/admin/reports/RevenueReport.tsx
interface RevenueReportProps {
  data: RevenueReportData
  dateRange: DateRange
}

export function RevenueReport({ data, dateRange }: RevenueReportProps) {
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Gross Revenue" value={formatCurrency(data.summary.gross)} />
        <StatCard title="Commission" value={formatCurrency(data.summary.commission)} />
        <StatCard title="Agent Payouts" value={formatCurrency(data.summary.payouts)} />
        <StatCard title="Bookings" value={data.summary.bookings} />
      </div>

      {/* Chart */}
      <RevenueChart data={data.chartData} />

      {/* Breakdown Table */}
      <RevenueBreakdownTable data={data.byAgent} />

      {/* Export Buttons */}
      <div className="flex gap-2">
        <Button onClick={() => exportPDF(data)}>Export PDF</Button>
        <Button onClick={() => exportCSV(data)}>Export CSV</Button>
        <Button onClick={() => exportExcel(data)}>Export Excel</Button>
      </div>
    </div>
  )
}
```

---

## Bulk Operations

### Bulk Action Pattern
```tsx
// components/admin/BulkActions.tsx
interface BulkActionsProps {
  selectedCount: number
  onApproveAll: () => void
  onRejectAll: () => void
  onExport: () => void
}

export function BulkActions({ selectedCount, onApproveAll, onRejectAll, onExport }: BulkActionsProps) {
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-lg p-4 flex items-center gap-4">
      <span className="text-sm font-medium">{selectedCount} selected</span>
      <Button size="sm" onClick={onApproveAll}>Approve All</Button>
      <Button size="sm" variant="destructive" onClick={onRejectAll}>Reject All</Button>
      <Button size="sm" variant="outline" onClick={onExport}>Export</Button>
    </div>
  )
}
```

---

## Audit Trail Display

### Activity Feed
```tsx
// components/admin/ActivityFeed.tsx
interface ActivityItem {
  id: string
  action: string
  entityType: string
  entityId: string
  userId: string
  userName: string
  timestamp: string
  details?: Record<string, any>
}

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-4">
          <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
          <div>
            <p className="text-sm">
              <span className="font-medium">{activity.userName}</span>
              {" "}{getActionLabel(activity.action)}{" "}
              <span className="text-primary">{activity.entityType} #{activity.entityId}</span>
            </p>
            <p className="text-xs text-gray-500">{formatRelativeTime(activity.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## Testing Checklist

- [ ] Dashboard loads with correct stats
- [ ] Agent list loads with pagination
- [ ] Agent approval flow works
- [ ] Agent suspension flow works
- [ ] Booking list filters work
- [ ] Withdrawal approval flow works
- [ ] Withdrawal rejection flow works
- [ ] Commission configuration saves
- [ ] Reports generate correctly
- [ ] CSV export works
- [ ] PDF export works
- [ ] Bulk actions work
- [ ] Real-time updates work

## Dependencies

- shadcn/ui components
- TanStack Query
- TanStack Table
- Zustand
- Recharts (charts)
- jsPDF (PDF export)
- xlsx (Excel export)

## MVP Phase
Phase 1 - Core MVP

## Estimated Effort
13 story points

## Approval
- [ ] User Approved
- Date:
- Notes:
