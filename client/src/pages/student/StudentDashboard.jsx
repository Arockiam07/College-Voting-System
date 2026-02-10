import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheck, Users, Vote, Clock, CheckCircle,
  ArrowRight, Sparkles, AlertCircle, Trophy, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { electionAPI } from "@/services/api";

// -----------------------------------------------------------------------------
// 3D Tilt Card Component (Reused logic for consistency)
// -----------------------------------------------------------------------------
const TiltCard = ({ children, className = "", delay = 0, onClick }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXFromCenter = e.clientX - rect.left - width / 2;
    const mouseYFromCenter = e.clientY - rect.top - height / 2;
    x.set(mouseXFromCenter / width);
    y.set(mouseYFromCenter / height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: delay
      }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative group perspective-1000 cursor-pointer ${className}`}
    >
      {/* Dynamic Glass Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/20 backdrop-blur-xl border border-white/50 rounded-[2rem] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] transition-all duration-300 group-hover:shadow-[0_30px_60px_-12px_rgba(79,70,229,0.25)] group-hover:border-white/80 pointer-events-none"></div>

      {/* Glare Effect */}
      <div className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-transparent via-white/30 to-transparent pointer-events-none mix-blend-overlay" />

      <div className="relative z-10 h-full p-6 flex flex-col transform-gpu" style={{ transform: "translateZ(20px)" }}>
        {children}
      </div>
    </motion.div>
  );
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const { data } = await electionAPI.getAll();
        setElections(data);
      } catch (error) {
        console.error("Failed to fetch elections:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchElections();
  }, []);

  const grouped = {
    active: elections.filter((e) => e.status === "active"),
    upcoming: elections.filter((e) => e.status === "upcoming"),
    closed: elections.filter((e) => e.status === "closed")
  };

  const hasActiveElections = grouped.active.length > 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-indigo-500 animate-pulse">Loading Experience...</div>;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12 pb-20 max-w-[1600px] mx-auto px-4"
    >
      {/* DEEP AMBIENT BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-emerald-300/20 blur-[150px] rounded-full mix-blend-multiply opacity-60"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-300/20 blur-[150px] rounded-full mix-blend-multiply opacity-60"></div>
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      {/* GOD RAY HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative overflow-hidden rounded-[3rem] bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-10 lg:p-14 shadow-2xl"
      >
        {/* God Ray Animation */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,255,255,0.1)_60deg,transparent_120deg)] opacity-30 pointer-events-none mix-blend-overlay"
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/20 backdrop-blur-md text-sm font-bold tracking-widest uppercase shadow-lg"
            >
              <Vote className="w-4 h-4" /> Student Portal
            </motion.div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-none drop-shadow-xl">
              {getGreeting()}, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-emerald-200">
                {user?.name?.split(" ")[0]}
              </span>
            </h1>
            <p className="text-emerald-100 text-lg max-w-xl leading-relaxed">
              Your voice matters. Participate in active elections and shape the future of your community.
            </p>
          </div>

          {/* Quick Stats Widget */}
          <div className="flex gap-4">
            <div className="text-center bg-white/10 backdrop-blur-lg border border-white/20 p-4 rounded-2xl min-w-[100px]">
              <div className="text-3xl font-black">{grouped.active.length}</div>
              <div className="text-xs uppercase tracking-wider font-bold text-emerald-200">Active</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-lg border border-white/20 p-4 rounded-2xl min-w-[100px]">
              <div className="text-3xl font-black">{grouped.upcoming.length}</div>
              <div className="text-xs uppercase tracking-wider font-bold text-cyan-200">Upcoming</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ACTIVE ELECTIONS SECTION */}
      {grouped.active.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600 shadow-sm"><Activity className="w-5 h-5 animate-pulse" /></div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Active Elections</h2>
            <span className="ml-auto text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Live Now
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {grouped.active.map((election, i) => (
              <TiltCard key={election._id} delay={i * 0.1} onClick={() => navigate(`/student/vote?election=${election._id}`)}>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-emerald-500 text-white text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full shadow-lg shadow-emerald-500/40 animate-pulse">
                    Live
                  </span>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl font-black text-slate-800 leading-tight mb-2 group-hover:text-emerald-600 transition-colors">{election.name}</h3>
                  <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed mb-6">{election.description}</p>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    Ends {new Date(election.endDate).toLocaleDateString()}
                  </div>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
                  >
                    Vote Now
                  </Button>
                </div>
              </TiltCard>
            ))}
          </div>
        </section>
      )}

      {/* UPCOMING ELECTIONS SECTION */}
      {grouped.upcoming.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 shadow-sm"><Clock className="w-5 h-5" /></div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Upcoming</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {grouped.upcoming.map((election, i) => (
              <TiltCard key={election._id} delay={i * 0.1}>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-indigo-100 text-indigo-600 text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full border border-indigo-200">
                    Soon
                  </span>
                </div>

                <div className="flex-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <h3 className="text-xl font-bold text-slate-700 leading-tight mb-2">{election.name}</h3>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-4">{election.description}</p>
                </div>

                <div className="mt-auto">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-500 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                    <CalendarCheck className="w-4 h-4" />
                    Starts {new Date(election.startDate).toLocaleDateString()}
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </section>
      )}

      {/* COMPLETED ELECTIONS SECTION */}
      {grouped.closed.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600 shadow-sm"><Trophy className="w-5 h-5" /></div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Past Results</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-90 hover:opacity-100 transition-opacity">
            {grouped.closed.map((election, i) => (
              <TiltCard key={election._id} delay={i * 0.1} onClick={() => election.resultsPublished && navigate("/student/results")}>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-slate-100 text-slate-500 text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full border border-slate-200">
                    Closed
                  </span>
                  {election.resultsPublished && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                </div>

                <div className="flex-1 grayscale group-hover:grayscale-0 transition-all duration-500">
                  <h3 className="text-xl font-bold text-slate-700 leading-tight mb-2">{election.name}</h3>
                  <p className="text-slate-400 text-sm line-clamp-2">Results have been finalized.</p>
                </div>

                <div className="mt-auto pt-4">
                  {election.resultsPublished ? (
                    <Button variant="outline" className="w-full rounded-xl border-slate-200 hover:bg-slate-50 hover:text-slate-900">
                      View Results
                    </Button>
                  ) : (
                    <div className="w-full text-center text-xs text-slate-400 italic py-2">
                      Results pending
                    </div>
                  )}
                </div>
              </TiltCard>
            ))}
          </div>
        </section>
      )}

      {elections.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-slate-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">No Elections Found</h2>
          <p className="text-slate-500 mt-2">Check back later for new voting opportunities.</p>
        </div>
      )}
    </motion.div>
  );
};

export default StudentDashboard;
