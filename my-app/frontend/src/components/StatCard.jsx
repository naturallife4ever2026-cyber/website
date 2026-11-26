export default function StatCard({ label, value, change, icon: Icon, tone = 'violet' }) {
  const tones = {
    violet: 'bg-violet-100 text-violet-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-emerald-100 text-emerald-700',
    orange: 'bg-orange-100 text-orange-700'
  }
  return <div className="card p-5">
    <div className="flex items-start justify-between gap-3">
      <div><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p><p className="mt-2 text-xs text-emerald-600">{change}</p></div>
      <div className={`grid h-12 w-12 place-items-center rounded-2xl ${tones[tone]}`}><Icon size={23}/></div>
    </div>
  </div>
}
