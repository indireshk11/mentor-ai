import { Task } from "@/lib/types";
import { useApp } from "@/store/AppStore";
import { CategoryBadge, PriorityBadge } from "./Badges";
import { Check, Trash2, Calendar, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface Props {
  task: Task;
  compact?: boolean;
}

export function TaskCard({ task, compact }: Props) {
  const { toggleTask, deleteTask } = useApp();
  const navigate = useNavigate();
  const done = task.status === "Completed";
  const due = new Date(task.dueDate);
  const overdue = !done && due < new Date(new Date().toDateString());

  const askMentor = () => {
    const dueStr = due.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
    const prompt = `Help me tackle this task: "${task.title}"${task.description ? ` — ${task.description}` : ""}. Category: ${task.category}, priority: ${task.priority}, due ${dueStr}${task.skill ? `, skill: ${task.skill}` : ""}. Give me a focused plan and the best first step.`;
    navigate("/mentor", { state: { seedPrompt: prompt, taskTitle: task.title } });
  };

  return (
    <div
      className={cn(
        "group glass rounded-2xl p-4 flex items-start gap-3 transition-all hover:border-primary/50 hover:-translate-y-0.5",
        done && "opacity-60",
        overdue && "border-destructive/50"
      )}
    >
      <button
        onClick={() => toggleTask(task.id)}
        className={cn(
          "shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all",
          done
            ? "gradient-success border-transparent shadow-glow"
            : "border-muted-foreground/40 hover:border-primary hover:bg-primary/10"
        )}
        aria-label={done ? "Mark pending" : "Mark complete"}
      >
        {done && <Check className="w-4 h-4 text-success-foreground" strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className={cn("font-semibold text-foreground", done && "line-through text-muted-foreground")}>
            {task.title}
          </h3>
          <PriorityBadge priority={task.priority} />
          {task.skill && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/40">
              #{task.skill}
            </span>
          )}
        </div>
        {!compact && task.description && (
          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <CategoryBadge category={task.category} />
          <span className={cn("inline-flex items-center gap-1 text-xs", overdue ? "text-destructive font-semibold" : "text-muted-foreground")}>
            <Calendar className="w-3 h-3" />
            {due.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            {overdue && " · Overdue"}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <button
          onClick={askMentor}
          className="p-1.5 rounded-lg hover:bg-primary/15 text-primary"
          aria-label="Ask Mentor about this task"
          title="Ask Mentor"
        >
          <Sparkles className="w-4 h-4" />
        </button>
        <button
          onClick={() => deleteTask(task.id)}
          className="p-1.5 rounded-lg hover:bg-destructive/15 text-destructive"
          aria-label="Delete task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
