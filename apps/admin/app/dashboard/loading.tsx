export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-8 w-40 bg-gray-200 rounded-lg" />
        <div className="h-4 w-56 bg-gray-100 rounded mt-2" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 h-28" />
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 h-64" />
    </div>
  )
}
