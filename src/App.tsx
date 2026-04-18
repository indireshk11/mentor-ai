import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/store/AuthProvider";
import { AppProvider } from "@/store/AppStore";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import Tasks from "./pages/Tasks.tsx";
import Planner from "./pages/Planner.tsx";
import CalendarPage from "./pages/CalendarPage.tsx";
import Goals from "./pages/Goals.tsx";
import Skills from "./pages/Skills.tsx";
import Analytics from "./pages/Analytics.tsx";
import MentorChat from "./pages/MentorChat.tsx";
import Auth from "./pages/Auth.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppProvider>
                    <AppLayout>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/tasks" element={<Tasks />} />
                        <Route path="/planner" element={<Planner />} />
                        <Route path="/calendar" element={<CalendarPage />} />
                        <Route path="/goals" element={<Goals />} />
                        <Route path="/skills" element={<Skills />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/mentor" element={<MentorChat />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </AppLayout>
                  </AppProvider>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
