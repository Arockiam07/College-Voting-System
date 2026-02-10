import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, TrendingUp, Users, Vote, Sparkles, Activity, Target, Award } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { electionAPI } from "@/services/api";

// -----------------------------------------------------------------------------
// Constants & Config
// -----------------------------------------------------------------------------
const COLORS = [
  "#6366f1", // Indigo-500
  "#14b8a6", // Teal-500
  "#f59e0b", // Amber-500
  "#ec4899", // Pink-500
  "#8b5cf6", // Violet-500
];

const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  },
  item: {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 20 }
    }
  }
};

// -----------------------------------------------------------------------------
// Sub-Components
// -----------------------------------------------------------------------------

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md border border-slate-200 p-3 rounded-xl shadow-xl">
        <p className="font-bold text-slate-800 text-sm mb-1">{label}</p>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          <span className="text-slate-600 font-medium">{payload[0].value} Votes</span>
        </div>
      </div>
    );
  }
  return null;
};

const WinnerHero = ({ winners, primaryWinner, isTie, maxVotes, totalVotes }) => (
  <motion.div
    key={primaryWinner._id || 'winner'}
    variants={ANIMATION_VARIANTS.item}
    className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${isTie ? 'from-slate-700 to-slate-900' : 'from-indigo-600 to-violet-700'} text-white shadow-2xl p-8 lg:p-12`}
  >
    {/* Ambient Background Elements */}
    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-400/20 blur-[80px] rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none" />
    <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay" />

    <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
      <div className="relative group">
        <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-110 group-hover:scale-125 transition-transform duration-700" />

        {isTie ? (
          <div className="relative w-40 h-40 lg:w-48 lg:h-48 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center shadow-inner gap-2">
            <div className="flex -space-x-4">
              <Users className="w-10 h-10 text-yellow-300 drop-shadow-[0_4px_12px_rgba(253,224,71,0.5)]" />
              <Users className="w-10 h-10 text-yellow-300 drop-shadow-[0_4px_12px_rgba(253,224,71,0.5)]" />
            </div>
            <span className="font-black text-2xl tracking-widest text-yellow-300">TIE</span>
          </div>
        ) : (
          <div className="relative w-40 h-40 lg:w-48 lg:h-48 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
            <Trophy className="w-20 h-20 text-yellow-300 drop-shadow-[0_4px_12px_rgba(253,224,71,0.5)]" />
          </div>
        )}

        <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg flex items-center gap-1 whitespace-nowrap ${isTie ? 'bg-yellow-400 text-yellow-900' : 'bg-white text-indigo-900'}`}>
          {isTie ? (
            <><Sparkles className="w-3 h-3 text-yellow-900" /> EQUAL ELECTION</>
          ) : (
            <><Sparkles className="w-3 h-3 text-yellow-500 fill-yellow-500" /> Winner</>
          )}
        </div>
      </div>

      <div className="flex-1 text-center md:text-left space-y-4">
        <div>
          <h2 className="text-sm font-medium text-indigo-100 uppercase tracking-widest mb-1">
            {isTie ? "Top Candidates (Equal Votes)" : "Leading Candidate"}
          </h2>
          <h3 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            {isTie ? winners.map(w => w.candidateName || w.name).join(' & ') : (primaryWinner.candidateName || primaryWinner.name)}
          </h3>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-indigo-100">
          {!isTie && (
            <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
              <Award className="w-4 h-4" /> {primaryWinner.department}
            </span>
          )}
          <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
            <Vote className="w-4 h-4" /> {maxVotes} Votes
          </span>
          <span className="flex items-center gap-2 bg-emerald-400/20 text-emerald-100 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-emerald-400/30">
            <TrendingUp className="w-4 h-4" /> {totalVotes > 0 ? Math.round((maxVotes / totalVotes) * 100) : 0}% Support
          </span>
        </div>
      </div>
    </div>
  </motion.div>
);

const ResultsCharts = ({ chartData, candidates }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Main Bar Chart */}
    <motion.div
      variants={ANIMATION_VARIANTS.item}
      className="lg:col-span-2 bg-white/60 backdrop-blur-xl border border-white/60 shadow-lg rounded-[2rem] p-8 flex flex-col"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-500" /> Vote Breakdown
          </h3>
          <p className="text-sm text-slate-500 mt-1">Comparative vote counts across all candidates.</p>
        </div>
      </div>

      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9', radius: 8 }} />
            <Bar dataKey="votes" radius={[8, 8, 0, 0]} animationDuration={1500}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  className="transition-all duration-300 hover:opacity-80"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>

    {/* Pie Chart */}
    <div className="space-y-6">
      <motion.div
        variants={ANIMATION_VARIANTS.item}
        className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-lg rounded-[2rem] p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Users className="w-32 h-32" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-6 relative z-10">Participation Share</h3>
        <div className="h-[200px] relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="votes"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value) => <span className="text-xs font-medium text-slate-600 ml-1">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center Metric */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-4">
            <span className="text-2xl font-bold text-slate-800">{candidates.length}</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Candidates</span>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
);

