export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's an overview of your exam activity.
        </p>
      </div>

      <div className="grid gap-4 md:gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <div className="bg-card border border-border rounded-[10px] shadow-sm p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/30">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Total Exams</h3>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold">12</p>
            <p className="text-xs text-muted-foreground mt-1">+2 from last week</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-[10px] shadow-sm p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-success/5 hover:-translate-y-1 hover:border-success/30">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Documents</h3>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><polyline points="14 2 14 8 20 8"/><path d="M3 15h6"/><path d="M6 12v6"/></svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold">5</p>
            <p className="text-xs text-muted-foreground mt-1">Ready to use</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-[10px] shadow-sm p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-warning/5 hover:-translate-y-1 hover:border-warning/30">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Average Score</h3>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold">85%</p>
            <p className="text-xs text-success mt-1">+5% improvement</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[10px] shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <p className="text-muted-foreground text-sm">No recent activity to display.</p>
      </div>
    </div>
  )
}