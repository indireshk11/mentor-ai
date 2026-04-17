import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/store/AuthProvider";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Auth() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (session) return <Navigate to="/" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Welcome aboard, hero! 🦸");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Powering up! ⚡");
        navigate("/");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-hero shadow-glow animate-pulse-glow mb-4">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-5xl text-gradient-hero">MENTOR</h1>
          <p className="text-muted-foreground mt-2">Your AI hero coach awaits</p>
        </div>

        <div className="glass rounded-3xl p-6 md:p-8">
          <div className="flex gap-2 mb-6 p-1 rounded-xl bg-muted">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                mode === "signin" ? "gradient-electric text-primary-foreground shadow-glow" : "text-muted-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                mode === "signup" ? "gradient-hero text-primary-foreground shadow-orange" : "text-muted-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground">Hero Name</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="What should we call you?"
                  className="mt-1 w-full bg-background/60 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                />
              </div>
            )}
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hero@example.com"
                className="mt-1 w-full bg-background/60 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full bg-background/60 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
              />
            </div>
            <Button
              type="submit"
              disabled={busy}
              className="w-full gradient-hero text-primary-foreground font-bold text-base py-6 shadow-orange hover:shadow-glow"
            >
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === "signup" ? "Begin the Journey 🚀" : "Power Up ⚡"}
            </Button>
          </form>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">
          Your progress syncs across all your devices.
        </p>
      </div>
    </div>
  );
}