const Leaderboard = ({ candidates, totalVotes }) => (
  <motion.div
    variants={ANIMATION_VARIANTS.item}
    className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-lg rounded-[2rem] overflow-hidden"
  >
    <div className="p-6 border-b border-gray-100 bg-white/40">
      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
        <Medal className="w-5 h-5 text-amber-500" /> Full Classifications
      </h3>
    </div>
    <div className="divide-y divide-gray-100">
      {candidates.map((candidate, index) => (
        <div
          key={candidate.id || index}
          className="p-5 flex items-center gap-4 hover:bg-white/50 transition-colors group"
        >
          <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm transition-transform group-hover:scale-110
                ${index === 0 ? 'bg-yellow-400 text-yellow-900' :
              index === 1 ? 'bg-slate-300 text-slate-700' :
                index === 2 ? 'bg-amber-600 text-amber-100' : 'bg-slate-100 text-slate-500'}
            `}>
            {index + 1}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-800 text-base">{candidate.candidateName || candidate.name}</h4>
            <p className="text-sm text-slate-500">{candidate.department}</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:block w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-500"
                style={{ width: `${totalVotes > 0 ? (candidate.votes / totalVotes * 100) : 0}%` }}
              />
            </div>
            <div className="text-right min-w-[60px]">
              <span className="block font-bold text-slate-800">{candidate.votes}</span>
              <span className="text-xs text-slate-400 font-medium">Votes</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

// -----------------------------------------------------------------------------
// Main Page Component
// -----------------------------------------------------------------------------
const ResultsPage = ({ isAdmin = false }) => {
  const [closedElections, setClosedElections] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initial Data Fetch
  useEffect(() => {
    const fetchElections = async () => {
      try {
        const { data } = await electionAPI.getAll();
        const closed = data.filter(e => e.status === "closed" || e.status === "active");
        setClosedElections(closed);
        if (closed.length > 0) setSelectedId(closed[0]._id);
      } catch (error) {
        console.error("Failed to fetch elections", error);
      } finally {
        setLoading(false);
      }
    };
    fetchElections();
  }, [isAdmin]);

  // Determine Results when selection changes
  useEffect(() => {
    if (!selectedId) return;
    const fetchResults = async () => {
      try {
        const { data } = await electionAPI.getResults(selectedId);
        if (data?.results) {
          setCandidates(data.results.sort((a, b) => b.votes - a.votes));
        }
      } catch (error) {
        console.error("Failed to fetch results", error);
      }
    };
    fetchResults();
  }, [selectedId]);

  // ---------------------------------------------------------------------------
  // Calculations & Memoization
  // ---------------------------------------------------------------------------
  const totalVotes = useMemo(() =>
    candidates.reduce((sum, c) => sum + (c.votes || 0), 0),
    [candidates]);

  const { winners, primaryWinner, isTie, maxVotes } = useMemo(() => {
    const max = Math.max(...candidates.map(c => c.votes || 0));
    const allWinners = candidates.filter(c => (c.votes || 0) === max && max > 0);
    return {
      winners: allWinners,
      primaryWinner: allWinners[0],
      isTie: allWinners.length > 1,
      maxVotes: max
    };
  }, [candidates]);

  const chartData = useMemo(() =>
    candidates.map((c) => ({
      name: c.candidateName || c.name,
      votes: c.votes || 0,
      percentage: totalVotes > 0 ? Math.round((c.votes || 0) / totalVotes * 100) : 0
    })),
    [candidates, totalVotes]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );

  if (closedElections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="p-4 bg-slate-100 rounded-full">
          <Vote className="w-8 h-8 text-slate-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-700">No Results Available</h2>
          <p className="text-slate-500">Election results will appear here once finalized.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={ANIMATION_VARIANTS.container}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-10 max-w-[1600px] mx-auto"
    >
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-indigo-600 font-semibold mb-2"
          >
            <Activity className="w-4 h-4 animate-pulse" />
            <span className="text-xs uppercase tracking-wider">Live Outcomes</span>
          </motion.div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
            Election <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Results</span>
          </h1>
          <p className="text-slate-500 mt-2 text-lg max-w-2xl">
            Comprehensive breakdown of voting statistics and candidate performance.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-2 rounded-2xl border border-white/60 shadow-sm">
          <div className="px-4 py-2 border-r border-slate-200/60 hidden sm:block">
            <span className="text-xs text-slate-400 font-semibold uppercase block">Total Cast</span>
            <span className="text-xl font-bold text-slate-800 tabular-nums">{totalVotes.toLocaleString()}</span>
          </div>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="w-[240px] border-0 bg-white/80 focus:ring-0 shadow-sm rounded-xl h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {closedElections.map((e) => (
                <SelectItem key={e._id} value={e._id} className="cursor-pointer">{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {winners.length > 0 && (
          <WinnerHero
            winners={winners}
            primaryWinner={primaryWinner}
            isTie={isTie}
            maxVotes={maxVotes}
            totalVotes={totalVotes}
          />
        )}
      </AnimatePresence>

      <ResultsCharts chartData={chartData} candidates={candidates} />

      <Leaderboard candidates={candidates} totalVotes={totalVotes} />

    </motion.div>
  );
};

export default ResultsPage;
