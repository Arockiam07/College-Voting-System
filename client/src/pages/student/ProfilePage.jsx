import { motion } from "framer-motion";
import { User, Mail, BookOpen, Hash, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/auth");
  };
  const profileFields = [
    { label: "Full Name", value: user?.name, icon: User },
    { label: "Email", value: user?.email, icon: Mail },
    { label: "Roll Number", value: user?.rollNumber || "N/A", icon: Hash },
    { label: "Department", value: user?.department || "N/A", icon: BookOpen }
  ];
  return <div className="space-y-6 max-w-2xl"><div><h1 className="page-header">My Profile</h1><p className="page-subtitle">Your account information</p></div><motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="stat-card"
  ><div className="flex items-center gap-4 mb-6 pb-6 border-b border-border"><div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"><User className="w-8 h-8 text-primary" /></div><div><h2 className="text-xl font-display font-bold">{user?.name}</h2><p className="text-sm text-muted-foreground capitalize">{user?.role}</p></div></div><div className="space-y-4">{profileFields.map((field) => <div key={field.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"><field.icon className="w-4 h-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">{field.label}</p><p className="font-medium text-sm">{field.value}</p></div></div>)}</div><Button variant="outline" className="w-full mt-6 text-destructive hover:text-destructive" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2" />Sign Out
        </Button></motion.div></div>;
};
var ProfilePage_default = ProfilePage;
export {
  ProfilePage_default as default
};
