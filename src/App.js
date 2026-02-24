import { useState, useEffect, useMemo } from "react";
import { supabase } from "./supabase";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function genId(p) { return p + Date.now() + Math.random().toString(36).slice(2, 5); }

const statusColors = {
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
};

const Badge = ({ status }) => {
  const c = statusColors[status] || { bg: "#F1F5F9", text: "#475569", dot: "#94A3B8" };
  return (
    <span style={{ background: c.bg, color: c.text, padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot }} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const inputStyle = { width: "100%", padding: "9px 12px", border: "1.5px solid #E2E8F0", borderRadius: 8, fontSize: 14, color: "#1E293B", outline: "none", boxSizing: "border-box", background: "#fff" };
const selectStyle = { ...inputStyle, cursor: "pointer" };
const Field = ({ label, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{label}</label>
    {children}
  </div>
);

const Modal = ({ title, onClose, children, wide }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
    <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: wide ? 720 : 560, maxHeight: "92vh", overflow: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #F1F5F9", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0F172A" }}>{title}</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", fontSize: 20, lineHeight: 1 }}>✕</button>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  </div>
);

const Btn = ({ onClick, children, variant = "primary", disabled, small }) => {
  const styles = {
    primary:   { background: "#1E40AF", color: "#fff", border: "none" },
    secondary: { background: "#F1F5F9", color: "#374151", border: "none" },
    danger:    { background: "#FEE2E2", color: "#DC2626", border: "none" },
    success:   { background: "#DCFCE7", color: "#166534", border: "none" },
    ghost:     { background: "transparent", color: "#64748B", border: "1.5px solid #E2E8F0" },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...styles[variant], padding: small ? "6px 12px" : "9px 18px", borderRadius: 9, fontWeight: 600, fontSize: small ? 12 : 13, cursor: disabled ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: 6, opacity: disabled ? 0.6 : 1, whiteSpace: "nowrap" }}>
      {children}
    </button>
  );
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const icons = {
  dashboard: "⊞", bike: "🚲", calendar: "📅", wrench: "🔧", users: "👥",
  plus: "+", edit: "✏️", trash: "🗑", chevL: "‹", chevR: "›", lock: "🔒", logout: "→",
};

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    const { data, error: err } = await supabase.from("app_users").select("*").eq("email", email.trim().toLowerCase()).single();
    if (err || !data) { setError("Invalid email or password."); setLoading(false); return; }
    if (data.password_hash !== `hash:${password}`) { setError("Invalid email or password."); setLoading(false); return; }
    onLogin(data);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0F172A 0%, #1E3A5F 60%, #0F172A 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 400, padding: 16 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🚲</div>
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 900, margin: 0, letterSpacing: "-1px" }}>BikeRent</h1>
          <p style={{ color: "#64748B", margin: "6px 0 0", fontSize: 14 }}>Admin Management System</p>
        </div>
        <div style={{ background: "#fff", borderRadius: 20, padding: 32, boxShadow: "0 32px 80px rgba(0,0,0,0.4)" }}>
          <h2 style={{ margin: "0 0 24px", fontSize: 18, fontWeight: 700, color: "#0F172A" }}>Sign In</h2>
          <form onSubmit={handleLogin}>
            <Field label="Email">
              <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@bikerent.com" required />
            </Field>
            <Field label="Password">
              <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </Field>
            {error && <div style={{ background: "#FEE2E2", color: "#DC2626", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px", background: "#1E40AF", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <div style={{ marginTop: 20, padding: "12px 14px", background: "#F8FAFC", borderRadius: 10, fontSize: 12, color: "#64748B" }}>
            <div style={{ fontWeight: 700, marginBottom: 4, color: "#374151" }}>Demo accounts:</div>
            <div>Admin: admin@bikerent.com / admin123</div>
            <div>Viewer: viewer@bikerent.com / viewer123</div>
          </div>
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
    const [{ data: b }, { data: c }, { data: r }, { data: m }, { data: cu }, { data: au }] = await Promise.all([
      supabase.from("bikes").select("*").order("created_at"),
      supabase.from("components").select("*"),
      supabase.from("rentals").select("*").order("created_at", { ascending: false }),
      supabase.from("maintenance").select("*").order("scheduled_date"),
      supabase.from("customers").select("*").order("name"),
      supabase.from("app_users").select("id,email,name,role,created_at").order("created_at"),
    ]);
    const bikesWithComps = (b || []).map(bike => ({ ...bike, components: (c || []).filter(x => x.bike_id === bike.id) }));
    setBikes(bikesWithComps);
    setRentals(r || []);
    setMaintenance(m || []);
    setCustomers(cu || []);
    setAppUsers(au || []);
    setLoading(false);
  };

  useEffect(() => { if (user) fetchAll(); }, [user]);

  if (!user) return <LoginPage onLogin={handleLogin} />;
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: 48 }}>🚲</div><p style={{ color: "#64748B", marginTop: 12 }}>Loading...</p></div>
    </div>
  );

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "⊞" },
    { id: "bikes", label: "Bikes", icon: "🚲" },
    { id: "rentals", label: "Rentals", icon: "📋" },
    { id: "maintenance", label: "Maintenance", icon: "🔧" },
    { id: "calendar", label: "Calendar", icon: "📅" },
    { id: "customers", label: "Customers", icon: "👥" },
  ];

  const props = { bikes, rentals, maintenance, customers, appUsers, fetchAll, modal, setModal, isAdmin };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#F8FAFC" }}>
      {/* Sidebar */}
      <aside style={{ width: 225, background: "#0F172A", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "26px 20px 16px" }}>
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
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer", marginBottom: 2, textAlign: "left", fontWeight: 600, fontSize: 13, background: tab === t.id ? "#1E40AF" : "transparent", color: tab === t.id ? "#fff" : "#94A3B8" }}>
              <span style={{ fontSize: 15 }}>{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "14px 20px", borderTop: "1px solid #1E293B" }}>
          <div style={{ color: "#94A3B8", fontSize: 12, marginBottom: 2 }}>{user.name}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Badge status={user.role === "admin" ? "active" : "scheduled"} />
            <button onClick={handleLogout} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Sign out</button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: "auto" }}>
        {!isAdmin && (
          <div style={{ background: "#FEF3C7", borderBottom: "1px solid #FDE68A", padding: "8px 24px", fontSize: 13, color: "#92400E", display: "flex", alignItems: "center", gap: 8 }}>
            🔒 You're in <strong>read-only</strong> mode. Contact an admin to make changes.
          </div>
        )}
        {tab === "dashboard"   && <Dashboard {...props} />}
        {tab === "bikes"       && <Bikes {...props} />}
        {tab === "rentals"     && <Rentals {...props} />}
        {tab === "maintenance" && <MaintenanceTab {...props} />}
        {tab === "calendar"    && <CalendarView {...props} />}
        {tab === "customers"   && <CustomersTab {...props} />}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function Dashboard({ bikes, rentals, maintenance, customers }) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const yearRentals = rentals.filter(r => new Date(r.start_date).getFullYear() === currentYear);
  const activeRentals = rentals.filter(r => r.status === "active").length;
  const availableBikes = bikes.filter(b => b.status === "available").length;
  const pendingMaint = maintenance.filter(m => m.status === "scheduled").length;

  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthlyData = monthNames.map((m, i) => ({
    month: m,
    count: rentals.filter(r => { const d = new Date(r.start_date); return d.getFullYear() === currentYear && d.getMonth() === i; }).length,
  }));
  const maxCount = Math.max(...monthlyData.map(m => m.count), 1);

  const stats = [
    { label: "Total Rentals This Year", value: yearRentals.length, color: "#22C55E", icon: "📦", sub: `${currentYear} total` },
    { label: "Active Now", value: activeRentals, color: "#3B82F6", icon: "🚴", sub: "Bikes currently out" },
    { label: "Available Bikes", value: availableBikes, color: "#8B5CF6", icon: "✅", sub: `of ${bikes.length} fleet` },
    { label: "Pending Maintenance", value: pendingMaint, color: "#F59E0B", icon: "🔧", sub: "Needs attention" },
  ];

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 800, color: "#0F172A" }}>Dashboard</h1>
      <p style={{ margin: "0 0 28px", color: "#64748B", fontSize: 14 }}>Fleet overview for {currentYear}</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#374151", marginTop: 4 }}>{s.label}</div>
            <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Monthly Bookings — {currentYear}</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 130 }}>
            {monthlyData.map((d, i) => (
              <div key={d.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ fontSize: 10, color: "#374151", fontWeight: 600 }}>{d.count || ""}</div>
                <div style={{ width: "100%", background: i === currentMonth ? "#1E40AF" : "#DBEAFE", borderRadius: "4px 4px 0 0", height: `${Math.max((d.count / maxCount) * 110, 4)}px` }} />
                <div style={{ fontSize: 10, color: "#94A3B8" }}>{d.month}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Fleet Status</h3>
          {["available","rented","maintenance"].map(status => {
            const count = bikes.filter(b => b.status === status).length;
            const pct = bikes.length ? Math.round((count / bikes.length) * 100) : 0;
            const c = statusColors[status];
            return (
              <div key={status} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#374151", textTransform: "capitalize" }}>{status}</span>
                  <span style={{ fontSize: 13, color: "#64748B" }}>{count}/{bikes.length}</span>
                </div>
                <div style={{ background: "#F1F5F9", borderRadius: 6, height: 8 }}>
                  <div style={{ background: c.dot, height: 8, borderRadius: 6, width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 20, padding: "12px", background: "#F8FAFC", borderRadius: 10 }}>
            <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 6 }}>Total Customers</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#0F172A" }}>{customers.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BIKES
// ═══════════════════════════════════════════════════════════════════════════════
function Bikes({ bikes, rentals, customers, fetchAll, modal, setModal, isAdmin }) {
  const emptyBike = { name: "", type: "City", color: "#3B82F6", status: "available", image_url: "", components: [] };
  const [form, setForm] = useState(emptyBike);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setForm(emptyBike); setEditId(null); setModal("bike"); };
  const openEdit = (b) => { setForm({ ...b }); setEditId(b.id); setModal("bike"); };
  const closeModal = () => { setModal(null); setEditId(null); };

  const saveBike = async () => {
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
      await supabase.from("components").insert(form.components.map(c => ({ id: genId("c"), bike_id: bikeId, name: c.name, condition: c.condition, last_replaced: c.last_replaced || null })));
    }
    await fetchAll(); closeModal(); setSaving(false);
  };

  const deleteBike = async (id) => { await supabase.from("bikes").delete().eq("id", id); await fetchAll(); };
  const addComp = () => setForm(f => ({ ...f, components: [...(f.components||[]), { name: "", condition: "good", last_replaced: new Date().toISOString().split("T")[0] }] }));
  const updComp = (i, k, v) => { const c = [...form.components]; c[i] = { ...c[i], [k]: v }; setForm(f => ({ ...f, components: c })); };
  const remComp = (i) => setForm(f => ({ ...f, components: f.components.filter((_, x) => x !== i) }));

  const getBikeRentals = (bikeId) => {
    const now = new Date().toISOString().split("T")[0];
    const all = rentals.filter(r => r.bike_id === bikeId);
    const past = all.filter(r => r.end_date < now).sort((a,b) => b.end_date.localeCompare(a.end_date)).slice(0,1);
    const upcoming = all.filter(r => r.start_date >= now).sort((a,b) => a.start_date.localeCompare(b.start_date)).slice(0,2);
    return { past, upcoming };
  };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0F172A" }}>Bikes</h1>
          <p style={{ margin: "2px 0 0", color: "#64748B", fontSize: 13 }}>{bikes.length} bikes in fleet</p>
        </div>
        {isAdmin && <Btn onClick={openAdd}>+ Add Bike</Btn>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
        {bikes.map(bike => {
          const { past, upcoming } = getBikeRentals(bike.id);
          return (
            <div key={bike.id} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", border: "1px solid #F1F5F9", display: "flex", flexDirection: "column" }}>
              {/* Bike image */}
              <div style={{ height: 160, background: `linear-gradient(135deg, ${bike.color}22, ${bike.color}44)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                {bike.image_url ? (
                  <img src={bike.image_url} alt={bike.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                ) : (
                  <div style={{ fontSize: 64, opacity: 0.4 }}>🚲</div>
                )}
                <div style={{ position: "absolute", top: 10, right: 10 }}><Badge status={bike.status} /></div>
                <div style={{ position: "absolute", top: 10, left: 10, background: bike.color, width: 14, height: 14, borderRadius: "50%", border: "2px solid white" }} />
              </div>

              <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: "#0F172A" }}>{bike.name}</div>
                  <div style={{ fontSize: 12, color: "#94A3B8" }}>{bike.type}</div>
                </div>

                {/* Components */}
                {(bike.components||[]).length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.5px" }}>Components</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {bike.components.map((c, i) => (
                        <span key={i} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: statusColors[c.condition]?.bg, color: statusColors[c.condition]?.text }}>{c.name}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rental history */}
                <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 10 }}>
                  {past.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Last Booking</div>
                      {past.map(r => {
                        const cust = customers.find(c => c.id === r.customer_id);
                        return <RentalChip key={r.id} r={r} cust={cust} />;
                      })}
                    </div>
                  )}
                  {upcoming.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Upcoming ({upcoming.length})</div>
                      {upcoming.map(r => {
                        const cust = customers.find(c => c.id === r.customer_id);
                        return <RentalChip key={r.id} r={r} cust={cust} />;
                      })}
                    </div>
                  )}
                  {past.length === 0 && upcoming.length === 0 && (
                    <div style={{ fontSize: 12, color: "#CBD5E1", textAlign: "center", padding: "8px 0" }}>No booking history</div>
                  )}
                </div>

                {isAdmin && (
                  <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                    <Btn onClick={() => openEdit(bike)} variant="secondary" small>✏️ Edit</Btn>
                    <Btn onClick={() => deleteBike(bike.id)} variant="danger" small>🗑</Btn>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {modal === "bike" && isAdmin && (
        <Modal title={editId ? "Edit Bike" : "Add Bike"} onClose={closeModal} wide>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Bike Name"><input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Trek FX 3" /></Field>
            <Field label="Type">
              <select style={selectStyle} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {["City","Mountain","Road","Hybrid","Fitness","Electric"].map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select style={selectStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
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
            <input style={inputStyle} value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://example.com/bike.jpg" />
            {form.image_url && <img src={form.image_url} alt="preview" style={{ marginTop: 8, height: 80, borderRadius: 8, objectFit: "cover" }} onError={e => e.target.style.display="none"} />}
          </Field>

          <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: "#374151" }}>Components</span>
              <Btn onClick={addComp} variant="ghost" small>+ Add Component</Btn>
            </div>
            {(form.components||[]).map((c, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8, marginBottom: 8 }}>
                <input style={inputStyle} value={c.name} onChange={e => updComp(i,"name",e.target.value)} placeholder="Name" />
                <select style={selectStyle} value={c.condition} onChange={e => updComp(i,"condition",e.target.value)}>
                  {["good","fair","worn"].map(s => <option key={s}>{s}</option>)}
                </select>
                <input type="date" style={inputStyle} value={c.last_replaced||""} onChange={e => updComp(i,"last_replaced",e.target.value)} />
                <Btn onClick={() => remComp(i)} variant="danger" small>🗑</Btn>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <Btn onClick={closeModal} variant="secondary">Cancel</Btn>
            <button onClick={saveBike} disabled={saving} style={{ flex: 2, padding: "10px", background: "#1E40AF", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", color: "#fff" }}>{saving ? "Saving..." : "Save Bike"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function RentalChip({ r, cust }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F8FAFC", borderRadius: 8, padding: "5px 10px", marginBottom: 4, fontSize: 12 }}>
      <span style={{ fontWeight: 600, color: "#374151" }}>{cust?.name || "Unknown"}</span>
      <span style={{ color: "#94A3B8" }}>{r.start_date} → {r.end_date}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RENTALS
// ═══════════════════════════════════════════════════════════════════════════════
function Rentals({ rentals, bikes, customers, fetchAll, modal, setModal, isAdmin }) {
  const emptyR = { bike_id: "", customer_id: "", start_date: "", end_date: "", rental_type: "daily", status: "upcoming", notes: "" };
  const [form, setForm] = useState(emptyR);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setForm(emptyR); setEditId(null); setModal("rental"); };
  const openEdit = (r) => { setForm({ ...r }); setEditId(r.id); setModal("rental"); };
  const closeModal = () => { setModal(null); setEditId(null); };

  const saveRental = async () => {
    setSaving(true);
    if (editId) await supabase.from("rentals").update(form).eq("id", editId);
    else await supabase.from("rentals").insert({ id: genId("r"), ...form });
    await fetchAll(); closeModal(); setSaving(false);
  };

  const del = async (id) => { await supabase.from("rentals").delete().eq("id", id); await fetchAll(); };

  const filtered = useMemo(() => {
    let list = filter === "all" ? rentals : rentals.filter(r => r.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r => {
        const cust = customers.find(c => c.id === r.customer_id);
        return cust?.name?.toLowerCase().includes(q) || cust?.email?.toLowerCase().includes(q);
      });
    }
    return list;
  }, [rentals, filter, search, customers]);

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0F172A" }}>Rentals</h1>
          <p style={{ margin: "2px 0 0", color: "#64748B", fontSize: 13 }}>{rentals.length} total</p>
        </div>
        {isAdmin && <Btn onClick={openAdd}>+ New Rental</Btn>}
      </div>

      {/* Search + Filter */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        <input
          style={{ ...inputStyle, maxWidth: 280, flex: "1 1 200px" }}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Search customer name or email..."
        />
        <div style={{ display: "flex", gap: 6 }}>
          {["all","active","upcoming","completed"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "7px 14px", borderRadius: 20, border: "1.5px solid", fontSize: 12, fontWeight: 600, cursor: "pointer", background: filter === f ? "#1E40AF" : "#fff", color: filter === f ? "#fff" : "#64748B", borderColor: filter === f ? "#1E40AF" : "#E2E8F0" }}>
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
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#374151", fontSize: 12, borderBottom: "1px solid #F1F5F9" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => {
              const bike = bikes.find(b => b.id === r.bike_id);
              const cust = customers.find(c => c.id === r.customer_id);
              return (
                <tr key={r.id} style={{ borderBottom: "1px solid #F8FAFC", background: i%2===0?"#fff":"#FAFAFE" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 600, color: "#0F172A" }}>{cust?.name || "—"}</div>
                    <div style={{ fontSize: 11, color: "#94A3B8" }}>{cust?.email}</div>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#374151" }}>{bike?.name || "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ color: "#374151" }}>{r.start_date}</div>
                    <div style={{ fontSize: 11, color: "#94A3B8" }}>to {r.end_date}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}><Badge status={r.status} /></td>
                  {isAdmin && (
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Btn onClick={() => openEdit(r)} variant="secondary" small>✏️</Btn>
                        <Btn onClick={() => del(r.id)} variant="danger" small>🗑</Btn>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#94A3B8" }}>No rentals found</td></tr>}
          </tbody>
        </table>
      </div>

      {modal === "rental" && isAdmin && (
        <Modal title={editId ? "Edit Rental" : "New Rental"} onClose={closeModal}>
          <Field label="Customer">
            <select style={selectStyle} value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))}>
              <option value="">Select a customer</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.email}</option>)}
            </select>
          </Field>
          <Field label="Bike">
            <select style={selectStyle} value={form.bike_id} onChange={e => setForm(f => ({ ...f, bike_id: e.target.value }))}>
              <option value="">Select a bike</option>
              {bikes.map(b => <option key={b.id} value={b.id}>{b.name} ({b.type}) — {b.status}</option>)}
            </select>
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Start Date"><input type="date" style={inputStyle} value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} /></Field>
            <Field label="End Date"><input type="date" style={inputStyle} value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} /></Field>
            <Field label="Type">
              <select style={selectStyle} value={form.rental_type} onChange={e => setForm(f => ({ ...f, rental_type: e.target.value }))}>
                {["hourly","daily","weekly"].map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select style={selectStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {["upcoming","active","completed"].map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Notes"><textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={form.notes||""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></Field>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn onClick={closeModal} variant="secondary">Cancel</Btn>
            <button onClick={saveRental} disabled={saving} style={{ flex: 2, padding: "10px", background: "#1E40AF", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", color: "#fff" }}>{saving?"Saving...":"Save Rental"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAINTENANCE
// ═══════════════════════════════════════════════════════════════════════════════
function MaintenanceTab({ maintenance, bikes, fetchAll, modal, setModal, isAdmin }) {
  const emptyM = { bike_id: "", type: "Inspection", description: "", scheduled_date: "", status: "scheduled", cost: 0, technician_name: "" };
  const [form, setForm] = useState(emptyM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setForm(emptyM); setEditId(null); setModal("maint"); };
  const openEdit = (m) => { setForm({ ...m }); setEditId(m.id); setModal("maint"); };
  const closeModal = () => { setModal(null); setEditId(null); };

  const save = async () => {
    setSaving(true);
    if (editId) await supabase.from("maintenance").update(form).eq("id", editId);
    else await supabase.from("maintenance").insert({ id: genId("m"), ...form });
    await fetchAll(); closeModal(); setSaving(false);
  };

  const del = async (id) => { await supabase.from("maintenance").delete().eq("id", id); await fetchAll(); };
  const markDone = async (id) => { await supabase.from("maintenance").update({ status: "completed" }).eq("id", id); await fetchAll(); };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0F172A" }}>Maintenance</h1>
          <p style={{ margin: "2px 0 0", color: "#64748B", fontSize: 13 }}>{maintenance.filter(m=>m.status==="scheduled").length} scheduled</p>
        </div>
        {isAdmin && <Btn onClick={openAdd}>+ Schedule</Btn>}
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {maintenance.map(m => {
          const bike = bikes.find(b => b.id === m.bike_id);
          return (
            <div key={m.id} style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: m.status==="completed"?"#DCFCE7":"#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                {m.status==="completed"?"✅":"🔧"}
              </div>
              <div style={{ flex: 1, minWidth: 150 }}>
                <div style={{ fontWeight: 700, color: "#0F172A", fontSize: 15 }}>{m.type} — {bike?.name||"Unknown"}</div>
                <div style={{ color: "#64748B", fontSize: 13, marginTop: 2 }}>{m.description}</div>
                <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>🗓 {m.scheduled_date} · 👤 {m.technician_name}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 800, fontSize: 18, color: "#0F172A", marginBottom: 4 }}>${m.cost}</div>
                <Badge status={m.status} />
              </div>
              {isAdmin && (
                <div style={{ display: "flex", gap: 6 }}>
                  {m.status==="scheduled" && <Btn onClick={() => markDone(m.id)} variant="success" small>✓ Done</Btn>}
                  <Btn onClick={() => openEdit(m)} variant="secondary" small>✏️</Btn>
                  <Btn onClick={() => del(m.id)} variant="danger" small>🗑</Btn>
                </div>
              )}
            </div>
          );
        })}
        {maintenance.length === 0 && <div style={{ textAlign:"center", padding:40, color:"#94A3B8" }}>No records yet</div>}
      </div>

      {modal === "maint" && isAdmin && (
        <Modal title={editId ? "Edit" : "Schedule Maintenance"} onClose={closeModal}>
          <Field label="Bike">
            <select style={selectStyle} value={form.bike_id} onChange={e => setForm(f => ({ ...f, bike_id: e.target.value }))}>
              <option value="">Select bike</option>
              {bikes.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Type">
              <select style={selectStyle} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {["Inspection","Repair","Service","Cleaning","Upgrade"].map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select style={selectStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {["scheduled","completed"].map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Date"><input type="date" style={inputStyle} value={form.scheduled_date} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))} /></Field>
            <Field label="Cost ($)"><input type="number" style={inputStyle} value={form.cost} onChange={e => setForm(f => ({ ...f, cost: +e.target.value }))} /></Field>
          </div>
          <Field label="Technician"><input style={inputStyle} value={form.technician_name} onChange={e => setForm(f => ({ ...f, technician_name: e.target.value }))} placeholder="Mike T." /></Field>
          <Field label="Description"><textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></Field>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn onClick={closeModal} variant="secondary">Cancel</Btn>
            <button onClick={save} disabled={saving} style={{ flex: 2, padding: "10px", background: "#1E40AF", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", color: "#fff" }}>{saving?"Saving...":"Save"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CALENDAR
// ═══════════════════════════════════════════════════════════════════════════════
function CalendarView({ rentals, bikes, customers }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const getDay = (day) => {
    const date = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    return rentals.filter(r => r.start_date <= date && r.end_date >= date);
  };

  const monthCount = rentals.filter(r => { const d = new Date(r.start_date); return d.getFullYear()===year && d.getMonth()===month; }).length;
  const yearCount  = rentals.filter(r => new Date(r.start_date).getFullYear()===year).length;

  const days = [];
  for (let i=0;i<firstDay;i++) days.push(null);
  for (let d=1;d<=daysInMonth;d++) days.push(d);

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0F172A" }}>Calendar</h1>
          <p style={{ margin: "2px 0 0", color: "#64748B", fontSize: 13 }}>Rental schedule</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Btn onClick={() => { month===0?setMonth(11)&&setYear(y=>y-1):setMonth(m=>m-1); if(month===0){setMonth(11);setYear(y=>y-1);} else setMonth(m=>m-1); }} variant="secondary" small>‹</Btn>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#0F172A", minWidth: 150, textAlign: "center" }}>{monthNames[month]} {year}</span>
          <Btn onClick={() => { if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); }} variant="secondary" small>›</Btn>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {[
          { label: `Bookings in ${monthNames[month]}`, value: monthCount, color: "#3B82F6" },
          { label: `Bookings in ${year}`, value: yearCount, color: "#8B5CF6" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 12, padding: "14px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0F172A" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#94A3B8" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: "#F8FAFC" }}>
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
            <div key={d} style={{ padding: 10, textAlign: "center", fontSize: 12, fontWeight: 700, color: "#64748B" }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, background: "#F1F5F9" }}>
          {days.map((day, i) => {
            const bookings = day ? getDay(day) : [];
            const isToday = day && year===now.getFullYear() && month===now.getMonth() && day===now.getDate();
            return (
              <div key={i} style={{ background: "#fff", minHeight: 85, padding: "6px 8px" }}>
                {day && (
                  <>
                    <div style={{ fontSize: 13, fontWeight: isToday?800:500, color: isToday?"#fff":"#374151", width: 24, height: 24, borderRadius: "50%", background: isToday?"#1E40AF":"transparent", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>{day}</div>
                    {bookings.slice(0,2).map(r => {
                      const bike = bikes.find(b => b.id === r.bike_id);
                      const cust = customers.find(c => c.id === r.customer_id);
                      return (
                        <div key={r.id} title={`${cust?.name||""} — ${bike?.name||""}`} style={{ fontSize: 10, padding: "2px 5px", borderRadius: 4, marginBottom: 2, fontWeight: 600, background: (bike?.color||"#3B82F6")+"22", color: bike?.color||"#1E40AF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {cust?.name?.split(" ")[0] || bike?.name || "—"}
                        </div>
                      );
                    })}
                    {bookings.length>2 && <div style={{ fontSize: 10, color: "#94A3B8" }}>+{bookings.length-2}</div>}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
        {bikes.map(b => (
          <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#374151" }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: b.color, display: "inline-block" }} />
            {b.name}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOMERS TAB (includes app_users / admins management for admins)
// ═══════════════════════════════════════════════════════════════════════════════
function CustomersTab({ customers, rentals, appUsers, fetchAll, modal, setModal, isAdmin }) {
  const [custModal, setCustModal] = useState(false);
  const [userModal, setUserModal] = useState(false);
  const [custForm, setCustForm] = useState({ name: "", email: "", phone: "", instagram: "" });
  const [userForm, setUserForm] = useState({ name: "", email: "", password_hash: "", role: "readonly" });
  const [saving, setSaving] = useState(false);
  const [subTab, setSubTab] = useState("customers");

  const custWithCount = useMemo(() => {
    return customers.map(c => ({
      ...c,
      rentalCount: rentals.filter(r => r.customer_id === c.id).length,
    })).sort((a, b) => b.rentalCount - a.rentalCount);
  }, [customers, rentals]);

  const saveCustomer = async () => {
    setSaving(true);
    const existing = customers.find(c => c.email?.toLowerCase() === custForm.email?.toLowerCase());
    if (existing) { alert("A customer with this email already exists."); setSaving(false); return; }
    await supabase.from("customers").insert({ id: genId("cu"), ...custForm });
    await fetchAll(); setCustModal(false); setSaving(false);
    setCustForm({ name: "", email: "", phone: "", instagram: "" });
  };

  const delCustomer = async (id) => { await supabase.from("customers").delete().eq("id", id); await fetchAll(); };

  const saveUser = async () => {
    setSaving(true);
    await supabase.from("app_users").insert({ name: userForm.name, email: userForm.email, password_hash: `hash:${userForm.password_hash}`, role: userForm.role });
    await fetchAll(); setUserModal(false); setSaving(false);
    setUserForm({ name: "", email: "", password_hash: "", role: "readonly" });
  };

  const delUser = async (id) => { await supabase.from("app_users").delete().eq("id", id); await fetchAll(); };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0F172A" }}>Users & Customers</h1>
          <p style={{ margin: "2px 0 0", color: "#64748B", fontSize: 13 }}>{customers.length} customers · {appUsers.length} system users</p>
        </div>
        {isAdmin && (
          <div style={{ display: "flex", gap: 8 }}>
            {subTab === "customers" && <Btn onClick={() => setCustModal(true)}>+ Add Customer</Btn>}
            {subTab === "admins" && <Btn onClick={() => setUserModal(true)}>+ Add User</Btn>}
          </div>
        )}
      </div>

      {/* Sub tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {[{ id:"customers",label:"Customers"}, {id:"admins",label:"System Users"}].map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)} style={{ padding: "7px 18px", borderRadius: 20, border: "1.5px solid", fontSize: 13, fontWeight: 600, cursor: "pointer", background: subTab===t.id?"#1E40AF":"#fff", color: subTab===t.id?"#fff":"#64748B", borderColor: subTab===t.id?"#1E40AF":"#E2E8F0" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Customers Table */}
      {subTab === "customers" && (
        <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                {["Name","Email","Phone","Instagram","Rentals", isAdmin&&"Actions"].filter(Boolean).map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#374151", fontSize: 12, borderBottom: "1px solid #F1F5F9" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {custWithCount.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: "1px solid #F8FAFC", background: i%2===0?"#fff":"#FAFAFE" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0F172A" }}>{c.name}</td>
                  <td style={{ padding: "12px 16px", color: "#374151" }}>{c.email||"—"}</td>
                  <td style={{ padding: "12px 16px", color: "#374151" }}>{c.phone||"—"}</td>
                  <td style={{ padding: "12px 16px", color: "#3B82F6" }}>{c.instagram||"—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ background: "#EFF6FF", color: "#1E40AF", fontWeight: 700, fontSize: 13, padding: "3px 12px", borderRadius: 20 }}>{c.rentalCount}</span>
                  </td>
                  {isAdmin && (
                    <td style={{ padding: "12px 16px" }}>
                      <Btn onClick={() => delCustomer(c.id)} variant="danger" small>🗑</Btn>
                    </td>
                  )}
                </tr>
              ))}
              {custWithCount.length === 0 && <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#94A3B8" }}>No customers yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* System Users Table */}
      {subTab === "admins" && (
        <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                {["Name","Email","Role","Created", isAdmin&&"Actions"].filter(Boolean).map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#374151", fontSize: 12, borderBottom: "1px solid #F1F5F9" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appUsers.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: "1px solid #F8FAFC", background: i%2===0?"#fff":"#FAFAFE" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0F172A" }}>{u.name}</td>
                  <td style={{ padding: "12px 16px", color: "#374151" }}>{u.email}</td>
                  <td style={{ padding: "12px 16px" }}><Badge status={u.role==="admin"?"active":"scheduled"} /></td>
                  <td style={{ padding: "12px 16px", color: "#94A3B8", fontSize: 12 }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  {isAdmin && (
                    <td style={{ padding: "12px 16px" }}>
                      <Btn onClick={() => delUser(u.id)} variant="danger" small>🗑</Btn>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Customer Modal */}
      {custModal && isAdmin && (
        <Modal title="Add Customer" onClose={() => setCustModal(false)}>
          <Field label="Full Name"><input style={inputStyle} value={custForm.name} onChange={e => setCustForm(f=>({...f,name:e.target.value}))} placeholder="Jane Doe" /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Email"><input style={inputStyle} value={custForm.email} onChange={e => setCustForm(f=>({...f,email:e.target.value}))} placeholder="jane@email.com" /></Field>
            <Field label="Phone"><input style={inputStyle} value={custForm.phone} onChange={e => setCustForm(f=>({...f,phone:e.target.value}))} placeholder="555-0000" /></Field>
          </div>
          <Field label="Instagram"><input style={inputStyle} value={custForm.instagram} onChange={e => setCustForm(f=>({...f,instagram:e.target.value}))} placeholder="@janedoe" /></Field>
          <div style={{ background: "#EFF6FF", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#1E40AF", marginBottom: 16 }}>
            ℹ️ Each customer is registered once. When they book again, select them from the dropdown in the rental form.
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={() => setCustModal(false)} variant="secondary">Cancel</Btn>
            <button onClick={saveCustomer} disabled={saving} style={{ flex: 2, padding: "10px", background: "#1E40AF", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", color: "#fff" }}>{saving?"Saving...":"Add Customer"}</button>
          </div>
        </Modal>
      )}

      {/* Add System User Modal */}
      {userModal && isAdmin && (
        <Modal title="Add System User" onClose={() => setUserModal(false)}>
          <Field label="Full Name"><input style={inputStyle} value={userForm.name} onChange={e => setUserForm(f=>({...f,name:e.target.value}))} placeholder="Jane Admin" /></Field>
          <Field label="Email"><input style={inputStyle} value={userForm.email} onChange={e => setUserForm(f=>({...f,email:e.target.value}))} placeholder="jane@bikerent.com" /></Field>
          <Field label="Password"><input type="password" style={inputStyle} value={userForm.password_hash} onChange={e => setUserForm(f=>({...f,password_hash:e.target.value}))} placeholder="Choose a password" /></Field>
          <Field label="Role">
            <select style={selectStyle} value={userForm.role} onChange={e => setUserForm(f=>({...f,role:e.target.value}))}>
              <option value="readonly">Read Only — can view everything, no edits</option>
              <option value="admin">Admin — full access + can add users</option>
            </select>
          </Field>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn onClick={() => setUserModal(false)} variant="secondary">Cancel</Btn>
            <button onClick={saveUser} disabled={saving} style={{ flex: 2, padding: "10px", background: "#1E40AF", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", color: "#fff" }}>{saving?"Saving...":"Add User"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
