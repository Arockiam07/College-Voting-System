import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import AppSidebar from "@/components/AppSidebar";
const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return <div className="min-h-screen bg-transparent">{mobileOpen && <div
    className="fixed inset-0 bg-foreground/20 z-30 lg:hidden"
    onClick={() => setMobileOpen(false)}
  />}<div className="hidden lg:block"><AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} /></div>{mobileOpen && <div className="lg:hidden"><AppSidebar collapsed={false} onToggle={() => setMobileOpen(false)} /></div>}<div
    className="transition-all duration-300 ease-in-out"
    style={{ marginLeft: isDesktop ? collapsed ? 112 : 312 : 0 }}
  ><header className="lg:hidden flex items-center h-14 px-4 border-b border-border bg-card sticky top-0 z-20"><button onClick={() => setMobileOpen(true)} className="text-muted-foreground hover:text-foreground"><Menu className="w-6 h-6" /></button></header><main className="p-4 lg:p-8 max-w-7xl"><Outlet /></main></div></div>;
};
var DashboardLayout_default = DashboardLayout;
export {
  DashboardLayout_default as default
};
