import { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, Bell, CheckCircle2,
  ChevronDown, ChevronLeft, ChevronRight, ClipboardList, Clock3, Download,
  FileCheck2, Filter, LayoutDashboard, LogOut, MapPin, Menu, MoreHorizontal,
  Plus, Search, Settings, ShieldCheck, Sparkles, Users, X, Building2, Eye,
  RefreshCw, SlidersHorizontal, CircleHelp, PanelLeftClose
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "./api";

const moneylessStats = [
  { label: "Total complaints", key: "total", icon: ClipboardList, color: "violet", delta: "All registered issues" },
  { label: "Pending review", key: "pending", icon: Clock3, color: "amber", delta: "Awaiting action" },
  { label: "In progress", key: "inProgress", icon: Activity, color: "blue", delta: "Assigned to teams" },
  { label: "Resolved", key: "resolved", icon: CheckCircle2, color: "green", delta: "Successfully closed" }
];
const chartData = [
  { day: "Mon", reports: 18, resolved: 11 }, { day: "Tue", reports: 25, resolved: 17 },
  { day: "Wed", reports: 20, resolved: 14 }, { day: "Thu", reports: 32, resolved: 21 },
  { day: "Fri", reports: 27, resolved: 20 }, { day: "Sat", reports: 38, resolved: 25 },
  { day: "Sun", reports: 30, resolved: 24 }
];
const statuses = ["SUBMITTED", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "REJECTED"];
const pretty = value => (value || "").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

function Login({ onLogin }) {
  const [email, setEmail] = useState("admin@slumpulse.ai");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError("");
    try { const { data } = await api.post("/auth/login", { email, password }); localStorage.setItem("slumpulse_token", data.token); onLogin(data.user); }
    catch (err) { setError(err.response?.data?.message || "Could not connect to the server."); }
    finally { setBusy(false); }
  }
  return <div className="login-page"><div className="login-card">
    <div className="brand-mark large">S</div><div className="eyebrow">CIVIC INTELLIGENCE PLATFORM</div>
    <h1>Welcome back</h1><p className="muted">Sign in to the SlumPulse AI government portal.</p>
    <form onSubmit={submit} className="login-form">
      <label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
      <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>
      {error && <div className="error-box">{error}</div>}
      <button className="primary-btn full" disabled={busy}>{busy ? "Signing in..." : "Sign in to dashboard"}</button>
    </form><div className="demo-hint"><ShieldCheck size={16}/> Demo access is prefilled for local development.</div>
  </div></div>;
}

