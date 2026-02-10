import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, Search, Calendar, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { electionAPI } from "@/services/api";
import { cn } from "@/lib/utils";

// // --- Nebula Background (Light) ---
// const NebulaBackground = () => (
//   <div className="fixed inset-0 z-[-1] bg-slate-50 overflow-hidden">
//     <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-indigo-200/40 rounded-full blur-[120px] mix-blend-multiply animate-blob" />
//     <div className="absolute top-[20%] right-[-20%] w-[60vw] h-[60vw] bg-purple-200/40 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-2000" />
//     <div className="absolute bottom-[-20%] left-[20%] w-[50vw] h-[50vw] bg-blue-200/40 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-4000" />
//     <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
//   </div>
// );

// --- Aerogel Card (Light) ---
const AerogelCard = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={cn(
      "relative overflow-hidden rounded-3xl border border-white/40 bg-white/60 backdrop-blur-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:bg-white/80 hover:border-white/60 group",
      className
    )}
  >
    {children}
  </motion.div>
);

const ElectionManagement = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingElection, setEditingElection] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", startDate: "", endDate: "" });

  const fetchElections = async () => {
    setLoading(true);
    try {
      const { data } = await electionAPI.getAll();
      setElections(data);
    } catch (error) {
      console.error("Failed to fetch elections:", error);
      toast.error("Failed to load elections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const filtered = elections.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || e.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleSave = async () => {
    try {
      if (editingElection) {
        await electionAPI.update(editingElection._id, form);
        toast.success("Election data updated");
      } else {
        await electionAPI.create(form);
        toast.success("New election initialized");
      }
      fetchElections();
      setDialogOpen(false);
      setEditingElection(null);
      setForm({ name: "", description: "", startDate: "", endDate: "" });
    } catch (error) {
      console.error(error);
      if (error.response?.status === 404) {
        toast.error("SERVER RESTART REQUIRED: Update endpoint missing. Please restart backend.");
      } else {
        toast.error(error.response?.data?.message || "Operation failed");
      }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this election?")) return;
    try {
      await electionAPI.delete(id);
      toast.success("Election deleted");
      setElections((prev) => prev.filter((e) => e._id !== id));
    } catch (error) {
      toast.error("Failed to delete election");
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "closed" : "active";
      await electionAPI.updateStatus(id, newStatus);
      setElections(
        (prev) => prev.map((e) => {
          if (e._id !== id) return e;
          return { ...e, status: newStatus, resultsPublished: newStatus === "closed" };
        })
      );
      toast.success(`Status changed to ${newStatus.toUpperCase()}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const openEdit = (election) => {
    setEditingElection(election);
    setForm({
      name: election.name,
      description: election.description,
      startDate: election.startDate ? new Date(election.startDate).toISOString().split('T')[0] : "",
      endDate: election.endDate ? new Date(election.endDate).toISOString().split('T')[0] : ""
    });
    setDialogOpen(true);
  };

  // Calculate progress percentage
  const getProgress = (start, end) => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const now = new Date().getTime();
    if (now < s) return 0;
    if (now > e) return 100;
    return ((now - s) / (e - s)) * 100;
  };

  return (
    <div className="min-h-screen text-slate-900 font-sans relative pb-20">
      {/* <NebulaBackground /> */}

      <div className="max-w-[1600px] mx-auto space-y-10 px-6 pt-12 relative z-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 mb-2 text-indigo-600"
            >
              <Layers className="w-5 h-5" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase">Administration Layer</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-2"
            >
              Election<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">Stream</span>
            </motion.h1>
            <p className="text-slate-500 text-lg max-w-xl font-medium">
              Manage active voting instances, valid candidates, and real-time operational status.
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => { setEditingElection(null); setForm({ name: "", description: "", startDate: "", endDate: "" }); }}
                className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-bold text-sm tracking-wide hover:bg-slate-800 hover:scale-105 transition-all shadow-lg shadow-slate-900/20"
              >
                <Plus className="w-5 h-5 mr-2" />
                Initialize Election
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-none bg-white/80 backdrop-blur-3xl shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-900">
                  {editingElection ? "Modify Parameters" : "New Election Instance"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 mt-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Instance Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-12 bg-white/50 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-indigo-500/50"
                    placeholder="e.g. Annual Council Vote"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</Label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="h-12 bg-white/50 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400"
                    placeholder="Brief description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Start Date</Label>
                    <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="h-12 bg-white/50 border-slate-200 rounded-xl text-slate-900" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">End Date</Label>
                    <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="h-12 bg-white/50 border-slate-200 rounded-xl text-slate-900" />
                  </div>
                </div>
                <Button onClick={handleSave} className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:brightness-110 mt-2 shadow-lg shadow-indigo-500/30">
                  {editingElection ? "Update Instance" : "Create Instance"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Control Deck */}
        <div className="sticky top-4 z-50">
          <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl p-2 flex flex-col md:flex-row gap-2 shadow-lg shadow-slate-200/50">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter stream data..."
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-transparent text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white/50 transition-all font-medium"
              />
            </div>
            <div className="h-px md:h-12 w-full md:w-px bg-slate-200" />
            <div className="flex bg-slate-100/50 rounded-xl p-1 overflow-x-auto">
              {["all", "active", "upcoming", "closed"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn("px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap",
                    filter === f ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Election Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="col-span-full py-20 text-center animate-pulse text-indigo-400">
                Loading stream...
              </div>
            ) : filtered.length === 0 ? (
              <div className="col-span-full py-20 text-center text-slate-400">
                No election instances found.
              </div>
            ) : (
              filtered.map((election, i) => (
                <AerogelCard key={election._id} delay={i * 0.05} className="flex flex-col h-full min-h-[320px]">
                  {/* Card Top */}
                  <div className="p-6 md:p-8 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                        election.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm" :
                          election.status === 'upcoming' ? "bg-blue-50 text-blue-600 border-blue-100" :
                            "bg-slate-100 text-slate-500 border-slate-200"
                      )}>
                        {election.status}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" onClick={() => openEdit(election)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(election._id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
                      {election.name}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                      {election.description}
                    </p>

                    {/* Date Grid */}
                    <div className="grid grid-cols-2 gap-4 text-xs font-mono text-slate-500 bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                      <div>
                        <span className="block text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-1">Start Date</span>
                        <span className="text-slate-600 font-bold">{new Date(election.startDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-1">End Date</span>
                        <span className="text-slate-600 font-bold">{new Date(election.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom / Stats */}
                  <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-4">
                    <div className="flex gap-4 px-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Votes</span>
                        <span className="text-lg font-bold text-slate-700">{election.totalVotes || 0}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Cand.</span>
                        <span className="text-lg font-bold text-slate-700">{election.candidateCount || 0}</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => toggleStatus(election._id, election.status)}
                      size="sm"
                      className={cn(
                        "font-bold text-xs uppercase tracking-wide transition-all shadow-md",
                        election.status === 'active'
                          ? "bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 shadow-rose-100"
                          : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/20"
                      )}
                    >
                      {election.status === 'active' ? "Stop" : "Activate"}
                    </Button>
                  </div>

                  {/* Progress Line */}
                  <div className="h-1 w-full bg-slate-100">
                    <motion.div
                      className={cn("h-full", election.status === 'active' ? "bg-emerald-500" : "bg-indigo-500")}
                      initial={{ width: 0 }}
                      animate={{ width: `${getProgress(election.startDate, election.endDate)}%` }}
                    />
                  </div>
                </AerogelCard>
              ))
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default ElectionManagement;
