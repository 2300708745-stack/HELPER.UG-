import React, { useState, useEffect, useCallback } from "react";
import {
  Home, PlusCircle, Search, User, MapPin, Clock, Star,
  Wrench, Truck, Sparkles, Laptop, Package, FileText,
  CheckCircle2, ShieldCheck, Send, Award, TrendingUp,
  Smartphone, AlertCircle, Loader2, RefreshCw
} from "lucide-react";
import { supabase } from "./supabaseClient";

/* DESIGN TOKENS
   Ink Navy #14213D | Paper #F7F4EC | Signal Amber #FFB627
   Helper Green #2D6A4F | Slate #6B7280 | Alert Coral #E4572E */

const CATEGORIES = [
  { id: "errand", label: "Errands", icon: Package, color: "#FFB627" },
  { id: "repair", label: "Repairs", icon: Wrench, color: "#E4572E" },
  { id: "clean", label: "Cleaning", icon: Sparkles, color: "#2D6A4F" },
  { id: "move", label: "Moving", icon: Truck, color: "#14213D" },
  { id: "tech", label: "Tech Help", icon: Laptop, color: "#FFB627" },
  { id: "paper", label: "Paperwork", icon: FileText, color: "#2D6A4F" },
];

const AREAS = [
  "Kololo", "Nakasero", "Ntinda", "Naalya", "Kiwatule", "Bugolobi",
  "Muyenga", "Kamwokya", "Wandegeya", "Kansanga", "Kabalagala",
  "Bukoto", "Makindye", "Ntinda-Kisaasi", "Najjera",
];

const PAYMENT_METHODS = ["MTN Mobile Money", "Airtel Money", "Cash on completion"];
const NAME_KEY = "helper_kampala_name";

function ugx(n) { return "USh " + Number(n).toLocaleString("en-UG"); }
function catMeta(id) { return CATEGORIES.find((c) => c.id === id) || CATEGORIES[0]; }

function Spinner({ label }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10" style={{ color: "#6B7280" }}>
      <Loader2 size={18} className="animate-spin" />
      <span className="text-[13px]">{label}</span>
    </div>
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="mx-5 mb-4 flex items-center justify-between gap-3 rounded-xl px-4 py-3" style={{ background: "#FDEDE8", border: "1px solid #E4572E" }}>
      <div className="flex items-center gap-2">
        <AlertCircle size={16} color="#E4572E" />
        <span className="text-[12px]" style={{ color: "#B23A1D" }}>{message}</span>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: "#E4572E" }}>
          <RefreshCw size={12} /> Retry
        </button>
      )}
    </div>
  );
}

function Ticket({ children, className = "" }) {
  return (
    <div className={`relative bg-white overflow-hidden ${className}`} style={{ borderRadius: 10, boxShadow: "0 1px 2px rgba(20,33,61,0.06), 0 6px 16px rgba(20,33,61,0.08)" }}>
      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full" style={{ background: "#F7F4EC" }} />
      <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full" style={{ background: "#F7F4EC" }} />
      {children}
    </div>
  );
}
function TicketDivider() { return <div className="px-4"><div className="w-full" style={{ borderTop: "2px dashed #E2DFD5" }} /></div>; }

function TopBar({ name, onSwitchUser }) {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between px-5 py-3" style={{ background: "#14213D" }}>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "#FFB627" }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, color: "#14213D" }}>H</span>
        </div>
        <div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: "#FFF" }}>Helper Kampala</div>
          <div className="text-[10px]" style={{ color: "#8891A3", fontFamily: "'IBM Plex Mono', monospace" }}>KAMPALA</div>
        </div>
      </div>
      <button onClick={onSwitchUser} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "#1F2C50" }}>
        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#FFB627" }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 9, color: "#14213D" }}>{name ? name.slice(0, 1).toUpperCase() : "?"}</span>
        </div>
        <span className="text-[11px] font-medium" style={{ color: "#FFF" }}>{name}</span>
      </button>
    </div>
  );
}

