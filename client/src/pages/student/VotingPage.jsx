import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { UserCircle, CheckCircle, AlertCircle, Vote, Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { electionAPI, candidateAPI, voteAPI } from "@/services/api";

// -----------------------------------------------------------------------------
// 3D Spotlight Tilt Card (Ported from CandidateManagement)
// -----------------------------------------------------------------------------
const SpotlightCard = ({ children, className = "", onClick, disabled }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 50 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 50 });

  function onMouseMove({ currentTarget, clientX, clientY }) {
    if (disabled) return;
    const { left, top } = currentTarget.getBoundingClientRect();
    x.set(clientX - left);
    y.set(clientY - top);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      className={`relative group rounded-[2.5rem] border border-slate-200 bg-white shadow-xl overflow-hidden ${disabled ? 'opacity-80 grayscale-[0.5]' : 'cursor-pointer'} ${className}`}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="relative h-full z-10">{children}</div>

      {/* Spotlight Effect */}
      {!disabled && (
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-[2.5rem] opacity-0 transition duration-300 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                650px circle at ${mouseX}px ${mouseY}px,
                rgba(99, 102, 241, 0.1),
                transparent 80%
              )
            `,
          }}
        />
      )}

      {/* Border Highlight */}
      {!disabled && (
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-[2.5rem] opacity-0 transition duration-300 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                400px circle at ${mouseX}px ${mouseY}px,
                rgba(129, 140, 248, 0.4),
                transparent 80%
              )
            `,
            maskImage: "linear-gradient(black, black) content-box, linear-gradient(black, black)",
            maskComposite: "exclude",
            padding: "1px",
          }}
        />
      )}
    </motion.div>
  );
};

