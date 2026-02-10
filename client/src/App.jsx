import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import AuthPage from "@/pages/AuthPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ElectionManagement from "@/pages/admin/ElectionManagement";
import CandidateManagement from "@/pages/admin/CandidateManagement";
import ResultsPage from "@/pages/ResultsPage";
import StudentDashboard from "@/pages/student/StudentDashboard";
import VotingPage from "@/pages/student/VotingPage";
import ProfilePage from "@/pages/student/ProfilePage";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();
const App = () => <QueryClientProvider client={queryClient}><AuthProvider><TooltipProvider><Toaster /><Sonner /><BrowserRouter><Routes><Route path="/" element={<Navigate to="/auth" replace />} /><Route path="/auth" element={<AuthPage />} />{
  /* Admin Routes */
}<Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><DashboardLayout /></ProtectedRoute>}><Route index element={<AdminDashboard />} /><Route path="elections" element={<ElectionManagement />} /><Route path="candidates" element={<CandidateManagement />} /><Route path="results" element={<ResultsPage isAdmin />} /></Route>{
  /* Student Routes */
}<Route path="/student" element={<ProtectedRoute allowedRoles={["student"]}><DashboardLayout /></ProtectedRoute>}><Route index element={<StudentDashboard />} /><Route path="vote" element={<VotingPage />} /><Route path="results" element={<ResultsPage />} /><Route path="profile" element={<ProfilePage />} /></Route><Route path="*" element={<NotFound />} /></Routes></BrowserRouter></TooltipProvider></AuthProvider></QueryClientProvider>;
var App_default = App;
export {
  App_default as default
};