function TabBar({ active, setActive }) {
  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "post", label: "Post", icon: PlusCircle },
    { id: "browse", label: "Browse", icon: Search },
    { id: "mine", label: "My Tasks", icon: User },
  ];
  return (
    <div className="sticky bottom-0 z-30 flex justify-around items-center py-2.5 px-2" style={{ background: "#14213D", borderTop: "1px solid #24304F" }}>
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.id;
        return (
          <button key={t.id} onClick={() => setActive(t.id)} className="flex flex-col items-center gap-1 px-3 py-1">
            <Icon size={19} color={isActive ? "#FFB627" : "#8891A3"} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[9.5px] font-semibold" style={{ color: isActive ? "#FFB627" : "#8891A3", fontFamily: "'IBM Plex Mono', monospace" }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ScreenHeader({ eyebrow, title, sub }) {
  return (
    <div className="px-5 pt-5 pb-4">
      {eyebrow && <div className="text-[10px] font-semibold tracking-[0.2em] mb-1" style={{ color: "#FFB627", fontFamily: "'IBM Plex Mono', monospace" }}>{eyebrow}</div>}
      <h1 style={{ color: "#14213D", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 21 }}>{title}</h1>
      {sub && <p className="text-[12px] mt-1" style={{ color: "#6B7280" }}>{sub}</p>}
    </div>
  );
}

function Onboarding({ onSaved }) {
  const [name, setName] = useState("");
  const submit = () => {
    if (!name.trim()) return;
    localStorage.setItem(NAME_KEY, name.trim());
    onSaved(name.trim());
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#14213D" }}>
      <div className="w-full max-w-sm">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: "#FFB627" }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, color: "#14213D" }}>H</span>
        </div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, color: "#FFF" }}>Get things done in Kampala</h1>
        <p className="text-[13px] mt-2 mb-8" style={{ color: "#8891A3" }}>Post a task or pick one up nearby. What should we call you?</p>
        <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Your name" className="w-full rounded-xl px-4 py-3.5 text-[14px] outline-none mb-3" style={{ background: "#1F2C50", color: "#FFF" }} />
        <button onClick={submit} disabled={!name.trim()} className="w-full py-3.5 rounded-xl" style={{ background: "#FFB627", color: "#14213D", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, opacity: !name.trim() ? 0.6 : 1 }}>
          Continue
        </button>
      </div>
    </div>
  );
}

function TaskTicket({ task, viewerName, compact, footer }) {
  const cat = catMeta(task.category);
  const iAmRequester = task.requester_name === viewerName;
  const roleLabel = iAmRequester ? "YOU POSTED" : task.helper_name === viewerName ? "YOU'RE HELPING" : "";
  return (
    <Ticket>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2 gap-2">
          <span className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded" style={{ color: "#14213D", background: cat.color + "33", fontFamily: "'IBM Plex Mono', monospace" }}>{cat.label.toUpperCase()}</span>
          <span className="text-[9.5px] font-bold tracking-widest px-2 py-0.5 rounded" style={{
            color: task.status === "open" ? "#B77400" : task.status === "accepted" ? "#E4572E" : "#2D6A4F",
            background: task.status === "open" ? "#FFF3D6" : task.status === "accepted" ? "#FDEDE8" : "#E6F2EC",
            fontFamily: "'IBM Plex Mono', monospace",
          }}>{task.status === "open" ? "OPEN" : task.status === "accepted" ? "IN PROGRESS" : "COMPLETED"}</span>
        </div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, color: "#14213D" }}>{task.title}</div>
        {!compact && task.description && <p className="text-[12px] mt-1" style={{ color: "#6B7280" }}>{task.description}</p>}
        <div className="flex items-center gap-3 mt-2 flex-wrap text-[11px]" style={{ color: "#6B7280" }}>
          <span className="flex items-center gap-1"><MapPin size={11} /> {task.area}</span>
          <span className="flex items-center gap-1"><Clock size={11} /> {task.urgency === "asap" ? "ASAP" : "Scheduled"}</span>
          <span className="flex items-center gap-1"><Smartphone size={11} /> {task.payment_method}</span>
        </div>
        {roleLabel && <div className="text-[10px] font-semibold tracking-widest mt-2" style={{ color: "#14213D", fontFamily: "'IBM Plex Mono', monospace" }}>{roleLabel}</div>}
      </div>
      <TicketDivider />
      <div className="p-4 flex items-center justify-between">
        <span className="text-[16px] font-bold" style={{ color: "#2D6A4F", fontFamily: "'IBM Plex Mono', monospace" }}>{ugx(task.budget)}</span>
        {footer}
      </div>
    </Ticket>
  );
}

