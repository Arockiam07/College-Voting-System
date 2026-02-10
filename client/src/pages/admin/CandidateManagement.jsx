import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { Plus, Edit, Trash2, Search, Filter, Layers, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { electionAPI, candidateAPI } from "@/services/api";

// --- 3D Spotlight Tilt Card ---
const SpotlightCard = ({ children, className = "", onClick }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 50 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 50 });

  function onMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    x.set(clientX - left);
    y.set(clientY - top);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      className={`relative group rounded-[2rem] border border-slate-200 bg-white shadow-xl overflow-hidden cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="relative h-full z-10">{children}</div>

      {/* Spotlight Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(14, 165, 233, 0.15),
              transparent 80%
            )
          `,
        }}
      />

      {/* Border Highlight */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              rgba(56, 189, 248, 0.4),
              transparent 80%
            )
          `,
          maskImage: "linear-gradient(black, black) content-box, linear-gradient(black, black)",
          maskComposite: "exclude",
          padding: "1px",
        }}
      />
    </motion.div>
  );
};

const CandidateManagement = () => {
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", department: "", year: "", electionId: "" });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: electionsData } = await electionAPI.getAll();
      setElections(electionsData);
      const { data: candidatesData } = await candidateAPI.getAll();
      setCandidates(candidatesData);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = candidates.filter((c) => {
    const matchesElection = selectedElection === "all" || c.electionId === selectedElection;
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    return matchesElection && matchesSearch;
  });

  const handleSave = async () => {
    try {
      if (editing) {
        await candidateAPI.update(editing._id, form);
        toast.success("Profile updated");
      } else {
        await candidateAPI.create(form);
        toast.success("Candidate recruited");
      }
      setDialogOpen(false);
      setEditing(null);
      setForm({ name: "", department: "", year: "", electionId: "" });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Permenantly remove this candidate?")) return;
    try {
      await candidateAPI.delete(id);
      setCandidates((p) => p.filter((x) => x._id !== id));
      toast.success("Candidate removed");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, department: c.department, year: c.year, electionId: c.electionId });
    setDialogOpen(true);
  }

  const getElectionName = (id) => elections.find((e) => e._id === id)?.name || "Unassigned";

  return (
    <div className="min-h-screen relative pb-20 overflow-hidden">

      {/* Massive Cinematic Background Type */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none flex items-center justify-center opacity-[0.03] z-0 overflow-hidden select-none">
        <h1 className="text-[20vw] font-black text-slate-900 leading-none whitespace-nowrap tracking-tighter">
          ROSTER
        </h1>
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto space-y-10 p-4">

        {/* Header & Controls */}
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-end">
            <div className="relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                className="h-1 bg-blue-600 mb-4"
              />
              <h1 className="text-6xl md:text-7xl font-display font-black text-slate-900 tracking-tighter">
                CANDIDATES
              </h1>
              <div className="flex items-center gap-3 mt-2 text-slate-500 font-medium tracking-wide uppercase text-sm">
                <span>{candidates.length} Profiles Loaded</span>
                <span className="w-1 h-1 bg-slate-400 rounded-full" />
                <span>SECURE CONNECTION</span>
              </div>
            </div>

            {/* Add Button */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <button
                  onClick={() => { setEditing(null); setForm({ name: "", department: "", year: "", electionId: "" }); }}
                  className="group relative px-8 py-4 bg-slate-900 text-white font-bold tracking-wider uppercase rounded-none hover:bg-slate-800 transition-all clip-path-polygon"
                  style={{ clipPath: "polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)" }}
                >
                  <span className="flex items-center gap-2 relative z-10 group-hover:translate-x-1 transition-transform">
                    <Plus className="w-5 h-5 text-blue-400" />
                    Initialize Candidate
                  </span>
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
              </DialogTrigger>
              <DialogContent className="bg-white/95 backdrop-blur-3xl border-none shadow-2xl sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-display font-bold">
                    {editing ? "MODIFY RECORD" : "NEW ENTRY"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 mt-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-400 uppercase">Assignment</Label>
                    <Select value={form.electionId} onValueChange={(v) => setForm((p) => ({ ...p, electionId: v }))}>
                      <SelectTrigger className="h-12 bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Select Election" />
                      </SelectTrigger>
                      <SelectContent>
                        {elections.map((e) => (
                          <SelectItem key={e._id} value={e._id}>{e.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-400 uppercase">Identity</Label>
                    <Input
                      className="h-12 bg-slate-50 border-slate-200 font-medium text-lg"
                      placeholder="Full Name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-400 uppercase">Dept</Label>
                      <Input
                        className="h-12 bg-slate-50 border-slate-200"
                        placeholder="e.g. CS"
                        value={form.department}
                        onChange={(e) => setForm({ ...form, department: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-400 uppercase">Level</Label>
                      <Input
                        className="h-12 bg-slate-50 border-slate-200"
                        placeholder="Year"
                        value={form.year}
                        onChange={(e) => setForm({ ...form, year: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleSave} className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/20">
                    {editing ? "SAVE CHANGES" : "CONFIRM ENTRY"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Glass Island Search */}
          <div className="sticky top-4 z-40 bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl shadow-slate-200/50 rounded-2xl p-2 flex items-center gap-4 transition-all max-w-4xl">
            <div className="pl-4">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <input
              className="flex-1 bg-transparent border-none outline-none h-10 text-slate-700 font-medium placeholder:text-slate-400"
              placeholder="Search roster protocol..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="h-8 w-px bg-slate-200" />
            <Select value={selectedElection} onValueChange={setSelectedElection}>
              <SelectTrigger className="w-[240px] border-none shadow-none bg-transparent hover:bg-slate-50 rounded-xl focus:ring-0">
                <SelectValue placeholder="All Protocols" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ALL PROTOCOLS</SelectItem>
                {elections.map((e) => (
                  <SelectItem key={e._id} value={e._id}>{e.name.toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cinematic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
          <AnimatePresence>
            {loading ? (
              <div>Loading...</div>
            ) : filtered.map((c) => (
              <SpotlightCard key={c._id} className="h-[420px] p-6 flex flex-col items-center text-center justify-between" onClick={() => openEdit(c)}>
                {/* Top Badge */}
                <div className="w-full flex justify-between items-start opacity-50 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 border border-slate-200 px-2 py-1 rounded-sm">
                    <Layers className="w-3 h-3" />
                    ID: {c._id.slice(-4)}
                  </div>
                  <button
                    onClick={(e) => handleDelete(c._id, e)}
                    className="p-2 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Main Identity */}
                <div className="relative group-hover:scale-105 transition-transform duration-500">
                  <div className="w-32 h-32 rounded-full bg-slate-100 mx-auto mb-6 relative overflow-hidden ring-4 ring-white shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-300 to-slate-100 flex items-center justify-center">
                      <span className="text-4xl font-black text-slate-400">{c.name.charAt(0)}</span>
                    </div>
                  </div>
                  <h3 className="text-3xl font-display font-bold text-slate-900 leading-tight mb-2">
                    {c.name}
                  </h3>
                  <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">
                    {c.department} &bull; YEAR {c.year}
                  </p>
                </div>

                {/* Footer */}
                <div className="w-full border-t border-slate-100 pt-6 mt-6">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <span>Assigned Protocol</span>
                    <span className="text-slate-800">{getElectionName(c.electionId)}</span>
                  </div>
                  <div className="w-full h-1 bg-slate-100 mt-4 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-500"
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default CandidateManagement;
