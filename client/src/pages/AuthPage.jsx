import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Vote, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { authAPI } from "@/services/api";
import { toast } from "sonner";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/student", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    year: "",
    rollNumber: "", // Added rollNumber
    department: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let authData;
      if (isLogin) {
        const { data } = await authAPI.login({
          email: form.email,
          password: form.password
        });
        authData = data;
      } else {
        // Signup always registers as 'student' by default (backend handles this)
        const { data } = await authAPI.signup({
          name: form.name,
          email: form.email,
          password: form.password,
          department: form.department,
          year: form.year,
          rollNumber: form.rollNumber
        });
        authData = data;
      }

      // Login context update
      login(authData.token, authData);
      toast.success(`Welcome, ${authData.name}!`);

      // Redirect based on role
      if (authData.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/student");
      }

    } catch (error) {
      console.error("Auth error:", error);
      toast.error(error.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-info blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                <Vote className="w-6 h-6 text-accent-foreground" />
              </div>
              <span className="text-2xl font-display font-bold">CampusVote</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-display font-bold leading-tight mb-6">
              Your Voice,<br />Your Choice.
            </h1>
            <p className="text-lg opacity-80 max-w-md leading-relaxed">
              A secure and transparent platform for college elections. Cast your vote, shape the future of your campus.
            </p>
            <div className="mt-12 flex gap-8">
              <div>
                <div className="text-3xl font-display font-bold">1,200+</div>
                <div className="text-sm opacity-60 mt-1">Votes Cast</div>
              </div>
              <div>
                <div className="text-3xl font-display font-bold">8</div>
                <div className="text-sm opacity-60 mt-1">Elections</div>
              </div>
              <div>
                <div className="text-3xl font-display font-bold">24</div>
                <div className="text-sm opacity-60 mt-1">Candidates</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md glass-card p-8 lg:p-10 shadow-2xl border-white/40 rounded-3xl"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Vote className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold">CampusVote</span>
          </div>

          <h2 className="text-3xl font-display font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            {isLogin ? "Sign in to access the voting portal" : "Register to start voting"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    className="mt-1.5 glass-input"
                    required={!isLogin}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rollNumber">Roll Number</Label>
                    <Input
                      id="rollNumber"
                      name="rollNumber"
                      placeholder="e.g. 21CS001"
                      value={form.rollNumber}
                      onChange={handleChange}
                      className="mt-1.5 glass-input"
                      required={!isLogin}
                    />
                  </div>
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      name="year"
                      placeholder="e.g. 3rd Year"
                      value={form.year}
                      onChange={handleChange}
                      className="mt-1.5 glass-input"
                      required={!isLogin}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    name="department"
                    placeholder="Computer Science"
                    value={form.department}
                    onChange={handleChange}
                    className="mt-1.5 glass-input"
                    required={!isLogin}
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@college.edu"
                value={form.email}
                onChange={handleChange}
                className="mt-1.5 glass-input"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  className="glass-input pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 font-medium text-base mt-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300" disabled={loading}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
              }}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </motion.div>
      </div>
    </div >
  );
};
var AuthPage_default = AuthPage;
export {
  AuthPage_default as default
};