function HomeScreen({ name, tasks, loading, error, onRetry, goPost, goBrowse, setTab }) {
  const myActive = tasks.filter((t) => (t.requester_name === name || t.helper_name === name) && t.status !== "completed");
  const openNearby = tasks.filter((t) => t.status === "open" && t.requester_name !== name).length;
  return (
    <div>
      <ScreenHeader eyebrow={`HI, ${name.toUpperCase()}`} title="What do you need done today?" />
      <div className="px-5 mb-5">
        <button onClick={goPost} className="w-full flex items-center justify-between px-5 py-4 rounded-2xl" style={{ background: "#FFB627" }}>
          <div className="text-left">
            <div className="text-[11px] font-bold tracking-widest mb-0.5" style={{ color: "#14213D", fontFamily: "'IBM Plex Mono', monospace" }}>NEW TASK</div>
            <div style={{ color: "#14213D", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16 }}>Post a task in under a minute</div>
          </div>
          <Send size={20} color="#14213D" />
        </button>
      </div>
      <div className="px-5 grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-xl p-4" style={{ background: "#FFFFFF", border: "1px solid #ECE9DF" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 20, color: "#14213D" }}>{openNearby}</div>
          <div className="text-[11px]" style={{ color: "#6B7280" }}>Open tasks nearby</div>
        </div>
        <button onClick={goBrowse} className="rounded-xl p-4 text-left" style={{ background: "#14213D" }}>
          <Search size={16} color="#FFB627" />
          <div className="text-[11px] font-semibold mt-2" style={{ color: "#FFF" }}>Browse & earn</div>
        </button>
      </div>
      <div className="px-5 mb-3 text-[11px] font-semibold tracking-[0.15em]" style={{ color: "#6B7280", fontFamily: "'IBM Plex Mono', monospace" }}>YOUR ACTIVE TICKETS</div>
      {loading && <Spinner label="Loading your tasks…" />}
      {error && <ErrorBanner message={error} onRetry={onRetry} />}
      {!loading && !error && myActive.length === 0 && (
        <div className="mx-5 rounded-xl p-6 text-center" style={{ background: "#FFFFFF", border: "1px dashed #C9C5B8" }}>
          <p className="text-[12px]" style={{ color: "#6B7280" }}>Nothing active yet. Post a task or browse ones nearby to pick up.</p>
        </div>
      )}
      <div className="px-5 flex flex-col gap-3 pb-2">
        {myActive.map((t) => <TaskTicket key={t.id} task={t} viewerName={name} />)}
      </div>
    </div>
  );
}