// -----------------------------------------------------------------------------
// Voting Page Component
// -----------------------------------------------------------------------------
const VotingPage = () => {
  const [searchParams] = useSearchParams();
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [confirmCandidate, setConfirmCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  // Fetch elections on mount
  useEffect(() => {
    const fetchElections = async () => {
      try {
        const { data } = await electionAPI.getAll();
        const active = data.filter(e => e.status === "active");
        setElections(active);

        // Set default selected from params or first active
        const paramId = searchParams.get("election");
        if (paramId && active.find(e => e._id === paramId)) {
          setSelectedElection(paramId);
        } else if (active.length > 0) {
          setSelectedElection(active[0]._id);
        }
      } catch (error) {
        toast.error("Failed to load elections");
      } finally {
        setPageLoading(false);
      }
    };
    fetchElections();
  }, [searchParams]);

  // Fetch candidates and vote status when selectedElection changes
  useEffect(() => {
    if (!selectedElection) return;

    const fetchData = async () => {
      try {
        const { data: candidatesData } = await candidateAPI.getAll(selectedElection);
        setCandidates(candidatesData);

        const { data: statusData } = await voteAPI.checkStatus(selectedElection);
        setHasVoted(statusData.hasVoted);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [selectedElection]);

  const handleVote = async () => {
    if (!confirmCandidate) return;
    setLoading(true);
    try {
      await voteAPI.cast({
        electionId: selectedElection,
        candidateId: confirmCandidate
      });
      setHasVoted(true);
      setConfirmCandidate(null);
      toast.success("Your vote has been recorded!");

      // Brief delay to let the user see the success message
      setTimeout(() => {
        window.location.href = "/student/results";
      }, 1500);

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cast vote");
    } finally {
      setLoading(false);
    }
  };

  const selectedElectionData = elections.find((e) => e._id === selectedElection);

  // Filter candidates based on search
  const filteredCandidates = candidates.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.department.toLowerCase().includes(search.toLowerCase())
  );

  if (pageLoading) return <div className="min-h-screen flex items-center justify-center text-indigo-500 font-bold animate-pulse">Initializing Secure Voting Environment...</div>;

  return (
    <div className="min-h-screen relative pb-20 overflow-hidden">

      {/* Cinematic Background */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none flex items-center justify-center opacity-[0.03] z-0 overflow-hidden select-none">
        <h1 className="text-[25vw] font-black text-slate-900 leading-none whitespace-nowrap tracking-tighter">
          DECIDE
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
                className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mb-4"
              />
              <h1 className="text-6xl md:text-8xl font-display font-black text-slate-900 tracking-tighter leading-none">
                CAST VOTE
              </h1>
              <div className="flex items-center gap-3 mt-4 text-slate-500 font-bold tracking-wide uppercase text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span>SECURE BALLOT PROTOCOL</span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                <span className={hasVoted ? "text-emerald-600" : "text-indigo-600"}>
                  STATUS: {hasVoted ? "VOTE RECORDED" : "AWAITING SELECTION"}
                </span>
              </div>
            </div>
          </div>

          {/* Glass Island Election Selector & Search */}
          <div className="sticky top-4 z-40 bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl shadow-indigo-500/10 rounded-2xl p-2 flex flex-col md:flex-row items-center gap-4 transition-all max-w-4xl mx-auto w-full">

            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 flex-1 w-full md:w-auto border-b md:border-b-0 md:border-r border-slate-200/60 pb-2 md:pb-0">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500">
                <UserCircle className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Search candidate or dept..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-slate-700 font-medium placeholder:text-slate-400 w-full"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="pl-2 font-bold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap hidden sm:block">
                Ballot:
              </div>
              <Select value={selectedElection} onValueChange={setSelectedElection}>
                <SelectTrigger className="w-full md:w-[280px] border-none shadow-none bg-transparent hover:bg-slate-50 rounded-xl focus:ring-0 text-lg font-bold text-slate-800 h-10 md:h-12">
                  <SelectValue placeholder="Select active election" />
                </SelectTrigger>
                <SelectContent>
                  {elections.map((e) => (
                    <SelectItem key={e._id} value={e._id} className="font-medium focus:bg-indigo-50 focus:text-indigo-700">
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasVoted && (
              <div className="pr-4 flex items-center gap-2 text-emerald-600 font-bold text-sm uppercase whitespace-nowrap">
                <CheckCircle className="w-5 h-5" />
                <span className="hidden sm:inline">Voted</span>
              </div>
            )}
          </div>
        </div>

        {/* Candidate Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
          {filteredCandidates.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full h-96 flex flex-col items-center justify-center text-slate-400"
            >
              <AlertCircle className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-xl font-medium">No candidates found matching your criteria.</p>
            </motion.div>
          ) : (
            filteredCandidates.map((candidate, i) => (
              <SpotlightCard
                key={candidate._id}
                disabled={hasVoted}
                className="h-[450px] p-8 flex flex-col items-center text-center justify-between"
              >
                {/* Top Status */}
                <div className="w-full flex justify-between items-start opacity-50">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-200 px-2 py-1 rounded-sm">
                    ID: {candidate._id.slice(-4)}
                  </span>
                </div>

                {/* Avatar & Info */}
                <div className="relative w-full">
                  <div className="w-40 h-40 rounded-full mx-auto mb-8 relative group-hover:scale-105 transition-transform duration-500">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 opacity-10 animate-pulse"></div>
                    <div className="absolute inset-2 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden ring-4 ring-white shadow-2xl">
                      <span className="text-6xl font-black text-slate-300 group-hover:text-indigo-500 transition-colors">
                        {candidate.name.charAt(0)}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-3xl font-display font-bold text-slate-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
                    {candidate.name}
                  </h3>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                    {candidate.department} &bull; {candidate.year}
                  </p>
                </div>

                {/* Vote Action */}
                <div className="w-full pt-6">
                  <Button
                    disabled={hasVoted}
                    onClick={() => setConfirmCandidate(candidate._id)}
                    className={`w-full h-14 text-lg font-bold uppercase tracking-widest rounded-xl shadow-lg transition-all ${hasVoted ? 'bg-slate-100 text-slate-400 shadow-none' : 'bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-indigo-600/30'}`}
                  >
                    {hasVoted ? (
                      <span className="flex items-center gap-2"><Check className="w-5 h-5" /> Vote Cast</span>
                    ) : (
                      <span className="flex items-center gap-2"><Vote className="w-5 h-5" /> Select Candidate</span>
                    )}
                  </Button>
                </div>
              </SpotlightCard>
            ))
          )}

        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmCandidate} onOpenChange={(open) => !open && setConfirmCandidate(null)}>
        <DialogContent className="bg-white/95 backdrop-blur-3xl border-none shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 uppercase tracking-tight">Confirm Selection</DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="p-4 bg-indigo-50 rounded-2xl flex items-center gap-4 border border-indigo-100">
              <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center font-bold text-indigo-700 text-xl">
                {candidates.find((c) => c._id === confirmCandidate)?.name.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">You are voting for</p>
                <p className="text-lg font-bold text-indigo-900">
                  {candidates.find((c) => c._id === confirmCandidate)?.name}
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-500 font-medium text-center">
              Action is final. Your vote will be encrypted and recorded.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setConfirmCandidate(null)} className="font-bold text-slate-500">CANCEL</Button>
            <Button onClick={handleVote} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-12 px-6">
              {loading ? "ENCRYPTING..." : "CONFIRM VOTE"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
};

var VotingPage_default = VotingPage;
export {
  VotingPage_default as default
};
