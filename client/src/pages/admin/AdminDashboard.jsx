import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Vote, CalendarCheck, Users, TrendingUp, Activity,
  BarChart2, PieChart as PieChartIcon, ArrowUpRight,
  Clock, ShieldCheck
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts";
import { dashboardAPI } from "@/services/api";

// Premium Palette consistent with ResultsPage
const COLORS = [
  "#6366f1", // Indigo
  "#ec4899", // Pink
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#8b5cf6", // Violet
];

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalVotes: 0,
    totalElections: 0,
    totalCandidates: 0,
    activeElections: 0
  });

  const [votesPerElection, setVotesPerElection] = useState([]);
  const [electionStatusData, setElectionStatusData] = useState([]);
  const [candidatesPerElection, setCandidatesPerElection] = useState([]);
  const [loading, setLoading] = useState(true);

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 20 }
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await dashboardAPI.getAdminStats();
        setStats(data);

        setVotesPerElection(data.votesPerElection || []);
        setElectionStatusData([
          { name: "Active", value: data.activeElections || 0, fill: "#10b981" },
          { name: "Upcoming", value: data.upcomingElections || 0, fill: "#f43f5e" },
          { name: "Closed", value: data.closedElections || 0, fill: "#64748b" }
        ]);
        setCandidatesPerElection(data.candidatesPerElection || []);
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: "Total Votes", value: stats.totalVotes, icon: Vote, color: "text-indigo-600", bg: "bg-indigo-100/50", trend: "+12%" },
    { label: "Active Elections", value: stats.activeElections, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-100/50", trend: "Live Now" },
    { label: "Total Candidates", value: stats.totalCandidates, icon: Users, color: "text-amber-600", bg: "bg-amber-100/50", trend: "Growing" },
    { label: "Total Elections", value: stats.totalElections, icon: CalendarCheck, color: "text-violet-600", bg: "bg-violet-100/50", trend: "All Time" }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md border border-slate-200 p-3 rounded-xl shadow-xl">
          <p className="font-bold text-slate-800 text-sm mb-1">{label}</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <span className="text-slate-600 font-medium">{payload[0].value}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Get current greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-10 max-w-[1600px] mx-auto"
    >
      {/* BACKGROUND AMBIENCE */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-200/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-sky-200/20 blur-[100px] rounded-full"></div>
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03]"></div>
      </div>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-indigo-600 font-semibold mb-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Admin Portal</span>
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Admin</span>
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Here's what's happening across your voting platform today.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md border border-white/60 rounded-full text-sm font-medium text-slate-600 shadow-sm">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            variants={itemVariants}
            whileHover={{ y: -5, transition: { type: "spring", stiffness: 300 } }}
            className="relative overflow-hidden bg-white/70 backdrop-blur-xl border border-white/60 p-6 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group"
          >
            {/* Card Glow */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 ${card.bg} blur-2xl rounded-full group-hover:scale-150 transition-transform duration-500`}></div>

            <div className="relative z-10 flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${card.bg} ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
              {card.trend && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-100/50 px-2 py-1 rounded-full border border-emerald-100">
                  {card.label === "Active Elections" ? <Activity className="w-3 h-3 animate-pulse" /> : <TrendingUp className="w-3 h-3" />}
                  {card.trend}
                </span>
              )}
            </div>

            <div className="relative z-10">
              <h3 className="text-4xl font-black text-slate-800 tracking-tight">{card.value.toLocaleString()}</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">{card.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* BENTO GRID ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Votes Trend - Wide Card */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-white/70 backdrop-blur-xl border border-white/60 p-8 rounded-[2rem] shadow-sm relative overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-500" /> Voting Activity
              </h3>
              <p className="text-sm text-slate-500">Votes cast per election</p>
            </div>
          </div>

          <div className="flex-1 w-full min-h-[300px]">
            {votesPerElection.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={votesPerElection} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
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
                  <Bar dataKey="votes" fill="url(#colorUv)" radius={[6, 6, 0, 0]}>
                    {votesPerElection.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <BarChart2 className="w-12 h-12 mb-2 opacity-50" />
                <p>No voting data to display recently</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Election Status - Square Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white/70 backdrop-blur-xl border border-white/60 p-8 rounded-[2rem] shadow-sm relative overflow-hidden flex flex-col"
        >
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-emerald-500" /> Election Status
            </h3>
            <p className="text-sm text-slate-500">Overview of current states</p>
          </div>

          <div className="flex-1 relative">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={electionStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {electionStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-xs font-semibold text-slate-600 ml-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Metric */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-8">
              <span className="text-3xl font-black text-slate-800">{stats.totalElections || 0}</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total</span>
            </div>
          </div>
        </motion.div>

        {/* Candidate Distribution - Wide/Bottom Card */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-3 bg-white/70 backdrop-blur-xl border border-white/60 p-8 rounded-[2rem] shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-pink-500" /> Candidate Density
              </h3>
            </div>
            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-3 py-1 rounded-full transition-colors">
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-[250px] w-full">
            {candidatesPerElection.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={candidatesPerElection} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCandidates" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="candidates"
                    stroke="#ec4899"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorCandidates)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                <p>No candidate data available</p>
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default AdminDashboard;