function PostTaskFlow({ name, onCreated }) {
  const [step, setStep] = useState(0);
  const [cat, setCat] = useState(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [area, setArea] = useState(AREAS[0]);
  const [budget, setBudget] = useState(15000);
  const [urgency, setUrgency] = useState("scheduled");
  const [payment, setPayment] = useState(PAYMENT_METHODS[0]);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const steps = ["Category", "Details", "Budget", "Confirm"];

  const post = async () => {
    setPosting(true); setError(null);
    try {
      await onCreated({
        category: cat, title: title.trim() || catMeta(cat).label, description: desc.trim(),
        area, budget, urgency, payment_method: payment, requester_name: name,
        helper_name: null, status: "open",
      });
      setStep(0); setCat(null); setTitle(""); setDesc(""); setBudget(15000); setUrgency("scheduled");
    } catch (e) {
      setError("Couldn't post your task — check your connection and try again.");
    } finally { setPosting(false); }
  };

  return (
    <div>
      <div className="px-5 pt-5 pb-4">
        <div className="text-[11px] font-semibold tracking-[0.2em]" style={{ color: "#FFB627", fontFamily: "'IBM Plex Mono', monospace" }}>NEW TASK · STEP {step + 1} OF 4</div>
      </div>
      <div className="px-5 flex gap-1.5 mb-6">
        {steps.map((s, i) => <div key={s} className="h-1 flex-1 rounded-full" style={{ background: i <= step ? "#FFB627" : "#ECE9DF" }} />)}
      </div>

      {step === 0 && (
        <div className="px-5">
          <h2 className="mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 19, color: "#14213D" }}>What kind of help?</h2>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((c) => {
              const Icon = c.icon; const selected = cat === c.id;
              return (
                <button key={c.id} onClick={() => setCat(c.id)} className="flex flex-col items-start gap-3 p-4 rounded-xl text-left"
                  style={{ background: selected ? "#14213D" : "#FFFFFF", border: selected ? "1px solid #14213D" : "1px solid #ECE9DF" }}>
                  <Icon size={19} color={selected ? "#FFB627" : c.color} />
                  <span className="text-[13px] font-medium" style={{ color: selected ? "#FFF" : "#14213D" }}>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      {step === 1 && (
        <div className="px-5">
          <h2 className="mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 19, color: "#14213D" }}>Describe the task</h2>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short title, e.g. Fix leaking kitchen tap"
            className="w-full rounded-xl px-4 py-3 text-[13px] outline-none mb-3" style={{ background: "#FFFFFF", border: "1px solid #ECE9DF", color: "#14213D" }} />
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Add details a Helper would need to know…"
            className="w-full rounded-xl p-4 text-[13px] outline-none mb-4" style={{ background: "#FFFFFF", border: "1px solid #ECE9DF", minHeight: 90, color: "#14213D" }} />
          <label className="text-[11px] font-semibold tracking-wide" style={{ color: "#6B7280" }}>AREA</label>
          <select value={area} onChange={(e) => setArea(e.target.value)} className="w-full rounded-xl px-4 py-3 text-[13px] outline-none mt-1 mb-4" style={{ background: "#FFFFFF", border: "1px solid #ECE9DF", color: "#14213D" }}>
            {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={() => setUrgency("asap")} className="flex-1 py-3 rounded-xl text-[12px] font-semibold" style={{ background: urgency === "asap" ? "#E4572E" : "#FFFFFF", color: urgency === "asap" ? "#FFF" : "#14213D", border: "1px solid " + (urgency === "asap" ? "#E4572E" : "#ECE9DF") }}>ASAP</button>
            <button onClick={() => setUrgency("scheduled")} className="flex-1 py-3 rounded-xl text-[12px] font-semibold" style={{ background: urgency === "scheduled" ? "#14213D" : "#FFFFFF", color: urgency === "scheduled" ? "#FFF" : "#14213D", border: "1px solid " + (urgency === "scheduled" ? "#14213D" : "#ECE9DF") }}>Schedule later</button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="px-5">
          <h2 className="mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 19, color: "#14213D" }}>Set your budget</h2>
          <p className="text-[12px] mb-5" style={{ color: "#6B7280" }}>Helpers can still send offers above or below this.</p>
          <div className="flex flex-col items-center py-4">
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#14213D" }} className="text-4xl font-bold">{ugx(budget)}</div>
            <input type="range" min={2000} max={200000} step={1000} value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full mt-6 accent-[#FFB627]" />
          </div>
          <label className="text-[11px] font-semibold tracking-wide" style={{ color: "#6B7280" }}>PAYMENT METHOD</label>
          <div className="flex gap-2 mt-2">
            {PAYMENT_METHODS.map((p) => (
              <button key={p} onClick={() => setPayment(p)} className="flex-1 py-2.5 rounded-lg text-[11px] font-medium" style={{ background: payment === p ? "#14213D" : "#FFFFFF", color: payment === p ? "#FFF" : "#14213D", border: "1px solid " + (payment === p ? "#14213D" : "#ECE9DF") }}>{p}</button>
            ))}
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="px-5">
          <h2 className="mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 19, color: "#14213D" }}>Review your ticket</h2>
          <TaskTicket task={{ category: cat, title: title || catMeta(cat).label, description: desc, area, urgency, payment_method: payment, budget, status: "open", requester_name: name, helper_name: null }} viewerName={name} />
          <div className="flex items-center gap-2 mt-4 px-1 text-[11px]" style={{ color: "#6B7280" }}>
            <ShieldCheck size={14} color="#2D6A4F" /> You'll coordinate payment directly with your Helper via {payment} once the task is done.
          </div>
          {error && <div className="mt-3"><ErrorBanner message={error} onRetry={post} /></div>}
        </div>
      )}
      <div className="px-5 mt-8 pb-6">
        <button onClick={() => (step < 3 ? setStep(step + 1) : post())} disabled={(step === 0 && !cat) || posting}
          className="w-full py-4 rounded-xl flex items-center justify-center gap-2"
          style={{ background: (step === 0 && !cat) ? "#ECE9DF" : "#FFB627", color: "#14213D", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, opacity: posting ? 0.7 : 1 }}>
          {posting ? <Loader2 size={16} className="animate-spin" /> : step < 3 ? "Continue" : "Post task"}
        </button>
      </div>
    </div>
  );
}

function BrowseScreen({ name, tasks, loading, error, onRetry, onAccept, acceptingId }) {
  const open = tasks.filter((t) => t.status === "open" && t.requester_name !== name);
  return (
    <div>
      <ScreenHeader eyebrow={`${open.length} NEARBY`} title="Tasks you could pick up" />
      {loading && <Spinner label="Loading open tasks…" />}
      {error && <ErrorBanner message={error} onRetry={onRetry} />}
      {!loading && !error && open.length === 0 && (
        <div className="mx-5 rounded-xl p-6 text-center" style={{ background: "#FFFFFF", border: "1px dashed #C9C5B8" }}>
          <p className="text-[12px]" style={{ color: "#6B7280" }}>No open tasks right now. Check back soon, or post one yourself.</p>
        </div>
      )}
      <div className="px-5 flex flex-col gap-4 pb-6">
        {open.map((t) => (
          <TaskTicket key={t.id} task={t} viewerName={name} footer={
            <button onClick={() => onAccept(t.id)} disabled={acceptingId === t.id}
              className="text-[11px] font-bold px-4 py-2 rounded-lg flex items-center gap-1.5"
              style={{ background: "#14213D", color: "#FFB627", fontFamily: "'IBM Plex Mono', monospace", opacity: acceptingId === t.id ? 0.7 : 1 }}>
              {acceptingId === t.id ? <Loader2 size={12} className="animate-spin" /> : "ACCEPT"}
            </button>
          } />
        ))}
      </div>
    </div>
  );
}

function MyTasksScreen({ name, tasks, loading, error, onRetry, onComplete, onRate, busyId }) {
  const mine = tasks.filter((t) => t.requester_name === name || t.helper_name === name).sort((a, b) => b.created_at - a.created_at);
  const completedAsHelper = tasks.filter((t) => t.helper_name === name && t.status === "completed");
  const earned = completedAsHelper.reduce((sum, t) => sum + Number(t.budget), 0);
  const rated = completedAsHelper.filter((t) => t.rating);
  const avgRating = rated.length ? (rated.reduce((s, t) => s + t.rating, 0) / rated.length).toFixed(1) : null;

  return (
    <div>
      <div className="px-5 pt-5">
        <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: "#14213D" }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "#FFB627" }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 19, color: "#14213D" }}>{name.slice(0, 2).toUpperCase()}</span>
          </div>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: "#FFF" }}>{name}</div>
            <div className="flex items-center gap-1 text-[12px] mt-1" style={{ color: "#FFB627" }}><Star size={12} fill="#FFB627" /> {avgRating || "No ratings yet"}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-xl p-4" style={{ background: "#FFFFFF", border: "1px solid #ECE9DF" }}>
            <TrendingUp size={15} color="#2D6A4F" />
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 17, color: "#14213D" }} className="mt-2">{ugx(earned)}</div>
            <div className="text-[10.5px]" style={{ color: "#6B7280" }}>Earned as Helper</div>
          </div>
          <div className="rounded-xl p-4" style={{ background: "#FFFFFF", border: "1px solid #ECE9DF" }}>
            <Award size={15} color="#FFB627" />
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 17, color: "#14213D" }} className="mt-2">{completedAsHelper.length}</div>
            <div className="text-[10.5px]" style={{ color: "#6B7280" }}>Tasks completed</div>
          </div>
        </div>
      </div>
      <div className="px-5 mt-6 mb-3 text-[11px] font-semibold tracking-[0.15em]" style={{ color: "#6B7280", fontFamily: "'IBM Plex Mono', monospace" }}>YOUR TICKETS</div>
      {loading && <Spinner label="Loading…" />}
      {error && <ErrorBanner message={error} onRetry={onRetry} />}
      {!loading && !error && mine.length === 0 && (
        <div className="mx-5 rounded-xl p-6 text-center" style={{ background: "#FFFFFF", border: "1px dashed #C9C5B8" }}>
          <p className="text-[12px]" style={{ color: "#6B7280" }}>Tasks you post or accept will show up here.</p>
        </div>
      )}
      <div className="px-5 flex flex-col gap-4 pb-6">
        {mine.map((t) => {
          const iAmRequester = t.requester_name === name;
          let footer = null;
          if (t.status === "accepted" && iAmRequester) {
            footer = (
              <button onClick={() => onComplete(t.id)} disabled={busyId === t.id} className="text-[11px] font-bold px-4 py-2 rounded-lg flex items-center gap-1.5" style={{ background: "#2D6A4F", color: "#FFF", fontFamily: "'IBM Plex Mono', monospace", opacity: busyId === t.id ? 0.7 : 1 }}>
                {busyId === t.id ? <Loader2 size={12} className="animate-spin" /> : <><CheckCircle2 size={13} /> MARK DONE</>}
              </button>
            );
          } else if (t.status === "accepted" && !iAmRequester) {
            footer = <span className="text-[11px] font-medium" style={{ color: "#E4572E" }}>Awaiting confirmation</span>;
          } else if (t.status === "completed" && iAmRequester && !t.rating) {
            footer = <div className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => onRate(t.id, n)} disabled={busyId === t.id}><Star size={16} color="#FFB627" fill="none" /></button>)}</div>;
          } else if (t.status === "completed" && t.rating) {
            footer = <div className="flex items-center gap-1">{[...Array(t.rating)].map((_, i) => <Star key={i} size={12} color="#FFB627" fill="#FFB627" />)}</div>;
          }
          return <TaskTicket key={t.id} task={t} viewerName={name} footer={footer} />;
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [name, setName] = useState(() => localStorage.getItem(NAME_KEY));
  const [tab, setTab] = useState("home");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const loadTasks = useCallback(async () => {
    setLoading(true); setError(null);
    const { data, error: err } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
    if (err) { setError("Couldn't load tasks. Check your connection and try again."); }
    else { setTasks(data || []); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!name) return;
    loadTasks();
    // Live updates: refresh whenever any task changes, so all users see a shared, current board
    const channel = supabase
      .channel("tasks-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => loadTasks())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [name, loadTasks]);

  const handleCreate = async (task) => {
    const { error: err } = await supabase.from("tasks").insert([{ ...task, created_at: Date.now() }]);
    if (err) throw err;
    await loadTasks();
    setTab("mine");
  };

  const handleAccept = async (id) => {
    setAcceptingId(id);
    const { error: err } = await supabase.from("tasks").update({ status: "accepted", helper_name: name }).eq("id", id);
    if (err) setError("Couldn't accept the task — try again.");
    await loadTasks();
    setAcceptingId(null);
  };

  const handleComplete = async (id) => {
    setBusyId(id);
    const { error: err } = await supabase.from("tasks").update({ status: "completed" }).eq("id", id);
    if (err) setError("Couldn't update the task — try again.");
    await loadTasks();
    setBusyId(null);
  };

  const handleRate = async (id, rating) => {
    setBusyId(id);
    const { error: err } = await supabase.from("tasks").update({ rating }).eq("id", id);
    if (err) setError("Couldn't save your rating — try again.");
    await loadTasks();
    setBusyId(null);
  };

  const switchUser = () => { localStorage.removeItem(NAME_KEY); setName(null); };

  if (!name) return <Onboarding onSaved={setName} />;

  return (
    <div className="min-h-screen flex justify-center" style={{ background: "#EDEAE0" }}>
      <div className="w-full max-w-md min-h-screen flex flex-col" style={{ background: "#F7F4EC" }}>
        <TopBar name={name} onSwitchUser={switchUser} />
        <div className="flex-1 overflow-y-auto">
          {tab === "home" && <HomeScreen name={name} tasks={tasks} loading={loading} error={error} onRetry={loadTasks} goPost={() => setTab("post")} goBrowse={() => setTab("browse")} setTab={setTab} />}
          {tab === "post" && <PostTaskFlow name={name} onCreated={handleCreate} />}
          {tab === "browse" && <BrowseScreen name={name} tasks={tasks} loading={loading} error={error} onRetry={loadTasks} onAccept={handleAccept} acceptingId={acceptingId} />}
          {tab === "mine" && <MyTasksScreen name={name} tasks={tasks} loading={loading} error={error} onRetry={loadTasks} onComplete={handleComplete} onRate={handleRate} busyId={busyId} />}
        </div>
        <TabBar active={tab} setActive={setTab} />
      </div>
    </div>
  );
}