function App() {
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [activeNav, setActiveNav] = useState("Overview");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [evidenceFile, setEvidenceFile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("slumpulse_token");
    if (token) api.get("/dashboard/summary").then(() => setUser({ name: "Government Administrator", email: "admin@slumpulse.ai" })).catch(() => localStorage.removeItem("slumpulse_token"));
  }, []);

  async function loadData() {
    try {
      const [s, c, d] = await Promise.all([
        api.get("/dashboard/summary"),
        api.get("/complaints", { params: { q: search, status: statusFilter, priority: priorityFilter } }),
        api.get("/departments")
      ]);
      setSummary(s.data); setComplaints(c.data); setDepartments(d.data);
    } catch (err) { setNotice(err.response?.data?.message || "Unable to load dashboard data."); }
  }
  useEffect(() => { if (user) loadData(); }, [user, search, statusFilter, priorityFilter]);

  async function openComplaint(item) {
    setSelected(item); setDetail(null); setAiResult(null);
    try { const { data } = await api.get(`/complaints/${item.id}`); setDetail(data); }
    catch { setNotice("Could not load complaint details."); }
  }
  async function updateComplaint(payload) {
    if (!detail) return;
    setBusy(true);
    try {
      await api.patch(`/complaints/${detail.id}`, payload);
      await loadData(); await openComplaint({ ...detail, ...payload });
      setNotice("Complaint updated successfully.");
    } catch (err) { setNotice(err.response?.data?.message || "Update failed."); }
    finally { setBusy(false); }
  }
  async function runAI() {
    if (!detail) return;
    setBusy(true); setAiResult(null);
    try {
      const form = new FormData();
      if (evidenceFile) form.append("image", evidenceFile);
      const { data } = await api.post(`/complaints/${detail.id}/analyze`, form, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      await loadData(); await openComplaint(detail);
      setAiResult(data.result); setEvidenceFile(null);
    } catch (err) { setNotice(err.response?.data?.message || "AI analysis failed."); }
    finally { setBusy(false); }
  }
  function logout() { localStorage.removeItem("slumpulse_token"); setUser(null); }
  const filteredTitle = activeNav === "Overview" ? "Dashboard overview" : activeNav;
  const highCount = summary?.highPriority ?? 0;
  const navItems = [
    { label: "Overview", icon: LayoutDashboard }, { label: "Complaints", icon: ClipboardList },
    { label: "Departments", icon: Building2 }, { label: "AI Verification", icon: Sparkles },
    { label: "Reports & Analytics", icon: Activity }
  ];

  if (!user) return <Login onLogin={setUser} />;

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? "show" : ""}`}>
      <div className="brand"><div className="brand-mark">S</div><div><strong>SlumPulse<span> AI</span></strong><small>GOVERNMENT PORTAL</small></div><button className="mobile-close icon-btn" onClick={()=>setMobileNav(false)}><X/></button></div>
      <div className="workspace"><div className="workspace-avatar">PA</div><div><b>Patna Administration</b><small>Bihar, India</small></div><ChevronDown size={15}/></div>
      <div className="nav-caption">WORKSPACE</div>
      <nav>{navItems.map(item => <button key={item.label} className={`nav-link ${activeNav===item.label?"active":""}`} onClick={()=>{setActiveNav(item.label);setMobileNav(false);}}><item.icon size={18}/><span>{item.label}</span>{item.label==="Complaints"&&<span className="nav-count">{summary?.total ?? 0}</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CircleHelp size={17}/></div><b>Need assistance?</b><p>Visit the admin help centre for guidance.</p><button onClick={()=>setNotice("Help centre: contact your system administrator.")}>Open help centre <ChevronRight size={14}/></button></div><button className="nav-link" onClick={()=>setNotice("Settings are not included in this MVP.")}><Settings size={18}/>Settings</button><div className="profile-mini"><div className="avatar">GA</div><div><b>{user.name}</b><small>Administrator</small></div><button className="icon-btn" onClick={logout} title="Sign out"><LogOut size={17}/></button></div></div>
    </aside>

    <main className="main-area">
      <header className="topbar"><div className="top-left"><button className="icon-btn menu-btn" onClick={()=>setMobileNav(true)}><Menu/></button><div className="breadcrumb">Workspace <ChevronRight size={14}/> <b>{activeNav}</b></div></div><div className="top-actions"><div className="system-pill"><span className="live-dot"></span> System operational</div><button className="icon-btn notification-btn" onClick={()=>setNotice("You are all caught up.")}><Bell size={19}/><i></i></button><div className="top-avatar">GA</div></div></header>
      <div className="content">
        <div className="page-heading"><div><div className="eyebrow">THURSDAY, 26 NOVEMBER 2026 · PATNA, BIHAR</div><h1>{filteredTitle}</h1><p className="muted">Monitor civic issues, coordinate departments and improve community response.</p></div><div className="heading-actions"><button className="secondary-btn" onClick={loadData}><RefreshCw size={16}/> Refresh</button><button className="primary-btn" onClick={()=>setActiveNav("Complaints")}><Plus size={17}/> View complaints</button></div></div>

        {notice && <div className="notice"><span>{notice}</span><button onClick={()=>setNotice("")}><X size={15}/></button></div>}

        {activeNav==="Overview" && <>
          <div className="stats-grid">
            {moneylessStats.map(s=><div className="stat-card" key={s.key}><div className="stat-top"><div className={`stat-icon ${s.color}`}><s.icon size={19}/></div><span className="stat-period">Live data</span></div><div className="stat-value">{summary?.[s.key] ?? "—"}</div><div className="stat-bottom"><b>{s.label}</b><span>{s.delta}</span></div></div>)}
          </div>
          <div className="alert-strip"><div className="alert-icon"><AlertTriangle size={19}/></div><div><b>{highCount} high-priority complaints need attention</b><span>Review urgent public infrastructure and sanitation issues.</span></div><button onClick={()=>{setPriorityFilter("HIGH");setActiveNav("Complaints")}}>Review urgent issues <ChevronRight size={15}/></button></div>
          <div className="dashboard-grid">
            <section className="panel chart-panel"><div className="panel-heading"><div><h3>Complaint activity</h3><p>Reports received and resolved over the week</p></div><button className="select-like">Last 7 days <ChevronDown size={14}/></button></div><div className="chart-legend"><span><i className="legend-purple"></i> Reports</span><span><i className="legend-green"></i> Resolved</span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{top:10,right:10,left:-20,bottom:0}}><defs><linearGradient id="reportsFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7044d8" stopOpacity={0.22}/><stop offset="100%" stopColor="#7044d8" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#eeeef4" vertical={false}/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill:"#9293a5",fontSize:12}}/><YAxis axisLine={false} tickLine={false} tick={{fill:"#9293a5",fontSize:12}}/><Tooltip/><Area type="monotone" dataKey="reports" stroke="#7044d8" strokeWidth={2.5} fill="url(#reportsFill)"/><Area type="monotone" dataKey="resolved" stroke="#19a66a" strokeWidth={2.5} fill="transparent"/></AreaChart></ResponsiveContainer></div></section>
            <section className="panel priority-panel"><div className="panel-heading"><div><h3>Resolution snapshot</h3><p>Current complaint status</p></div><span className="tiny-badge">Live</span></div><div className="resolution-number">{summary?.resolutionRate ?? 0}<small>%</small></div><p className="muted">Overall resolution rate</p><div className="progress-track"><div style={{width:`${summary?.resolutionRate ?? 0}%`}}/></div><div className="snapshot-row"><span><i className="dot green-dot"></i> Resolved</span><b>{summary?.resolved ?? 0}</b></div><div className="snapshot-row"><span><i className="dot amber-dot"></i> Pending</span><b>{summary?.pending ?? 0}</b></div><div className="snapshot-row"><span><i className="dot blue-dot"></i> In progress</span><b>{summary?.inProgress ?? 0}</b></div></section>
          </div>
          <section className="panel table-panel"><div className="panel-heading"><div><h3>Recent complaints</h3><p>Latest issues submitted by citizens</p></div><button className="text-btn" onClick={()=>setActiveNav("Complaints")}>View all <ChevronRight size={15}/></button></div><ComplaintTable items={(summary?.recent||[])} onOpen={openComplaint}/></section>
          <section className="panel dept-panel"><div className="panel-heading"><div><h3>Department workload</h3><p>Complaints currently registered by department</p></div><button className="text-btn" onClick={()=>setActiveNav("Departments")}>All departments <ChevronRight size={15}/></button></div><div className="dept-grid">{(summary?.departments||[]).map((d,i)=><div className="dept-item" key={d.name}><div className="dept-symbol">{["♧","⌁","◉","⌂","ϟ","▦","◎"][i%7]}</div><div><b>{d.name}</b><small>{d.count} complaints</small></div><span className="dept-count">{d.count}</span></div>)}</div></section>
        </>}

        {activeNav==="Complaints" && <section className="panel full-panel"><div className="panel-heading"><div><h3>All complaints</h3><p>Review and manage citizen-reported issues</p></div><span className="tiny-badge">{complaints.length} records</span></div><div className="toolbar"><div className="search-box"><Search size={17}/><input placeholder="Search ID, issue or location..." value={search} onChange={e=>setSearch(e.target.value)}/></div><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="ALL">All statuses</option>{statuses.map(s=><option key={s} value={s}>{pretty(s)}</option>)}</select><select value={priorityFilter} onChange={e=>setPriorityFilter(e.target.value)}><option value="ALL">All priorities</option><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select></div><ComplaintTable items={complaints} onOpen={openComplaint}/></section>}

        {activeNav==="Departments" && <section className="panel full-panel"><div className="panel-heading"><div><h3>Government departments</h3><p>Department directory and complaint workload</p></div></div><div className="dept-grid departments-view">{(summary?.departments||[]).map((d,i)=><div className="dept-item" key={d.name}><div className="dept-symbol"><Building2 size={20}/></div><div><b>{d.name}</b><small>Responsible for civic issue response</small></div><span className="dept-count">{d.count}</span></div>)}</div></section>}

        {activeNav==="AI Verification" && <section className="panel full-panel"><div className="ai-banner"><div className="ai-banner-icon"><Sparkles size={24}/></div><div><h2>AI-assisted complaint verification</h2><p>Use Gemini to analyze complaint descriptions and uploaded evidence. Every result remains subject to administrator review.</p></div></div><div className="ai-steps">{["Issue classification","Severity recommendation","Department recommendation","Human review"].map((s,i)=><div className="ai-step" key={s}><div>{i+1}</div><b>{s}</b><small>{i===3?"Administrator confirms action":"AI-assisted processing"}</small></div>)}</div><h3 className="section-title">Complaints awaiting verification</h3><ComplaintTable items={complaints.filter(c=>!c.aiVerifiedAt)} onOpen={openComplaint}/></section>}

        {activeNav==="Reports & Analytics" && <section className="panel full-panel"><div className="panel-heading"><div><h3>Reports & analytics</h3><p>High-level performance indicators</p></div><button className="secondary-btn" onClick={()=>setNotice("CSV export will be added in the next development phase.")}><Download size={16}/> Export report</button></div><div className="stats-grid analytics-stats">{moneylessStats.map(s=><div className="stat-card" key={s.key}><div className={`stat-icon ${s.color}`}><s.icon size={19}/></div><div className="stat-value">{summary?.[s.key]??0}</div><b>{s.label}</b></div>)}</div><div className="panel-inner-note"><b>Data note</b><p>The chart on the overview page currently uses illustrative weekly sample values. Live KPI cards and complaint records are loaded from your local database.</p></div></section>}
        <footer className="footer"><span>© 2026 SlumPulse AI · Civic Intelligence Platform</span><span><span className="live-dot"></span> Secure administration workspace</span></footer>
      </div>
    </main>

    {selected && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget){setSelected(null);setDetail(null);}}}><div className="detail-modal"><div className="modal-head"><div><span className="eyebrow">COMPLAINT DETAILS</span><h2>{detail?.title || selected.title}</h2><span className="muted">{detail?.reference || selected.reference}</span></div><button className="icon-btn" onClick={()=>{setSelected(null);setDetail(null);}}><X/></button></div>
      {!detail ? <div className="loading-state">Loading complaint...</div> : <>
        <div className="detail-tags"><StatusPill value={detail.status}/><PriorityPill value={detail.priority}/><span className="tag neutral">{detail.category}</span></div>
        <div className="detail-info"><div><small>Reported by</small><b>{detail.citizenName}</b></div><div><small>Location</small><b><MapPin size={13}/> {detail.location}, {detail.ward}</b></div><div><small>Reported on</small><b>{new Date(detail.createdAt).toLocaleString("en-IN")}</b></div><div><small>Department</small><b>{detail.department?.name || "Not assigned"}</b></div></div>
        <div className="description-box"><b>Citizen description</b><p>{detail.description}</p></div>
        <div className="modal-section"><div className="section-heading"><h3><Sparkles size={17}/> AI verification</h3><button className="ai-button" disabled={busy} onClick={runAI}>{busy?<RefreshCw size={15} className="spin"/>:<Sparkles size={15}/>} Run AI verification</button></div>
          <label className="evidence-upload">Optional evidence image (JPG, PNG or WebP, max 5 MB)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setEvidenceFile(e.target.files?.[0] || null)}/>{evidenceFile && <small>Selected: {evidenceFile.name}</small>}</label>
          {detail.aiSummary ? <div className="ai-result"><div className="ai-result-top"><b>{detail.aiSource==="GEMINI"?"Gemini analysis":"Demo analysis"}</b><span>{Math.round((detail.aiConfidence||0)*100)}% confidence</span></div><p>{detail.aiSummary}</p><small>AI category: {detail.aiCategory} · Verify findings before taking action.</small></div> : <div className="empty-ai">No AI verification yet. Run analysis to generate a category, priority and department recommendation.</div>}
          {aiResult && <div className="ai-result fresh"><b>Latest result · {aiResult.source}</b><p>{aiResult.summary}</p><div className="ai-result-grid"><span>Category <b>{aiResult.category}</b></span><span>Priority <b>{aiResult.priority}</b></span><span>Confidence <b>{Math.round(aiResult.confidence*100)}%</b></span><span>Department <b>{aiResult.recommendedDepartment}</b></span></div><small>{aiResult.risk}</small></div>}
        </div>
        <div className="modal-section"><h3>Administrative actions</h3><div className="edit-grid"><label>Status<select value={detail.status} onChange={e=>updateComplaint({status:e.target.value,note:"Status updated by administrator"})}>{statuses.map(s=><option key={s} value={s}>{pretty(s)}</option>)}</select></label><label>Priority<select value={detail.priority} onChange={e=>updateComplaint({priority:e.target.value})}><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select></label><label className="wide-label">Assign department<select value={detail.departmentId||""} onChange={e=>updateComplaint({departmentId:e.target.value})}><option value="">Select department</option>{departments.map(d=><option value={d.id} key={d.id}>{d.name}</option>)}</select></label></div></div>
        <div className="history"><h3>Status history</h3>{(detail.history||[]).map(h=><div className="history-item" key={h.id}><span className="history-dot"></span><div><b>{pretty(h.status)}</b><small>{h.note}</small></div><time>{new Date(h.createdAt).toLocaleDateString("en-IN")}</time></div>)}</div>
      </>}
      <div className="modal-foot"><button className="secondary-btn" onClick={()=>{setSelected(null);setDetail(null);}}>Close</button><span className="muted">Changes save immediately</span></div>
    </div></div>}
  </div>;
}

function StatusPill({value}) { return <span className={`tag status-${(value||"").toLowerCase()}`}>{pretty(value)}</span>; }
function PriorityPill({value}) { return <span className={`tag priority-${(value||"").toLowerCase()}`}><i/> {pretty(value)}</span>; }
function ComplaintTable({items,onOpen}) {
  if (!items?.length) return <div className="empty-state"><ClipboardList size={28}/><b>No complaints found</b><span>Try changing your filters or search terms.</span></div>;
  return <div className="table-scroll"><table><thead><tr><th>COMPLAINT</th><th>LOCATION</th><th>PRIORITY</th><th>STATUS</th><th>DEPARTMENT</th><th></th></tr></thead><tbody>{items.map(c=><tr key={c.id} onClick={()=>onOpen(c)}><td><div className="complaint-cell"><b>{c.title}</b><small>{c.reference} · {c.citizenName}</small></div></td><td><div className="location-cell"><MapPin size={14}/><span>{c.location}<small>{c.ward}</small></span></div></td><td><PriorityPill value={c.priority}/></td><td><StatusPill value={c.status}/></td><td><span className="dept-name">{c.department?.name||"Unassigned"}</span></td><td><button className="row-action" onClick={e=>{e.stopPropagation();onOpen(c);}}><ChevronRight size={17}/></button></td></tr>)}</tbody></table></div>;
}

export default App;
