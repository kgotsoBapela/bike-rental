import { useState, useEffect } from "react";
import { supabase } from "./supabase";

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18 }) => {
  const icons = {
    bike: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 0 0-1-1h-1"/><path d="M18.5 17.5L14 6"/><path d="M5.5 17.5 L9 10h7l2 7.5"/><path d="M9 10l-2 3"/></svg>,
    calendar: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    wrench: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>,
    dashboard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
    close: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    chevronLeft: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6"/></svg>,
    chevronRight: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9,18 15,12 9,6"/></svg>,
  };
  return icons[name] || null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateId(prefix) { return prefix + Date.now() + Math.random().toString(36).slice(2, 6); }

const statusColors = {
  available: { bg: "#DCFCE7", text: "#166534", dot: "#22C55E" },
  rented:    { bg: "#DBEAFE", text: "#1E40AF", dot: "#3B82F6" },
  maintenance:{ bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
  completed: { bg: "#F1F5F9", text: "#475569", dot: "#94A3B8" },
  active:    { bg: "#DBEAFE", text: "#1E40AF", dot: "#3B82F6" },
  upcoming:  { bg: "#F3E8FF", text: "#6B21A8", dot: "#A855F7" },
  scheduled: { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
  good:      { bg: "#DCFCE7", text: "#166534", dot: "#22C55E" },
  fair:      { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
  worn:      { bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" },
};

const Badge = ({ status }) => {
  const c = statusColors[status] || { bg: "#F1F5F9", text: "#475569", dot: "#94A3B8" };
  return (
    <span style={{ background: c.bg, color: c.text, padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, display: "inline-block" }} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const Modal = ({ title, onClose, children }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
    <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #F1F5F9" }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0F172A" }}>{title}</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", padding: 4 }}><Icon name="close" size={20} /></button>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  </div>
);

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{label}</label>
    {children}
  </div>
);

const inputStyle = { width: "100%", padding: "9px 12px", border: "1.5px solid #E2E8F0", borderRadius: 8, fontSize: 14, color: "#1E293B", outline: "none", boxSizing: "border-box", background: "#fff" };
const selectStyle = { ...inputStyle, cursor: "pointer" };

const btnPrimary = { display: "flex", alignItems: "center", gap: 6, background: "#1E40AF", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 13 };
const btnSecondary = { flex: 1, padding: "10px", background: "#F1F5F9", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer", color: "#374151" };
const btnSave = { flex: 2, padding: "10px", background: "#1E40AF", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", color: "#fff" };

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [bikes, setBikes] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [{ data: b }, { data: c }, { data: r }, { data: m }] = await Promise.all([
        supabase.from("bikes").select("*").order("created_at"),
        supabase.from("components").select("*"),
        supabase.from("rentals").select("*").order("created_at", { ascending: false }),
        supabase.from("maintenance").select("*").order("scheduled_date"),
      ]);
      // Attach components to bikes
      const bikesWithComps = (b || []).map(bike => ({
        ...bike,
        hourlyRate: bike.hourly_rate,
        dailyRate: bike.daily_rate,
        components: (c || []).filter(comp => comp.bike_id === bike.id).map(comp => ({
          ...comp, lastReplaced: comp.last_replaced
        }))
      }));
      // Normalize rentals
      const normalizedRentals = (r || []).map(rental => ({
        ...rental,
        bikeId: rental.bike_id,
        customerName: rental.customer_name,
        customerEmail: rental.customer_email,
        customerPhone: rental.customer_phone,
        startDate: rental.start_date,
        endDate: rental.end_date,
        type: rental.rental_type,
      }));
      // Normalize maintenance
      const normalizedMaint = (m || []).map(item => ({
        ...item,
        bikeId: item.bike_id,
        scheduledDate: item.scheduled_date,
        technicianName: item.technician_name,
      }));
      setBikes(bikesWithComps);
      setRentals(normalizedRentals);
      setMaintenance(normalizedMaint);
    } catch (e) {
      setError("Failed to connect to database.");
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🚲</div>
        <p style={{ color: "#64748B", fontFamily: "monospace", fontSize: 15 }}>Connecting to database...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC" }}>
      <div style={{ textAlign: "center", background: "#fff", padding: 40, borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
        <p style={{ color: "#DC2626", fontWeight: 700, fontSize: 16 }}>{error}</p>
        <p style={{ color: "#64748B", fontSize: 13 }}>Check your Supabase environment variables.</p>
        <button onClick={fetchAll} style={{ ...btnPrimary, margin: "16px auto 0", justifyContent: "center" }}>Retry</button>
      </div>
    </div>
  );

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "bikes", label: "Bikes", icon: "bike" },
    { id: "rentals", label: "Rentals", icon: "calendar" },
    { id: "maintenance", label: "Maintenance", icon: "wrench" },
    { id: "calendar", label: "Calendar", icon: "calendar" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Segoe UI', system-ui, sans-serif", display: "flex" }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: "#0F172A", flexShrink: 0, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <div style={{ padding: "28px 20px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 26 }}>🚲</span>
            <div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>BikeRent</div>
              <div style={{ color: "#475569", fontSize: 11 }}>Admin Panel</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "0 12px" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer", marginBottom: 2, textAlign: "left", fontWeight: 600, fontSize: 13, background: tab === t.id ? "#1E40AF" : "transparent", color: tab === t.id ? "#fff" : "#94A3B8" }}>
              <Icon name={t.icon} size={16} />{t.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "16px 20px", borderTop: "1px solid #1E293B", color: "#475569", fontSize: 11 }}>
          Connected to Supabase ✓
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: "auto" }}>
        {tab === "dashboard"   && <Dashboard bikes={bikes} rentals={rentals} maintenance={maintenance} />}
        {tab === "bikes"       && <Bikes bikes={bikes} fetchAll={fetchAll} modal={modal} setModal={setModal} />}
        {tab === "rentals"     && <Rentals rentals={rentals} bikes={bikes} fetchAll={fetchAll} modal={modal} setModal={setModal} />}
        {tab === "maintenance" && <MaintenanceTab maintenance={maintenance} bikes={bikes} fetchAll={fetchAll} modal={modal} setModal={setModal} />}
        {tab === "calendar"    && <CalendarView rentals={rentals} bikes={bikes} />}
      </main>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ bikes, rentals, maintenance }) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const totalRevenue = rentals.filter(r => r.status === "completed").reduce((s, r) => s + Number(r.amount), 0);
  const activeRentals = rentals.filter(r => r.status === "active").length;
  const availableBikes = bikes.filter(b => b.status === "available").length;
  const pendingMaint = maintenance.filter(m => m.status === "scheduled").length;

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthlyData = months.map((m, i) => ({
    month: m,
    count: rentals.filter(r => { const d = new Date(r.startDate); return d.getFullYear() === currentYear && d.getMonth() === i; }).length,
  }));
  const maxCount = Math.max(...monthlyData.map(m => m.count), 1);

  const stats = [
    { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, color: "#22C55E", icon: "💰", sub: "Completed rentals" },
    { label: "Active Rentals", value: activeRentals, color: "#3B82F6", icon: "🚴", sub: "Bikes out now" },
    { label: "Available Bikes", value: availableBikes, color: "#8B5CF6", icon: "✅", sub: `of ${bikes.length} total` },
    { label: "Pending Maintenance", value: pendingMaint, color: "#F59E0B", icon: "🔧", sub: "Scheduled" },
  ];

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 800, color: "#0F172A" }}>Admin Dashboard</h1>
      <p style={{ margin: "0 0 28px", color: "#64748B", fontSize: 14 }}>Welcome back. Here's what's happening today.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#374151", marginTop: 4 }}>{s.label}</div>
            <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Bookings This Year — {currentYear}</h3>
          <p style={{ margin: "0 0 20px", fontSize: 12, color: "#94A3B8" }}>Monthly overview</p>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 130 }}>
            {monthlyData.map((d, i) => (
              <div key={d.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ fontSize: 10, color: "#374151", fontWeight: 600 }}>{d.count || ""}</div>
                <div style={{ width: "100%", background: i === currentMonth ? "#1E40AF" : "#DBEAFE", borderRadius: "4px 4px 0 0", height: `${(d.count / maxCount) * 100 + 4}px`, minHeight: 4 }} />
                <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 500 }}>{d.month}</div>
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
                  <span style={{ fontSize: 13, color: "#374151", fontWeight: 600, textTransform: "capitalize" }}>{status}</span>
                  <span style={{ fontSize: 13, color: "#64748B" }}>{count} / {bikes.length}</span>
                </div>
                <div style={{ background: "#F1F5F9", borderRadius: 6, height: 8 }}>
                  <div style={{ background: c.dot, height: 8, borderRadius: 6, width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          <h4 style={{ margin: "20px 0 10px", fontSize: 13, color: "#64748B" }}>Recent Rentals</h4>
          {rentals.slice(0, 3).map(r => {
            const bike = bikes.find(b => b.id === r.bikeId || b.id === r.bike_id);
            return (
              <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #F8FAFC" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#0F172A" }}>{r.customerName || r.customer_name}</div>
                  <div style={{ fontSize: 11, color: "#94A3B8" }}>{bike?.name}</div>
                </div>
                <Badge status={r.status} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── BIKES ────────────────────────────────────────────────────────────────────
function Bikes({ bikes, fetchAll, modal, setModal }) {
  const emptyBike = { name: "", type: "City", color: "#3B82F6", status: "available", hourlyRate: 10, dailyRate: 40, components: [] };
  const [form, setForm] = useState(emptyBike);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setForm(emptyBike); setEditId(null); setModal("bike"); };
  const openEdit = (bike) => { setForm({ ...bike, hourlyRate: bike.hourly_rate || bike.hourlyRate, dailyRate: bike.daily_rate || bike.dailyRate }); setEditId(bike.id); setModal("bike"); };
  const closeModal = () => { setModal(null); setEditId(null); };

  const saveBike = async () => {
    setSaving(true);
    const bikeData = { name: form.name, type: form.type, color: form.color, status: form.status, hourly_rate: form.hourlyRate, daily_rate: form.dailyRate };
    let bikeId = editId;
    if (editId) {
      await supabase.from("bikes").update(bikeData).eq("id", editId);
      await supabase.from("components").delete().eq("bike_id", editId);
    } else {
      bikeId = generateId("b");
      await supabase.from("bikes").insert({ id: bikeId, ...bikeData });
    }
    if (form.components?.length) {
      const comps = form.components.map((c, i) => ({ id: generateId("c"), bike_id: bikeId, name: c.name, condition: c.condition, last_replaced: c.lastReplaced || c.last_replaced }));
      await supabase.from("components").insert(comps);
    }
    await fetchAll(); closeModal(); setSaving(false);
  };

  const deleteBike = async (id) => {
    await supabase.from("components").delete().eq("bike_id", id);
    await supabase.from("bikes").delete().eq("id", id);
    await fetchAll();
  };

  const addComponent = () => setForm(f => ({ ...f, components: [...(f.components||[]), { name: "", condition: "good", lastReplaced: new Date().toISOString().split("T")[0] }] }));
  const updateComp = (i, field, val) => { const c = [...form.components]; c[i] = { ...c[i], [field]: val }; setForm(f => ({ ...f, components: c })); };
  const removeComp = (i) => setForm(f => ({ ...f, components: f.components.filter((_, idx) => idx !== i) }));

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0F172A" }}>Bikes</h1>
          <p style={{ margin: "2px 0 0", color: "#64748B", fontSize: 13 }}>{bikes.length} bikes in fleet</p>
        </div>
        <button onClick={openAdd} style={btnPrimary}><Icon name="plus" size={16} /> Add Bike</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {bikes.map(bike => (
          <div key={bike.id} style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #F1F5F9" }}>
            <div style={{ height: 6, background: bike.color }} />
            <div style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: "#0F172A" }}>{bike.name}</div>
                  <div style={{ fontSize: 12, color: "#94A3B8" }}>{bike.type}</div>
                </div>
                <Badge status={bike.status} />
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <div style={{ background: "#F8FAFC", borderRadius: 8, padding: "8px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#1E40AF" }}>${bike.hourly_rate || bike.hourlyRate}</div>
                  <div style={{ fontSize: 10, color: "#94A3B8" }}>per hour</div>
                </div>
                <div style={{ background: "#F8FAFC", borderRadius: 8, padding: "8px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#1E40AF" }}>${bike.daily_rate || bike.dailyRate}</div>
                  <div style={{ fontSize: 10, color: "#94A3B8" }}>per day</div>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Components ({(bike.components||[]).length})</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {(bike.components||[]).map((c, i) => (
                    <span key={i} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: statusColors[c.condition]?.bg || "#F1F5F9", color: statusColors[c.condition]?.text || "#374151" }}>{c.name}</span>
                  ))}
                  {(bike.components||[]).length === 0 && <span style={{ fontSize: 11, color: "#94A3B8" }}>No components tracked</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => openEdit(bike)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: 8, background: "#F1F5F9", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#374151" }}><Icon name="edit" size={14} /> Edit</button>
                <button onClick={() => deleteBike(bike.id)} style={{ padding: "8px 12px", background: "#FEE2E2", border: "none", borderRadius: 8, cursor: "pointer", color: "#DC2626" }}><Icon name="trash" size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal === "bike" && (
        <Modal title={editId ? "Edit Bike" : "Add Bike"} onClose={closeModal}>
          <Field label="Bike Name"><input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Trek FX 3" /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
            <Field label="Hourly Rate ($)"><input type="number" style={inputStyle} value={form.hourlyRate} onChange={e => setForm(f => ({ ...f, hourlyRate: +e.target.value }))} /></Field>
            <Field label="Daily Rate ($)"><input type="number" style={inputStyle} value={form.dailyRate} onChange={e => setForm(f => ({ ...f, dailyRate: +e.target.value }))} /></Field>
          </div>
          <Field label="Accent Color">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ width: 42, height: 36, border: "1.5px solid #E2E8F0", borderRadius: 8, cursor: "pointer", padding: 2 }} />
              <span style={{ fontSize: 13, color: "#64748B" }}>{form.color}</span>
            </div>
          </Field>
          <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <label style={{ fontWeight: 700, fontSize: 13, color: "#374151" }}>Components</label>
              <button onClick={addComponent} style={{ fontSize: 12, color: "#1E40AF", background: "#EFF6FF", border: "none", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>+ Add</button>
            </div>
            {(form.components||[]).map((c, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8, marginBottom: 8, alignItems: "center" }}>
                <input style={inputStyle} value={c.name} onChange={e => updateComp(i, "name", e.target.value)} placeholder="Name" />
                <select style={selectStyle} value={c.condition} onChange={e => updateComp(i, "condition", e.target.value)}>
                  {["good","fair","worn"].map(s => <option key={s}>{s}</option>)}
                </select>
                <input type="date" style={inputStyle} value={c.lastReplaced || c.last_replaced || ""} onChange={e => updateComp(i, "lastReplaced", e.target.value)} />
                <button onClick={() => removeComp(i)} style={{ background: "#FEE2E2", border: "none", borderRadius: 6, padding: "8px 10px", cursor: "pointer", color: "#DC2626" }}><Icon name="trash" size={12} /></button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button onClick={closeModal} style={btnSecondary}>Cancel</button>
            <button onClick={saveBike} disabled={saving} style={btnSave}>{saving ? "Saving..." : "Save Bike"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── RENTALS ──────────────────────────────────────────────────────────────────
function Rentals({ rentals, bikes, fetchAll, modal, setModal }) {
  const emptyRental = { bikeId: "", customerName: "", customerEmail: "", customerPhone: "", startDate: "", endDate: "", type: "daily", amount: 0, status: "upcoming", notes: "" };
  const [form, setForm] = useState(emptyRental);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setForm(emptyRental); setEditId(null); setModal("rental"); };
  const openEdit = (r) => { setForm({ ...r, bikeId: r.bike_id || r.bikeId, customerName: r.customer_name || r.customerName, customerEmail: r.customer_email || r.customerEmail, customerPhone: r.customer_phone || r.customerPhone, startDate: r.start_date || r.startDate, endDate: r.end_date || r.endDate, type: r.rental_type || r.type }); setEditId(r.id); setModal("rental"); };
  const closeModal = () => { setModal(null); setEditId(null); };

  const saveRental = async () => {
    setSaving(true);
    const data = { bike_id: form.bikeId, customer_name: form.customerName, customer_email: form.customerEmail, customer_phone: form.customerPhone, start_date: form.startDate, end_date: form.endDate, rental_type: form.type, amount: form.amount, status: form.status, notes: form.notes };
    if (editId) await supabase.from("rentals").update(data).eq("id", editId);
    else await supabase.from("rentals").insert({ id: generateId("r"), ...data });
    await fetchAll(); closeModal(); setSaving(false);
  };

  const deleteRental = async (id) => { await supabase.from("rentals").delete().eq("id", id); await fetchAll(); };

  const filtered = filter === "all" ? rentals : rentals.filter(r => r.status === filter);

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0F172A" }}>Rentals</h1>
          <p style={{ margin: "2px 0 0", color: "#64748B", fontSize: 13 }}>{rentals.length} total rentals</p>
        </div>
        <button onClick={openAdd} style={btnPrimary}><Icon name="plus" size={16} /> New Rental</button>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {["all","active","upcoming","completed"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 14px", borderRadius: 20, border: "1.5px solid", fontSize: 13, fontWeight: 600, cursor: "pointer", background: filter === f ? "#1E40AF" : "#fff", color: filter === f ? "#fff" : "#64748B", borderColor: filter === f ? "#1E40AF" : "#E2E8F0" }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#F8FAFC" }}>
              {["Customer","Bike","Dates","Amount","Status","Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#374151", fontSize: 12, borderBottom: "1px solid #F1F5F9" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => {
              const bike = bikes.find(b => b.id === (r.bike_id || r.bikeId));
              const name = r.customer_name || r.customerName;
              const email = r.customer_email || r.customerEmail;
              const start = r.start_date || r.startDate;
              const end = r.end_date || r.endDate;
              return (
                <tr key={r.id} style={{ borderBottom: "1px solid #F8FAFC", background: i % 2 === 0 ? "#fff" : "#FAFAFE" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 600, color: "#0F172A" }}>{name}</div>
                    <div style={{ fontSize: 11, color: "#94A3B8" }}>{email}</div>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#374151" }}>{bike?.name || "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ color: "#374151" }}>{start}</div>
                    <div style={{ fontSize: 11, color: "#94A3B8" }}>to {end}</div>
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "#059669" }}>${r.amount}</td>
                  <td style={{ padding: "12px 16px" }}><Badge status={r.status} /></td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openEdit(r)} style={{ background: "#F1F5F9", border: "none", borderRadius: 6, padding: 6, cursor: "pointer", color: "#374151" }}><Icon name="edit" size={13} /></button>
                      <button onClick={() => deleteRental(r.id)} style={{ background: "#FEE2E2", border: "none", borderRadius: 6, padding: 6, cursor: "pointer", color: "#DC2626" }}><Icon name="trash" size={13} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#94A3B8" }}>No rentals found</td></tr>}
          </tbody>
        </table>
      </div>

      {modal === "rental" && (
        <Modal title={editId ? "Edit Rental" : "New Rental"} onClose={closeModal}>
          <Field label="Customer Name"><input style={inputStyle} value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} placeholder="Full name" /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Email"><input style={inputStyle} value={form.customerEmail} onChange={e => setForm(f => ({ ...f, customerEmail: e.target.value }))} placeholder="email@example.com" /></Field>
            <Field label="Phone"><input style={inputStyle} value={form.customerPhone} onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))} placeholder="555-0000" /></Field>
          </div>
          <Field label="Bike">
            <select style={selectStyle} value={form.bikeId} onChange={e => setForm(f => ({ ...f, bikeId: e.target.value }))}>
              <option value="">Select a bike</option>
              {bikes.map(b => <option key={b.id} value={b.id}>{b.name} — ${b.daily_rate || b.dailyRate}/day</option>)}
            </select>
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Start Date"><input type="date" style={inputStyle} value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></Field>
            <Field label="End Date"><input type="date" style={inputStyle} value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></Field>
            <Field label="Amount ($)"><input type="number" style={inputStyle} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: +e.target.value }))} /></Field>
            <Field label="Status">
              <select style={selectStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {["upcoming","active","completed"].map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Notes"><textarea style={{ ...inputStyle, resize: "vertical", minHeight: 60 }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes..." /></Field>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={closeModal} style={btnSecondary}>Cancel</button>
            <button onClick={saveRental} disabled={saving} style={btnSave}>{saving ? "Saving..." : "Save Rental"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── MAINTENANCE ──────────────────────────────────────────────────────────────
function MaintenanceTab({ maintenance, bikes, fetchAll, modal, setModal }) {
  const emptyM = { bikeId: "", type: "Inspection", description: "", scheduledDate: "", status: "scheduled", cost: 0, technicianName: "" };
  const [form, setForm] = useState(emptyM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setForm(emptyM); setEditId(null); setModal("maint"); };
  const openEdit = (m) => { setForm({ ...m, bikeId: m.bike_id || m.bikeId, scheduledDate: m.scheduled_date || m.scheduledDate, technicianName: m.technician_name || m.technicianName }); setEditId(m.id); setModal("maint"); };
  const closeModal = () => { setModal(null); setEditId(null); };

  const save = async () => {
    setSaving(true);
    const data = { bike_id: form.bikeId, type: form.type, description: form.description, scheduled_date: form.scheduledDate, status: form.status, cost: form.cost, technician_name: form.technicianName };
    if (editId) await supabase.from("maintenance").update(data).eq("id", editId);
    else await supabase.from("maintenance").insert({ id: generateId("m"), ...data });
    await fetchAll(); closeModal(); setSaving(false);
  };

  const del = async (id) => { await supabase.from("maintenance").delete().eq("id", id); await fetchAll(); };
  const markDone = async (id) => { await supabase.from("maintenance").update({ status: "completed" }).eq("id", id); await fetchAll(); };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0F172A" }}>Maintenance</h1>
          <p style={{ margin: "2px 0 0", color: "#64748B", fontSize: 13 }}>{maintenance.filter(m => m.status === "scheduled").length} scheduled</p>
        </div>
        <button onClick={openAdd} style={btnPrimary}><Icon name="plus" size={16} /> Schedule Maintenance</button>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {maintenance.map(m => {
          const bike = bikes.find(b => b.id === (m.bike_id || m.bikeId));
          const sDate = m.scheduled_date || m.scheduledDate;
          const tech = m.technician_name || m.technicianName;
          return (
            <div key={m.id} style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: m.status === "completed" ? "#DCFCE7" : "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                {m.status === "completed" ? "✅" : "🔧"}
              </div>
              <div style={{ flex: 1, minWidth: 150 }}>
                <div style={{ fontWeight: 700, color: "#0F172A", fontSize: 15 }}>{m.type} — {bike?.name || "Unknown Bike"}</div>
                <div style={{ color: "#64748B", fontSize: 13, marginTop: 2 }}>{m.description}</div>
                <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>🗓 {sDate} · 👤 {tech}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 800, fontSize: 18, color: "#0F172A" }}>${m.cost}</div>
                <Badge status={m.status} />
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {m.status === "scheduled" && <button onClick={() => markDone(m.id)} style={{ background: "#DCFCE7", border: "none", borderRadius: 8, padding: "8px 12px", cursor: "pointer", color: "#166534", fontWeight: 600, fontSize: 12 }}>✓ Done</button>}
                <button onClick={() => openEdit(m)} style={{ background: "#F1F5F9", border: "none", borderRadius: 8, padding: 8, cursor: "pointer", color: "#374151" }}><Icon name="edit" size={14} /></button>
                <button onClick={() => del(m.id)} style={{ background: "#FEE2E2", border: "none", borderRadius: 8, padding: 8, cursor: "pointer", color: "#DC2626" }}><Icon name="trash" size={14} /></button>
              </div>
            </div>
          );
        })}
        {maintenance.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>No maintenance records yet</div>}
      </div>

      {modal === "maint" && (
        <Modal title={editId ? "Edit Maintenance" : "Schedule Maintenance"} onClose={closeModal}>
          <Field label="Bike">
            <select style={selectStyle} value={form.bikeId} onChange={e => setForm(f => ({ ...f, bikeId: e.target.value }))}>
              <option value="">Select a bike</option>
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
            <Field label="Scheduled Date"><input type="date" style={inputStyle} value={form.scheduledDate} onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))} /></Field>
            <Field label="Cost ($)"><input type="number" style={inputStyle} value={form.cost} onChange={e => setForm(f => ({ ...f, cost: +e.target.value }))} /></Field>
          </div>
          <Field label="Technician Name"><input style={inputStyle} value={form.technicianName} onChange={e => setForm(f => ({ ...f, technicianName: e.target.value }))} placeholder="e.g. Mike T." /></Field>
          <Field label="Description"><textarea style={{ ...inputStyle, resize: "vertical", minHeight: 70 }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the work needed..." /></Field>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={closeModal} style={btnSecondary}>Cancel</button>
            <button onClick={save} disabled={saving} style={btnSave}>{saving ? "Saving..." : "Save"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── CALENDAR ─────────────────────────────────────────────────────────────────
function CalendarView({ rentals, bikes }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const getBookingsForDay = (day) => {
    const date = `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    return rentals.filter(r => {
      const start = r.start_date || r.startDate;
      const end = r.end_date || r.endDate;
      return start <= date && end >= date;
    });
  };

  const monthCount = rentals.filter(r => { const d = new Date(r.start_date || r.startDate); return d.getFullYear() === year && d.getMonth() === month; }).length;
  const yearCount = rentals.filter(r => new Date(r.start_date || r.startDate).getFullYear() === year).length;
  const monthRevenue = rentals.filter(r => { const d = new Date(r.start_date || r.startDate); return d.getFullYear() === year && d.getMonth() === month && r.status === "completed"; }).reduce((s, r) => s + Number(r.amount), 0);

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0F172A" }}>Calendar</h1>
          <p style={{ margin: "2px 0 0", color: "#64748B", fontSize: 13 }}>Rental schedule overview</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); }} style={{ background: "#F1F5F9", border: "none", borderRadius: 8, padding: 8, cursor: "pointer" }}><Icon name="chevronLeft" size={16} /></button>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#0F172A", minWidth: 140, textAlign: "center" }}>{monthNames[month]} {year}</span>
          <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); }} style={{ background: "#F1F5F9", border: "none", borderRadius: 8, padding: 8, cursor: "pointer" }}><Icon name="chevronRight" size={16} /></button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {[
          { label: `Bookings in ${monthNames[month]}`, value: monthCount, icon: "📅", color: "#3B82F6" },
          { label: `Bookings in ${year}`, value: yearCount, icon: "📆", color: "#8B5CF6" },
          { label: "Revenue this month", value: `$${monthRevenue}`, icon: "💵", color: "#22C55E" },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: "#fff", borderRadius: 12, padding: "14px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 20 }}>{s.icon}</div>
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
            const bookings = day ? getBookingsForDay(day) : [];
            const isToday = day && year === now.getFullYear() && month === now.getMonth() && day === now.getDate();
            return (
              <div key={i} style={{ background: "#fff", minHeight: 82, padding: "6px 8px" }}>
                {day && (
                  <>
                    <div style={{ fontSize: 13, fontWeight: isToday ? 800 : 500, color: isToday ? "#fff" : "#374151", width: 24, height: 24, borderRadius: "50%", background: isToday ? "#1E40AF" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>{day}</div>
                    {bookings.slice(0, 2).map(r => {
                      const bike = bikes.find(b => b.id === (r.bike_id || r.bikeId));
                      return (
                        <div key={r.id} style={{ fontSize: 10, padding: "2px 5px", borderRadius: 4, marginBottom: 2, fontWeight: 600, background: (bike?.color || "#3B82F6") + "22", color: bike?.color || "#1E40AF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {bike?.name || "Bike"}
                        </div>
                      );
                    })}
                    {bookings.length > 2 && <div style={{ fontSize: 10, color: "#94A3B8" }}>+{bookings.length - 2} more</div>}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        {bikes.map(b => (
          <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#374151" }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: b.color, display: "inline-block" }} />
            {b.name}
          </div>
        ))}
      </div>
    </div>
  );
}
