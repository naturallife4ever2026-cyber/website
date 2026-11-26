import { Activity, BarChart3, FileText, Home, Landmark, MapPinned, Settings, Users, X } from 'lucide-react'

const links = [
  ['Overview', Home], ['All Issues', FileText], ['AI Workflow', Activity],
  ['Community', Users], ['Issue Map', MapPinned], ['Departments', Landmark],
  ['Analytics', BarChart3], ['Settings', Settings]
]

export default function Sidebar({ active = 'Overview', open, onClose }) {
  return <>
    {open && <button aria-label="Close menu" onClick={onClose} className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#17102f] px-4 py-6 text-white transition-transform lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="mb-9 flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-600 text-xl font-black">♥</div>
          <div><div className="text-lg font-bold tracking-tight">SlumPulse <span className="text-violet-300">AI</span></div><div className="text-[11px] text-violet-200">For a Better Bharat</div></div>
        </div>
        <button onClick={onClose} className="lg:hidden"><X size={20}/></button>
      </div>
      <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-violet-300">Workspace</div>
      <nav className="space-y-1">
        {links.map(([label, Icon]) => <a key={label} href="#" onClick={e => e.preventDefault()} className={`nav-link !text-slate-200 ${active === label ? '!bg-violet-600 !text-white shadow-lg shadow-violet-950/30' : 'hover:!bg-white/10 hover:!text-white'}`}><Icon size={18}/>{label}</a>)}
      </nav>
      <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="mb-2 text-sm font-semibold">Every issue counts.</div>
        <p className="text-xs leading-5 text-violet-200">Every action creates impact. Together, we can build cleaner, safer neighbourhoods.</p>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-3/4 rounded-full bg-gradient-to-r from-fuchsia-400 to-violet-400"/></div>
      </div>
    </aside>
  </>
}
