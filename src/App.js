import { useState, useEffect, useMemo } from "react";
import { supabase } from "./supabase";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function genId(p) { return p + Date.now() + Math.random().toString(36).slice(2, 5); }

const SC = {
  available:   { bg: "#DCFCE7", text: "#166534", dot: "#22C55E" },
  rented:      { bg: "#DBEAFE", text: "#1E40AF", dot: "#3B82F6" },
  maintenance: { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
  completed:   { bg: "#F1F5F9", text: "#475569", dot: "#94A3B8" },
  active:      { bg: "#DBEAFE", text: "#1E40AF", dot: "#3B82F6" },
  upcoming:    { bg: "#F3E8FF", text: "#6B21A8", dot: "#A855F7" },
  scheduled:   { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
  good:        { bg: "#DCFCE7", text: "#166534", dot: "#22C55E" },
  fair:        { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
  worn:        { bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" },
  admin:       { bg: "#EDE9FE", text: "#5B21B6", dot: "#7C3AED" },
  readonly:    { bg: "#F1F5F9", text: "#475569", dot: "#94A3B8" },
};

const Badge = ({ status }) => {
  const c = SC[status] || SC.completed;
  return (
    <span style={{ background: c.bg, color: c.text, padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const iS = { width: "100%", padding: "9px 12px", border: "1.5px solid #E2E8F0", borderRadius: 8, fontSize: 14, color: "#1E293B", outline: "none", boxSizing: "border-box", background: "#fff", fontFamily: "inherit" };
const sS = { ...iS, cursor: "pointer" };

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{label}</label>
    {children}
  </div>
);

const Modal = ({ title, onClose, children, wide }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
    <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: wide ? 700 : 540, maxHeight: "92vh", overflow: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.35)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #F1F5F9", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0F172A" }}>{title}</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", fontSize: 22, lineHeight: 1, padding: 4 }}>✕</button>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  </div>
);

const Btn = ({ onClick, children, variant = "primary", disabled, small }) => {
  const V = {
    primary:   { background: "#1E40AF", color: "#fff", border: "none" },
    secondary: { background: "#F1F5F9", color: "#374151", border: "none" },
    danger:    { background: "#FEE2E2", color: "#DC2626", border: "none" },
    success:   { background: "#DCFCE7", color: "#166534", border: "none" },
    ghost:     { background: "transparent", color: "#64748B", border: "1.5px solid #E2E8F0" },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...V[variant], padding: small ? "5px 11px" : "9px 16px", borderRadius: 8, fontWeight: 600, fontSize: small ? 12 : 13, cursor: disabled ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: 6, opacity: disabled ? 0.6 : 1, whiteSpace: "nowrap", fontFamily: "inherit" }}>
      {children}
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════════════════════
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    const { data, error: err } = await supabase
      .from("app_users")
      .select("*")
      .eq("email", email.trim().toLowerCase())
      .single();
    if (err || !data) { setError("Invalid email or password."); setLoading(false); return; }
    if (data.password_hash !== `hash:${password}`) { setError("Invalid email or password."); setLoading(false); return; }
    onLogin(data);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0F172A 0%,#1E3A5F 60%,#0F172A 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI',system-ui,sans-serif", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 56, marginBottom: 10 }}>🚲</div>
          <h1 style={{ color: "#fff", fontSize: 30, fontWeight: 900, margin: 0, letterSpacing: "-1px" }}>BikeRent</h1>
          <p style={{ color: "#64748B", margin: "6px 0 0", fontSize: 14 }}>Admin Management System</p>
        </div>
        <div style={{ background: "#fff", borderRadius: 20, padding: 32, boxShadow: "0 32px 80px rgba(0,0,0,0.4)" }}>
          <h2 style={{ margin: "0 0 22px", fontSize: 18, fontWeight: 700, color: "#0F172A" }}>Sign In</h2>
          <form onSubmit={handle}>
            <Field label="Email">
              <input style={iS} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@bikerent.com" required />
            </Field>
            <Field label="Password">
              <input style={iS} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </Field>
            {error && <div style={{ background: "#FEE2E2", color: "#DC2626", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ width: "100%", padding: 12, background: "#1E40AF", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// APP SHELL
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("br_user")); } catch { return null; } });
  const [tab, setTab] = useState("dashboard");
  const [bikes, setBikes] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [appUsers, setAppUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const isAdmin = user?.role === "admin";

  const handleLogin = (u) => { localStorage.setItem("br_user", JSON.stringify(u)); setUser(u); };
  const handleLogout = () => { localStorage.removeItem("br_user"); setUser(null); };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [{ data: b }, { data: c }, { data: r }, { data: m }, { data: cu }, { data: au }] = await Promise.all([
        supabase.from("bikes").select("*").order("created_at"),
        supabase.from("components").select("*"),
        supabase.from("rentals").select("*").order("created_at", { ascending: false }),
        supabase.from("maintenance").select("*").order("scheduled_date"),
        supabase.from("customers").select("*").order("name"),
        supabase.from("app_users").select("id,email,name,role,created_at").order("created_at"),
      ]);
      const bikesWithComps = (b || []).map(bike => ({
        ...bike,
        components: (c || []).filter(x => x.bike_id === bike.id),
      }));
      setBikes(bikesWithComps);
      setRentals(r || []);
      setMaintenance(m || []);
      setCustomers(cu || []);
      setAppUsers(au || []);
    } catch (e) {
      console.error("Fetch error:", e);
    }
    setLoading(false);
  };

  useEffect(() => { if (user) fetchAll(); }, [user]); // eslint-disable-line

  if (!user) return <LoginPage onLogin={handleLogin} />;

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48 }}>🚲</div>
        <p style={{ color: "#64748B", marginTop: 12 }}>Loading…</p>
      </div>
    </div>
  );

  const tabs = [
    { id: "dashboard",  label: "Dashboard",   icon: "⊞" },
    { id: "bikes",      label: "Bikes",        icon: "🚲" },
    { id: "rentals",    label: "Rentals",      icon: "📋" },
    { id: "maint",      label: "Maintenance",  icon: "🔧" },
    { id: "calendar",   label: "Calendar",     icon: "📅" },
    { id: "customers",  label: "Customers",    icon: "👥" },
  ];

  const shared = { bikes, setBikes, rentals, setRentals, maintenance, setMaintenance, customers, setCustomers, appUsers, setAppUsers, fetchAll, modal, setModal, isAdmin };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Segoe UI',system-ui,sans-serif", background: "#F8FAFC" }}>
      <aside style={{ width: 220, background: "#0F172A", display: "flex", flexDirection: "column", flexShrink: 0, minHeight: "100vh" }}>
        <div style={{ padding: "24px 20px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 26 }}>🚲</span>
            <div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>BikeRent</div>
              <div style={{ color: "#475569", fontSize: 11 }}>Admin Panel</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "0 12px" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer", marginBottom: 2, textAlign: "left", fontWeight: 600, fontSize: 13, background: tab === t.id ? "#1E40AF" : "transparent", color: tab === t.id ? "#fff" : "#94A3B8", fontFamily: "inherit" }}>
              <span style={{ fontSize: 14 }}>{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "14px 20px", borderTop: "1px solid #1E293B" }}>
          <div style={{ color: "#94A3B8", fontSize: 12, marginBottom: 4 }}>{user.name}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Badge status={user.role} />
            <button onClick={handleLogout} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>Sign out</button>
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, overflow: "auto" }}>
        {!isAdmin && (
          <div style={{ background: "#FEF3C7", borderBottom: "1px solid #FDE68A", padding: "8px 24px", fontSize: 13, color: "#92400E" }}>
            🔒 You're in <strong>read-only</strong> mode. Contact an admin to make changes.
          </div>
        )}
        {tab === "dashboard" && <Dashboard {...shared} />}
        {tab === "bikes"     && <BikesTab  {...shared} />}
        {tab === "rentals"   && <RentalsTab {...shared} />}
        {tab === "maint"     && <MaintTab  {...shared} />}
        {tab === "calendar"  && <CalendarTab {...shared} />}
        {tab === "customers" && <CustomersTab {...shared} />}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function Dashboard({ bikes, rentals, maintenance, customers }) {
  const now = new Date();
  const yr = now.getFullYear();
  const mo = now.getMonth();

  const yearRentals = rentals.filter(r => new Date(r.start_date).getFullYear() === yr);
  const stats = [
    { label: "Total Rentals This Year", value: yearRentals.length,                                        color: "#22C55E", icon: "📦", sub: `${yr} total` },
    { label: "Active Now",              value: rentals.filter(r => r.status === "active").length,           color: "#3B82F6", icon: "🚴", sub: "Currently out" },
    { label: "Available Bikes",         value: bikes.filter(b => b.status === "available").length,          color: "#8B5CF6", icon: "✅", sub: `of ${bikes.length} fleet` },
    { label: "Pending Maintenance",     value: maintenance.filter(m => m.status === "scheduled").length,    color: "#F59E0B", icon: "🔧", sub: "Needs attention" },
  ];

  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthly = monthNames.map((m, i) => ({
    m,
    n: rentals.filter(r => { const d = new Date(r.start_date); return d.getFullYear() === yr && d.getMonth() === i; }).length,
  }));
  const mx = Math.max(...monthly.map(x => x.n), 1);

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#0F172A" }}>Dashboard</h1>
      <p style={{ margin: "0 0 26px", color: "#64748B", fontSize: 13 }}>Fleet overview — {yr}</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 14, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontWeight: 700, fontSize: 12, color: "#374151", marginTop: 4 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18 }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: 22, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h3 style={{ margin: "0 0 18px", fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Monthly Bookings — {yr}</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 120 }}>
            {monthly.map((d, i) => (
              <div key={d.m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <div style={{ fontSize: 9, color: "#374151", fontWeight: 600 }}>{d.n || ""}</div>
                <div style={{ width: "100%", background: i === mo ? "#1E40AF" : "#DBEAFE", borderRadius: "4px 4px 0 0", height: `${Math.max((d.n / mx) * 100, 4)}px`, transition: "height 0.3s" }} />
                <div style={{ fontSize: 9, color: "#94A3B8" }}>{d.m}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: "#fff", borderRadius: 14, padding: 22, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Fleet Status</h3>
          {["available", "rented", "maintenance"].map(s => {
            const n = bikes.filter(b => b.status === s).length;
            const pct = bikes.length ? Math.round((n / bikes.length) * 100) : 0;
            return (
              <div key={s} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#374151", textTransform: "capitalize" }}>{s}</span>
                  <span style={{ fontSize: 12, color: "#64748B" }}>{n}/{bikes.length}</span>
                </div>
                <div style={{ background: "#F1F5F9", borderRadius: 6, height: 7 }}>
                  <div style={{ background: SC[s].dot, height: 7, borderRadius: 6, width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 16, padding: "10px 12px", background: "#F8FAFC", borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: "#94A3B8" }}>Total Customers</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#0F172A" }}>{customers.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BIKES
// ═══════════════════════════════════════════════════════════════════════════════
function BikesTab({ bikes, fetchAll, rentals, customers, modal, setModal, isAdmin }) {
  const empty = { name: "", type: "City", color: "#3B82F6", status: "available", image_url: "", components: [] };
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const open  = () => { setForm(empty); setEditId(null); setModal("bike"); };
  const openE = (b) => { setForm({ ...b }); setEditId(b.id); setModal("bike"); };
  const close = () => { setModal(null); setEditId(null); };

  const save = async () => {
    setSaving(true);
    const data = { name: form.name, type: form.type, color: form.color, status: form.status, image_url: form.image_url || "" };
    let bikeId = editId;
    if (editId) {
      await supabase.from("bikes").update(data).eq("id", editId);
      await supabase.from("components").delete().eq("bike_id", editId);
    } else {
      bikeId = genId("b");
      await supabase.from("bikes").insert({ id: bikeId, ...data });
    }
    if (form.components?.length) {
      await supabase.from("components").insert(
        form.components.map(c => ({ id: genId("c"), bike_id: bikeId, name: c.name, condition: c.condition, last_replaced: c.last_replaced || null }))
      );
    }
    await fetchAll(); close(); setSaving(false);
  };

  const del  = async (id) => { await supabase.from("bikes").delete().eq("id", id); await fetchAll(); };
  const addC = () => setForm(f => ({ ...f, components: [...(f.components || []), { id: genId("c"), name: "", condition: "good", last_replaced: new Date().toISOString().slice(0, 10) }] }));
  const updC = (i, k, v) => { const c = [...form.components]; c[i] = { ...c[i], [k]: v }; setForm(f => ({ ...f, components: c })); };
  const remC = (i) => setForm(f => ({ ...f, components: f.components.filter((_, x) => x !== i) }));

  const getBookings = (bikeId) => {
    const now = new Date().toISOString().slice(0, 10);
    const all = rentals.filter(r => r.bike_id === bikeId);
    return {
      past:     all.filter(r => r.end_date < now).sort((a, b) => b.end_date.localeCompare(a.end_date)).slice(0, 1),
      upcoming: all.filter(r => r.start_date >= now).sort((a, b) => a.start_date.localeCompare(b.start_date)).slice(0, 2),
    };
  };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0F172A" }}>Bikes</h1>
          <p style={{ margin: "2px 0 0", color: "#64748B", fontSize: 13 }}>{bikes.length} in fleet</p>
        </div>
        {isAdmin && <Btn onClick={open}>+ Add Bike</Btn>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: 16 }}>
        {bikes.map(bike => {
          const { past, upcoming } = getBookings(bike.id);
          return (
            <div key={bike.id} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", border: "1px solid #F1F5F9", display: "flex", flexDirection: "column" }}>
              <div style={{ height: 155, background: `linear-gradient(135deg,${bike.color}22,${bike.color}55)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                {bike.image_url
                  ? <img src={bike.image_url} alt={bike.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                  : <span style={{ fontSize: 60, opacity: 0.35 }}>🚲</span>
                }
                <div style={{ position: "absolute", top: 10, right: 10 }}><Badge status={bike.status} /></div>
                <div style={{ position: "absolute", top: 12, left: 12, width: 12, height: 12, borderRadius: "50%", background: bike.color, border: "2px solid white", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
              </div>
              <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "#0F172A" }}>{bike.name}</div>
                  <div style={{ fontSize: 12, color: "#94A3B8" }}>{bike.type}</div>
                </div>
                {(bike.components || []).length > 0 && (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>Components</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                      {bike.components.map((c, i) => (
                        <span key={i} style={{ fontSize: 11, padding: "2px 7px", borderRadius: 10, background: SC[c.condition]?.bg, color: SC[c.condition]?.text }}>{c.name}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ borderTop: "1px solid #F8FAFC", paddingTop: 8, flex: 1 }}>
                  {past.length > 0 && (
                    <div style={{ marginBottom: 7 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>Last Booking</div>
                      {past.map(r => { const c = customers.find(x => x.id === r.customer_id); return <RentalChip key={r.id} r={r} cust={c} />; })}
                    </div>
                  )}
                  {upcoming.length > 0 && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>Upcoming ({upcoming.length})</div>
                      {upcoming.map(r => { const c = customers.find(x => x.id === r.customer_id); return <RentalChip key={r.id} r={r} cust={c} />; })}
                    </div>
                  )}
                  {past.length === 0 && upcoming.length === 0 && (
                    <div style={{ fontSize: 11, color: "#CBD5E1", textAlign: "center", padding: "6px 0" }}>No bookings yet</div>
                  )}
                </div>
                {isAdmin && (
                  <div style={{ display: "flex", gap: 7, marginTop: 2 }}>
                    <Btn onClick={() => openE(bike)} variant="secondary" small>✏️ Edit</Btn>
                    <Btn onClick={() => del(bike.id)} variant="danger" small>🗑</Btn>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {modal === "bike" && isAdmin && (
        <Modal title={editId ? "Edit Bike" : "Add Bike"} onClose={close} wide>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Name"><input style={iS} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Trek FX 3" /></Field>
            <Field label="Type">
              <select style={sS} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {["City","Mountain","Road","Hybrid","Fitness","Electric"].map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select style={sS} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {["available","rented","maintenance"].map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Accent Color">
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ width: 42, height: 38, borderRadius: 8, border: "1.5px solid #E2E8F0", cursor: "pointer" }} />
                <span style={{ fontSize: 13, color: "#64748B" }}>{form.color}</span>
              </div>
            </Field>
          </div>
          <Field label="Image URL (paste a direct image link)">
            <input style={iS} value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://example.com/bike.jpg" />
            {form.image_url && <img src={form.image_url} alt="preview" style={{ marginTop: 8, height: 80, borderRadius: 8, objectFit: "cover" }} onError={e => e.target.style.display = "none"} />}
          </Field>
          <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: "#374151" }}>Components</span>
              <Btn onClick={addC} variant="ghost" small>+ Add</Btn>
            </div>
            {(form.components || []).map((c, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8, marginBottom: 8 }}>
                <input style={iS} value={c.name} onChange={e => updC(i, "name", e.target.value)} placeholder="Name" />
                <select style={sS} value={c.condition} onChange={e => updC(i, "condition", e.target.value)}>
                  {["good","fair","worn"].map(s => <option key={s}>{s}</option>)}
                </select>
                <input type="date" style={iS} value={c.last_replaced || ""} onChange={e => updC(i, "last_replaced", e.target.value)} />
                <Btn onClick={() => remC(i)} variant="danger" small>🗑</Btn>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <Btn onClick={close} variant="secondary">Cancel</Btn>
            <button onClick={save} disabled={saving} style={{ flex: 2, padding: 10, background: "#1E40AF", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", color: "#fff", fontFamily: "inherit" }}>{saving ? "Saving…" : "Save Bike"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

const RentalChip = ({ r, cust }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F8FAFC", borderRadius: 7, padding: "4px 9px", marginBottom: 3, fontSize: 11 }}>
    <span style={{ fontWeight: 600, color: "#374151" }}>{cust?.name || "Unknown"}</span>
    <span style={{ color: "#94A3B8" }}>{r.start_date} → {r.end_date}</span>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// RENTALS
// ═══════════════════════════════════════════════════════════════════════════════
function RentalsTab({ rentals, fetchAll, bikes, customers, modal, setModal, isAdmin }) {
  const empty = { bike_id: "", customer_id: "", start_date: "", end_date: "", rental_type: "daily", status: "upcoming", notes: "" };
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const open  = () => { setForm(empty); setEditId(null); setModal("rental"); };
  const openE = (r) => { setForm({ ...r }); setEditId(r.id); setModal("rental"); };
  const close = () => { setModal(null); setEditId(null); };

  const save = async () => {
    setSaving(true);
    if (editId) await supabase.from("rentals").update(form).eq("id", editId);
    else await supabase.from("rentals").insert({ id: genId("r"), ...form });
    await fetchAll(); close(); setSaving(false);
  };

  const del = async (id) => { await supabase.from("rentals").delete().eq("id", id); await fetchAll(); };

  const filtered = useMemo(() => {
    let list = filter === "all" ? rentals : rentals.filter(r => r.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r => {
        const c = customers.find(x => x.id === r.customer_id);
        return c?.name?.toLowerCase().includes(q) || c?.email?.toLowerCase().includes(q);
      });
    }
    return list;
  }, [rentals, filter, search, customers]);

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0F172A" }}>Rentals</h1>
          <p style={{ margin: "2px 0 0", color: "#64748B", fontSize: 13 }}>{rentals.length} total</p>
        </div>
        {isAdmin && <Btn onClick={open}>+ New Rental</Btn>}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
        <input style={{ ...iS, maxWidth: 270, flex: "1 1 180px" }} value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search customer name or email…" />
        <div style={{ display: "flex", gap: 5 }}>
          {["all","active","upcoming","completed"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 13px", borderRadius: 20, border: "1.5px solid", fontSize: 12, fontWeight: 600, cursor: "pointer", background: filter === f ? "#1E40AF" : "#fff", color: filter === f ? "#fff" : "#64748B", borderColor: filter === f ? "#1E40AF" : "#E2E8F0", fontFamily: "inherit" }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#F8FAFC" }}>
              {["Customer","Bike","Dates","Status", isAdmin && "Actions"].filter(Boolean).map(h => (
                <th key={h} style={{ padding: "11px 15px", textAlign: "left", fontWeight: 700, color: "#374151", fontSize: 12, borderBottom: "1px solid #F1F5F9" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => {
              const bike = bikes.find(b => b.id === r.bike_id);
              const cust = customers.find(c => c.id === r.customer_id);
              return (
                <tr key={r.id} style={{ borderBottom: "1px solid #F8FAFC", background: i % 2 === 0 ? "#fff" : "#FAFAFE" }}>
                  <td style={{ padding: "11px 15px" }}>
                    <div style={{ fontWeight: 600, color: "#0F172A" }}>{cust?.name || "—"}</div>
                    <div style={{ fontSize: 11, color: "#94A3B8" }}>{cust?.email}</div>
                  </td>
                  <td style={{ padding: "11px 15px", color: "#374151" }}>{bike?.name || "—"}</td>
                  <td style={{ padding: "11px 15px" }}>
                    <div style={{ color: "#374151" }}>{r.start_date}</div>
                    <div style={{ fontSize: 11, color: "#94A3B8" }}>to {r.end_date}</div>
                  </td>
                  <td style={{ padding: "11px 15px" }}><Badge status={r.status} /></td>
                  {isAdmin && (
                    <td style={{ padding: "11px 15px" }}>
                      <div style={{ display: "flex", gap: 5 }}>
                        <Btn onClick={() => openE(r)} variant="secondary" small>✏️</Btn>
                        <Btn onClick={() => del(r.id)} variant="danger" small>🗑</Btn>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={6} style={{ padding: 28, textAlign: "center", color: "#94A3B8" }}>No rentals found</td></tr>}
          </tbody>
        </table>
      </div>

      {modal === "rental" && isAdmin && (
        <Modal title={editId ? "Edit Rental" : "New Rental"} onClose={close}>
          <Field label="Customer">
            <select style={sS} value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))}>
              <option value="">Select customer</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.email}</option>)}
            </select>
          </Field>
          <Field label="Bike">
            <select style={sS} value={form.bike_id} onChange={e => setForm(f => ({ ...f, bike_id: e.target.value }))}>
              <option value="">Select bike</option>
              {bikes.map(b => <option key={b.id} value={b.id}>{b.name} ({b.type}) — {b.status}</option>)}
            </select>
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Start Date"><input type="date" style={iS} value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} /></Field>
            <Field label="End Date"><input type="date" style={iS} value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} /></Field>
            <Field label="Type">
              <select style={sS} value={form.rental_type} onChange={e => setForm(f => ({ ...f, rental_type: e.target.value }))}>
                {["hourly","daily","weekly"].map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select style={sS} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {["upcoming","active","completed"].map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Notes"><textarea style={{ ...iS, minHeight: 55, resize: "vertical" }} value={form.notes || ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></Field>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn onClick={close} variant="secondary">Cancel</Btn>
            <button onClick={save} disabled={saving} style={{ flex: 2, padding: 10, background: "#1E40AF", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", color: "#fff", fontFamily: "inherit" }}>{saving ? "Saving…" : "Save Rental"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAINTENANCE
// ═══════════════════════════════════════════════════════════════════════════════
function MaintTab({ maintenance, fetchAll, bikes, modal, setModal, isAdmin }) {
  const empty = { bike_id: "", type: "Inspection", description: "", scheduled_date: "", status: "scheduled", cost: 0, technician_name: "" };
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const open  = () => { setForm(empty); setEditId(null); setModal("maint"); };
  const openE = (m) => { setForm({ ...m }); setEditId(m.id); setModal("maint"); };
  const close = () => { setModal(null); setEditId(null); };

  const save = async () => {
    setSaving(true);
    if (editId) await supabase.from("maintenance").update(form).eq("id", editId);
    else await supabase.from("maintenance").insert({ id: genId("m"), ...form });
    await fetchAll(); close(); setSaving(false);
  };

  const del      = async (id) => { await supabase.from("maintenance").delete().eq("id", id); await fetchAll(); };
  const markDone = async (id) => { await supabase.from("maintenance").update({ status: "completed" }).eq("id", id); await fetchAll(); };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0F172A" }}>Maintenance</h1>
          <p style={{ margin: "2px 0 0", color: "#64748B", fontSize: 13 }}>{maintenance.filter(m => m.status === "scheduled").length} scheduled</p>
        </div>
        {isAdmin && <Btn onClick={open}>+ Schedule</Btn>}
      </div>

      <div style={{ display: "grid", gap: 11 }}>
        {maintenance.map(m => {
          const bike = bikes.find(b => b.id === m.bike_id);
          return (
            <div key={m.id} style={{ background: "#fff", borderRadius: 12, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: m.status === "completed" ? "#DCFCE7" : "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                {m.status === "completed" ? "✅" : "🔧"}
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontWeight: 700, color: "#0F172A", fontSize: 14 }}>{m.type} — {bike?.name || "Unknown"}</div>
                <div style={{ color: "#64748B", fontSize: 12, marginTop: 1 }}>{m.description}</div>
                <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 3 }}>🗓 {m.scheduled_date} · 👤 {m.technician_name}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 800, fontSize: 17, color: "#0F172A", marginBottom: 3 }}>${m.cost}</div>
                <Badge status={m.status} />
              </div>
              {isAdmin && (
                <div style={{ display: "flex", gap: 6 }}>
                  {m.status === "scheduled" && <Btn onClick={() => markDone(m.id)} variant="success" small>✓ Done</Btn>}
                  <Btn onClick={() => openE(m)} variant="secondary" small>✏️</Btn>
                  <Btn onClick={() => del(m.id)} variant="danger" small>🗑</Btn>
                </div>
              )}
            </div>
          );
        })}
        {maintenance.length === 0 && <div style={{ textAlign: "center", padding: 36, color: "#94A3B8" }}>No records</div>}
      </div>

      {modal === "maint" && isAdmin && (
        <Modal title={editId ? "Edit" : "Schedule Maintenance"} onClose={close}>
          <Field label="Bike">
            <select style={sS} value={form.bike_id} onChange={e => setForm(f => ({ ...f, bike_id: e.target.value }))}>
              <option value="">Select bike</option>
              {bikes.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Type">
              <select style={sS} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {["Inspection","Repair","Service","Cleaning","Upgrade"].map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select style={sS} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {["scheduled","completed"].map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Date"><input type="date" style={iS} value={form.scheduled_date} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))} /></Field>
            <Field label="Cost ($)"><input type="number" style={iS} value={form.cost} onChange={e => setForm(f => ({ ...f, cost: +e.target.value }))} /></Field>
          </div>
          <Field label="Technician"><input style={iS} value={form.technician_name} onChange={e => setForm(f => ({ ...f, technician_name: e.target.value }))} placeholder="Mike T." /></Field>
          <Field label="Description"><textarea style={{ ...iS, minHeight: 60, resize: "vertical" }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></Field>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn onClick={close} variant="secondary">Cancel</Btn>
            <button onClick={save} disabled={saving} style={{ flex: 2, padding: 10, background: "#1E40AF", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", color: "#fff", fontFamily: "inherit" }}>{saving ? "Saving…" : "Save"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CALENDAR
// ═══════════════════════════════════════════════════════════════════════════════
function CalendarTab({ rentals, bikes, customers }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const MN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dim = new Date(year, month + 1, 0).getDate();
  const fd  = new Date(year, month, 1).getDay();

  const getDay = (d) => {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return rentals.filter(r => r.start_date <= date && r.end_date >= date);
  };

  const monthCount = rentals.filter(r => { const d = new Date(r.start_date); return d.getFullYear() === year && d.getMonth() === month; }).length;
  const yearCount  = rentals.filter(r => new Date(r.start_date).getFullYear() === year).length;

  const days = [];
  for (let i = 0; i < fd; i++) days.push(null);
  for (let d = 1; d <= dim; d++) days.push(d);

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0F172A" }}>Calendar</h1>
          <p style={{ margin: "2px 0 0", color: "#64748B", fontSize: 13 }}>Rental schedule</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Btn onClick={prev} variant="secondary" small>‹</Btn>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#0F172A", minWidth: 150, textAlign: "center" }}>{MN[month]} {year}</span>
          <Btn onClick={next} variant="secondary" small>›</Btn>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        {[{ label: `Bookings in ${MN[month]}`, value: monthCount, color: "#3B82F6" }, { label: `Bookings in ${year}`, value: yearCount, color: "#8B5CF6" }].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 12, padding: "12px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0F172A" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#94A3B8" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", background: "#F8FAFC" }}>
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
            <div key={d} style={{ padding: 9, textAlign: "center", fontSize: 11, fontWeight: 700, color: "#64748B" }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1, background: "#F1F5F9" }}>
          {days.map((day, i) => {
            const bk = day ? getDay(day) : [];
            const isT = day && year === now.getFullYear() && month === now.getMonth() && day === now.getDate();
            return (
              <div key={i} style={{ background: "#fff", minHeight: 80, padding: "5px 7px" }}>
                {day && (
                  <>
                    <div style={{ fontSize: 12, fontWeight: isT ? 800 : 500, color: isT ? "#fff" : "#374151", width: 22, height: 22, borderRadius: "50%", background: isT ? "#1E40AF" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 3 }}>{day}</div>
                    {bk.slice(0, 2).map(r => {
                      const bike = bikes.find(b => b.id === r.bike_id);
                      const cust = customers.find(c => c.id === r.customer_id);
                      return (
                        <div key={r.id} title={`${cust?.name || ""} — ${bike?.name || ""}`}
                          style={{ fontSize: 9, padding: "2px 5px", borderRadius: 3, marginBottom: 2, fontWeight: 600, background: (bike?.color || "#3B82F6") + "25", color: bike?.color || "#1E40AF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {cust?.name?.split(" ")[0] || bike?.name || "—"}
                        </div>
                      );
                    })}
                    {bk.length > 2 && <div style={{ fontSize: 9, color: "#94A3B8" }}>+{bk.length - 2}</div>}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
        {bikes.map(b => (
          <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#374151" }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: b.color, display: "inline-block" }} />
            {b.name}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOMERS
// ═══════════════════════════════════════════════════════════════════════════════
function CustomersTab({ customers, fetchAll, rentals, appUsers, modal, setModal, isAdmin }) {
  const [subTab, setSubTab] = useState("customers");
  const [custModal, setCustModal] = useState(false);
  const [userModal, setUserModal] = useState(false);
  const [custForm, setCustForm] = useState({ name: "", email: "", phone: "", instagram: "" });
  const [userForm, setUserForm] = useState({ name: "", email: "", password_hash: "", role: "readonly" });
  const [saving, setSaving] = useState(false);

  const sorted = useMemo(() => {
    return customers
      .map(c => ({ ...c, rentalCount: rentals.filter(r => r.customer_id === c.id).length }))
      .sort((a, b) => b.rentalCount - a.rentalCount);
  }, [customers, rentals]);

  const addCust = async () => {
    setSaving(true);
    const existing = customers.find(c => c.email?.toLowerCase() === custForm.email?.toLowerCase());
    if (existing) { alert("A customer with this email already exists."); setSaving(false); return; }
    await supabase.from("customers").insert({ id: genId("cu"), ...custForm });
    await fetchAll(); setCustModal(false); setSaving(false);
    setCustForm({ name: "", email: "", phone: "", instagram: "" });
  };

  const delCust = async (id) => { await supabase.from("customers").delete().eq("id", id); await fetchAll(); };

  const addUser = async () => {
    setSaving(true);
    await supabase.from("app_users").insert({
      name: userForm.name, email: userForm.email,
      password_hash: `hash:${userForm.password_hash}`, role: userForm.role,
    });
    await fetchAll(); setUserModal(false); setSaving(false);
    setUserForm({ name: "", email: "", password_hash: "", role: "readonly" });
  };

  const delUser = async (id) => { await supabase.from("app_users").delete().eq("id", id); await fetchAll(); };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0F172A" }}>Users & Customers</h1>
          <p style={{ margin: "2px 0 0", color: "#64748B", fontSize: 13 }}>{customers.length} customers · {appUsers.length} system users</p>
        </div>
        {isAdmin && (
          <div style={{ display: "flex", gap: 8 }}>
            {subTab === "customers" && <Btn onClick={() => setCustModal(true)}>+ Add Customer</Btn>}
            {subTab === "system"    && <Btn onClick={() => setUserModal(true)}>+ Add User</Btn>}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {[{ id: "customers", label: "Customers" }, { id: "system", label: "System Users" }].map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)} style={{ padding: "7px 18px", borderRadius: 20, border: "1.5px solid", fontSize: 13, fontWeight: 600, cursor: "pointer", background: subTab === t.id ? "#1E40AF" : "#fff", color: subTab === t.id ? "#fff" : "#64748B", borderColor: subTab === t.id ? "#1E40AF" : "#E2E8F0", fontFamily: "inherit" }}>
            {t.label}
          </button>
        ))}
      </div>

      {subTab === "customers" && (
        <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                {["Name","Email","Phone","Instagram","Rentals", isAdmin && ""].filter(Boolean).map(h => (
                  <th key={h} style={{ padding: "11px 15px", textAlign: "left", fontWeight: 700, color: "#374151", fontSize: 12, borderBottom: "1px solid #F1F5F9" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: "1px solid #F8FAFC", background: i % 2 === 0 ? "#fff" : "#FAFAFE" }}>
                  <td style={{ padding: "11px 15px", fontWeight: 600, color: "#0F172A" }}>{c.name}</td>
                  <td style={{ padding: "11px 15px", color: "#374151" }}>{c.email || "—"}</td>
                  <td style={{ padding: "11px 15px", color: "#374151" }}>{c.phone || "—"}</td>
                  <td style={{ padding: "11px 15px", color: "#3B82F6" }}>{c.instagram || "—"}</td>
                  <td style={{ padding: "11px 15px" }}>
                    <span style={{ background: "#EFF6FF", color: "#1E40AF", fontWeight: 700, fontSize: 13, padding: "3px 12px", borderRadius: 20 }}>{c.rentalCount}</span>
                  </td>
                  {isAdmin && <td style={{ padding: "11px 15px" }}><Btn onClick={() => delCust(c.id)} variant="danger" small>🗑</Btn></td>}
                </tr>
              ))}
              {sorted.length === 0 && <tr><td colSpan={6} style={{ padding: 28, textAlign: "center", color: "#94A3B8" }}>No customers yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {subTab === "system" && (
        <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                {["Name","Email","Role","Created", isAdmin && ""].filter(Boolean).map(h => (
                  <th key={h} style={{ padding: "11px 15px", textAlign: "left", fontWeight: 700, color: "#374151", fontSize: 12, borderBottom: "1px solid #F1F5F9" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appUsers.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: "1px solid #F8FAFC", background: i % 2 === 0 ? "#fff" : "#FAFAFE" }}>
                  <td style={{ padding: "11px 15px", fontWeight: 600, color: "#0F172A" }}>{u.name}</td>
                  <td style={{ padding: "11px 15px", color: "#374151" }}>{u.email}</td>
                  <td style={{ padding: "11px 15px" }}><Badge status={u.role} /></td>
                  <td style={{ padding: "11px 15px", color: "#94A3B8", fontSize: 12 }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  {isAdmin && <td style={{ padding: "11px 15px" }}><Btn onClick={() => delUser(u.id)} variant="danger" small>🗑</Btn></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {custModal && isAdmin && (
        <Modal title="Add Customer" onClose={() => setCustModal(false)}>
          <Field label="Full Name"><input style={iS} value={custForm.name} onChange={e => setCustForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Doe" /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Email"><input style={iS} value={custForm.email} onChange={e => setCustForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@email.com" /></Field>
            <Field label="Phone"><input style={iS} value={custForm.phone} onChange={e => setCustForm(f => ({ ...f, phone: e.target.value }))} placeholder="555-0000" /></Field>
          </div>
          <Field label="Instagram"><input style={iS} value={custForm.instagram} onChange={e => setCustForm(f => ({ ...f, instagram: e.target.value }))} placeholder="@janedoe" /></Field>
          <div style={{ background: "#EFF6FF", borderRadius: 9, padding: "9px 13px", fontSize: 12, color: "#1E40AF", marginBottom: 16 }}>
            ℹ️ Register each customer once. When they book again, select them from the rental form dropdown.
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={() => setCustModal(false)} variant="secondary">Cancel</Btn>
            <button onClick={addCust} disabled={saving} style={{ flex: 2, padding: 10, background: "#1E40AF", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", color: "#fff", fontFamily: "inherit" }}>{saving ? "Saving…" : "Add Customer"}</button>
          </div>
        </Modal>
      )}

      {userModal && isAdmin && (
        <Modal title="Add System User" onClose={() => setUserModal(false)}>
          <Field label="Full Name"><input style={iS} value={userForm.name} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Admin" /></Field>
          <Field label="Email"><input style={iS} value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@bikerent.com" /></Field>
          <Field label="Password"><input type="password" style={iS} value={userForm.password_hash} onChange={e => setUserForm(f => ({ ...f, password_hash: e.target.value }))} placeholder="Choose a password" /></Field>
          <Field label="Role">
            <select style={sS} value={userForm.role} onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))}>
              <option value="readonly">Read Only — view only, no edits</option>
              <option value="admin">Admin — full access + manage users</option>
            </select>
          </Field>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn onClick={() => setUserModal(false)} variant="secondary">Cancel</Btn>
            <button onClick={addUser} disabled={saving} style={{ flex: 2, padding: 10, background: "#1E40AF", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", color: "#fff", fontFamily: "inherit" }}>{saving ? "Saving…" : "Add User"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
