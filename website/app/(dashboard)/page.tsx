export default function DashboardPage() {
  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
      <div className="aspect-video rounded-3xl bg-card/65 border border-white/10 backdrop-blur-xl p-6 flex flex-col justify-center items-center shadow-2xl hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.5)] transition-all duration-200">
        <h3 className="text-xl font-bold mb-2">Total Exams</h3>
        <p className="text-4xl font-bold text-primary">12</p>
      </div>
      <div className="aspect-video rounded-3xl bg-card/65 border border-white/10 backdrop-blur-xl p-6 flex flex-col justify-center items-center shadow-2xl hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.5)] transition-all duration-200">
        <h3 className="text-xl font-bold mb-2">Documents</h3>
        <p className="text-4xl font-bold text-primary">5</p>
      </div>
      <div className="aspect-video rounded-3xl bg-card/65 border border-white/10 backdrop-blur-xl p-6 flex flex-col justify-center items-center shadow-2xl hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.5)] transition-all duration-200">
        <h3 className="text-xl font-bold mb-2">Average Score</h3>
        <p className="text-4xl font-bold text-primary">85%</p>
      </div>
      
      <div className="min-h-[100vh] flex-1 rounded-3xl bg-card/65 border border-white/10 backdrop-blur-xl md:col-span-3 p-6 shadow-2xl">
         <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
         <p className="text-muted-foreground">No recent activity.</p>
      </div>
    </div>
  )
}