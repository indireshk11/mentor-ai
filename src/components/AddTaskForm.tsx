import { useState } from "react";
import { useApp } from "@/store/AppStore";
import { Category, Priority } from "@/lib/types";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories: Category[] = [
  "Academics",
  "Homework",
  "Assessments",
  "Projects",
  "Skill Learning",
  "Personal Goals",
];
const priorities: Priority[] = ["High", "Medium", "Low"];

export function AddTaskForm({ defaultCategory }: { defaultCategory?: Category }) {
  const { addTask } = useApp();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>(defaultCategory ?? "Homework");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [skill, setSkill] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      category,
      priority,
      dueDate: new Date(dueDate).toISOString(),
      skill: category === "Skill Learning" ? skill.trim() || "General" : skill.trim() || undefined,
    });
    setTitle("");
    setSkill("");
    setOpen(false);
  };

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="gradient-hero text-primary-foreground font-bold shadow-orange hover:shadow-glow hover:scale-[1.02] transition-all"
      >
        <Plus className="w-5 h-5 mr-1" /> Add Task
      </Button>
    );
  }

  return (
    <form onSubmit={submit} className="glass rounded-2xl p-5 space-y-3 animate-pop-in">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl text-gradient-electric">NEW MISSION</h3>
        <button type="button" onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-muted">
          <X className="w-4 h-4" />
        </button>
      </div>
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What will you conquer?"
        className="w-full bg-background/60 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="bg-background/60 border border-border rounded-xl px-3 py-2.5"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="bg-background/60 border border-border rounded-xl px-3 py-2.5"
        >
          {priorities.map((p) => (
            <option key={p} value={p}>{p} priority</option>
          ))}
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="bg-background/60 border border-border rounded-xl px-3 py-2.5"
        />
        <input
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          placeholder="Skill tag (e.g. Python)"
          className="bg-background/60 border border-border rounded-xl px-3 py-2.5"
        />
      </div>
      <Button type="submit" className="w-full gradient-hero text-primary-foreground font-bold">
        Launch Mission 🚀
      </Button>
    </form>
  );
}
