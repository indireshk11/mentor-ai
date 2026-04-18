import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    const body = await req.json();
    const messages = body?.messages as ChatMessage[] | undefined;
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pull user context (RLS scopes to this user via their JWT)
    const [tasksRes, goalsRes, milestonesRes, profileRes] = await Promise.all([
      supabase.from("tasks").select("title,category,priority,status,due_date,skill,completed_at").order("due_date", { ascending: true }).limit(50),
      supabase.from("goals").select("id,title,description,duration_days,start_date,skill").limit(20),
      supabase.from("milestones").select("goal_id,title,week,completed"),
      supabase.from("profiles").select("display_name,streak_count").eq("user_id", userId).maybeSingle(),
    ]);

    const tasks = tasksRes.data ?? [];
    const goals = goalsRes.data ?? [];
    const milestones = milestonesRes.data ?? [];
    const profile = profileRes.data;

    const today = new Date();
    const fmt = (d: string | null | undefined) => (d ? new Date(d).toISOString().slice(0, 10) : "—");
    const taskLines = tasks.length
      ? tasks.map((t) => `- [${t.status}] ${t.title} (${t.category}, ${t.priority}, due ${fmt(t.due_date)}${t.skill ? `, skill: ${t.skill}` : ""})`).join("\n")
      : "(no tasks yet)";

    const goalLines = goals.length
      ? goals
          .map((g) => {
            const ms = milestones.filter((m) => m.goal_id === g.id).sort((a, b) => a.week - b.week);
            const done = ms.filter((m) => m.completed).length;
            const msList = ms.length
              ? "\n  Milestones: " + ms.map((m) => `${m.completed ? "✓" : "○"} W${m.week} ${m.title}`).join("; ")
              : "";
            return `- ${g.title} (${g.duration_days} days, started ${fmt(g.start_date)}${g.skill ? `, skill: ${g.skill}` : ""}) — ${done}/${ms.length} milestones${msList}`;
          })
          .join("\n")
      : "(no goals yet)";

    const systemPrompt = `You are MENTOR, a warm, motivating personal study and productivity coach for a student named ${profile?.display_name ?? "the user"}.
Today is ${today.toISOString().slice(0, 10)}. Their current streak is ${profile?.streak_count ?? 0} days.

You have full visibility into their tasks and goals. Use this context to give specific, personalized advice — reference task titles, due dates, and goals by name. Suggest concrete next actions, study techniques, and prioritization. Keep replies focused and energetic. Use short paragraphs and bullet lists. Use markdown.

USER'S TASKS:
${taskLines}

USER'S GOALS:
${goalLines}

Rules:
- Be specific to what's on their plate; do not give generic advice.
- If they ask "what should I do today" prioritize by due date + priority.
- If they have nothing scheduled, suggest something aligned with their existing goals/skills.
- Keep responses under ~250 words unless they ask for a deep plan.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        stream: true,
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Workspace settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(aiResp.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("mentor-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
