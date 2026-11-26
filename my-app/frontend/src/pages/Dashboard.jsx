import { useEffect, useState } from 'react'
import { Activity, AlertTriangle, ArrowUpRight, Bell, CheckCircle2, Clock3, FileText, Menu, Plus, RefreshCw, Users } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import StatCard from '../components/StatCard'
import { getHealth, getComplaints } from '../services/api'

const demoIssues = [
  { id: 'SP-1256', title: 'Open Drain / Sewage Overflow', place: 'Buddha Colony, Ward 12, Patna', category: 'Sanitation', priority: 'High', status: 'In progress', color: 'orange' },
  { id: 'SP-1189', title: 'Street Light Not Working', place: 'Rajendra Nagar, Ward 10, Patna', category: 'Electricity', priority: 'Medium', status: 'Resolved', color: 'green' },
  { id: 'SP-1156', title: 'Garbage Overflow', place: 'Kankarbagh, Ward 7, Patna', category: 'Sanitation', priority: 'High', status: 'Assigned', color: 'blue' },
  { id: 'SP-1102', title: 'Broken Road / Potholes', place: 'Buddha Colony Road, Ward 12', category: 'Roads & Infra', priority: 'Medium', status: 'Resolved', color: 'green' }
]

export default function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [apiStatus, setApiStatus] = useState('Checking...')
  const [issues, setIssues] = useState(demoIssues)
  const [source, setSource] = useState('Demo data')

  useEffect(() => {
    getHealth().then(() => setApiStatus('Backend connected')).catch(() => setApiStatus('Backend offline'))
    getComplaints().then(({ data }) => {
      if (data.length) {
        setIssues(data.map(x => ({ id: x.public_id, title: x.title, place: x.location_text || 'Location not provided', category: x.category, priority: x.priority, status: x.status, color: x.status === 'Resolved' ? 'green' : 'orange' })))
        setSource('Live database')
      }
    }).catch(() => {})
  }, [])

  return <div className="min-h-screen lg:flex">
    <Sidebar active="Overview" open={menuOpen} onClose={() => setMenuOpen(false)}/>
    <main className="min-w-0 flex-1">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-violet-100 bg-[#faf9fd]/90 px-5 py-4 backdrop-blur md:px-8">
        <div className="flex items-center gap-3">
          <button onClick={() => setMenuOpen(true)} className="rounded-xl p-2 hover:bg-violet-100 lg:hidden"><Menu/></button>
          <div><p className="text-xs font-medium text-violet-600">CITIZEN & GOVERNMENT PORTAL</p><h1 className="text-xl font-bold md:text-2xl">Government Dashboard</h1><p className="hidden text-sm text-slate-500 sm:block">A smarter view of community issues and impact.</p></div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:inline-flex"><span className="mr-2 mt-1 h-2 w-2 rounded-full bg-emerald-500"/>{apiStatus}</span>
          <button className="relative rounded-xl border border-violet-100 bg-white p-2.5 text-slate-600"><Bell size={19}/><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-fuchsia-500"/></button>
          <div className="hidden h-10 w-10 place-items-center rounded-full bg-violet-200 font-bold text-violet-800 sm:grid">SP</div>
        </div>
      </header>

      <div className="space-y-6 p-5 md:p-8">
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-lg font-bold">Overview</h2><p className="text-sm text-slate-500">Community snapshot · Patna, Bihar</p></div>
          <div className="flex gap-2"><span className="rounded-xl border border-violet-100 bg-white px-3 py-2 text-xs text-slate-600">01–30 November 2026</span><button className="inline-flex items-center gap-2 rounded-xl bg-pulse-700 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-200"><Plus size={16}/> New report</button></div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total issues" value="1,284" change="↑ 12.5% this month" icon={FileText}/>
          <StatCard label="In progress" value="326" change="↑ 8.2% this month" icon={RefreshCw} tone="blue"/>
          <StatCard label="Resolved" value="812" change="↑ 15.3% this month" icon={CheckCircle2} tone="green"/>
          <StatCard label="Avg. resolution time" value="2.4 days" change="↓ 1.2% this month" icon={Clock3} tone="orange"/>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-violet-50 p-5"><div><h3 className="font-bold">Community issue activity</h3><p className="text-xs text-slate-500">Illustrative activity overview</p></div><button className="text-sm font-semibold text-pulse-700">View reports <ArrowUpRight size={15} className="inline"/></button></div>
            <div className="grid gap-5 p-5 md:grid-cols-2">
              <div className="flex min-h-48 flex-col justify-between rounded-xl bg-gradient-to-br from-violet-50 via-indigo-50 to-orange-50 p-4">
                <div className="flex items-center justify-between"><span className="text-sm font-semibold">Issue hotspots</span><Activity className="text-violet-600"/></div>
                <div className="relative mx-auto grid h-28 w-full max-w-xs place-items-center overflow-hidden rounded-xl bg-white/60">
                  <div className="absolute h-24 w-24 rounded-full bg-orange-300/40 blur-xl"/><div className="absolute left-1/4 top-5 h-5 w-5 rounded-full bg-orange-400/70 blur-sm"/><div className="absolute right-1/4 top-8 h-8 w-8 rounded-full bg-rose-400/60 blur-md"/><div className="absolute bottom-3 left-1/2 h-7 w-7 rounded-full bg-yellow-400/70 blur-md"/>
                  <span className="z-10 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow">Patna • Demo map</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500"><span>Lower concentration</span><span className="font-semibold text-rose-600">Higher concentration</span></div>
              </div>
              <div><h4 className="mb-4 text-sm font-semibold">Top issue categories</h4>{[['Garbage',35,'bg-blue-500'],['Drainage',22,'bg-emerald-500'],['Water leakage',18,'bg-amber-500'],['Broken roads',15,'bg-rose-500'],['Street lights',10,'bg-violet-500']].map(([n,v,c]) => <div className="mb-4" key={n}><div className="mb-1.5 flex justify-between text-xs"><span className="text-slate-600">{n}</span><b>{v}%</b></div><div className="h-2 rounded-full bg-slate-100"><div className={`h-2 rounded-full ${c}`} style={{width:`${v}%`}}/></div></div>)}</div>
            </div>
          </div>
          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between"><div><h3 className="font-bold">AI agent activity</h3><p className="text-xs text-slate-500">Workflow service overview</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Demo mode</span></div>
            {[['Verification Agent','Image and issue analysis',CheckCircle2,'text-emerald-600'],['Location Agent','GPS and area validation',CheckCircle2,'text-emerald-600'],['Duplicate Agent','Similar complaint matching',Activity,'text-violet-600'],['Priority Agent','Severity assessment',AlertTriangle,'text-orange-500']].map(([name,desc,Icon,tone],i)=><div key={name} className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-0"><div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-50"><Icon size={18} className={tone}/></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{name}</p><p className="truncate text-xs text-slate-500">{desc}</p></div><span className="text-[11px] font-semibold text-slate-500">{i<2?'Ready':'Queued'}</span></div>)}
            <p className="mt-3 rounded-xl bg-violet-50 p-3 text-xs leading-5 text-violet-800">AI analysis will be activated in Phase 4 after connecting your Gemini API key.</p>
          </div>
        </section>

        <section className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-violet-50 p-5"><div><h3 className="font-bold">Recent community issues</h3><p className="text-xs text-slate-500">Latest complaint records · {source}</p></div><button className="text-sm font-semibold text-pulse-700">View all <ArrowUpRight size={15} className="inline"/></button></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Issue</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Priority</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Reference</th></tr></thead><tbody>{issues.map((issue)=><tr key={issue.id} className="border-t border-slate-100"><td className="px-5 py-4"><p className="font-semibold">{issue.title}</p><p className="mt-1 text-xs text-slate-500">{issue.place}</p></td><td className="px-5 py-4 text-slate-600">{issue.category}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${issue.priority==='High'?'bg-rose-50 text-rose-700':'bg-amber-50 text-amber-700'}`}>{issue.priority}</span></td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${issue.status==='Resolved'?'bg-emerald-50 text-emerald-700':'bg-orange-50 text-orange-700'}`}>{issue.status}</span></td><td className="px-5 py-4 font-mono text-xs text-slate-500">{issue.id}</td></tr>)}</tbody></table></div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-2 pb-4 text-xs text-slate-400"><span>© 2026 SlumPulse AI · Final-year project prototype</span><span>Sample dashboard figures are demonstration data.</span></footer>
      </div>
    </main>
  </div>
}
