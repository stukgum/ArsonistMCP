import { useState } from 'react';
import { GraduationCap, Trophy, Target, BookOpen } from 'lucide-react';
import TrainingModuleCard from '@/components/features/TrainingModuleCard';
import { TRAINING_MODULES } from '@/constants/mockData';
import { useToast } from '@/hooks/use-toast';
import heroImg from '@/assets/training-hero.jpg';

const CATEGORIES = ['All', 'Fundamentals', 'Core Tools', 'Advanced', 'MCP & AI', 'Expert'] as const;

export default function Training() {
  const [category, setCategory] = useState('All');
  const { toast } = useToast();

  const filtered = category === 'All'
    ? TRAINING_MODULES
    : TRAINING_MODULES.filter((m) => m.category === category);

  const totalLessons = TRAINING_MODULES.reduce((a, m) => a + m.lessons, 0);
  const completedLessons = TRAINING_MODULES.reduce((a, m) => a + m.completedLessons, 0);
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const handleStart = (id: string) => {
    const mod = TRAINING_MODULES.find((m) => m.id === id);
    if (mod) {
      toast({
        title: `Loading: ${mod.title}`,
        description: 'Training session initializing with your selected AI model...',
      });
    }
  };

  return (
    <div className="min-h-full">
      {/* Hero */}
      <div className="relative h-48 overflow-hidden">
        <img src={heroImg} alt="" className="w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--void))] via-[hsl(var(--void)/0.6)] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h2 className="font-display text-xl font-bold text-[hsl(var(--text-primary))]">
            Training Academy
          </h2>
          <p className="text-[12px] text-[hsl(var(--text-secondary))] mt-1 max-w-lg">
            Master Burp Suite from fundamentals to advanced agent orchestration. AI-guided lessons with live examples via MCP.
          </p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="hud-panel p-3 flex items-center gap-3">
            <div className="flex items-center justify-center size-9 rounded-md bg-[hsl(157_100%_50%/0.1)]">
              <Target className="size-4 text-neon" />
            </div>
            <div>
              <span className="text-[10px] text-[hsl(var(--text-muted))] uppercase tracking-wider block">
                Progress
              </span>
              <span className="text-lg font-display font-bold text-neon tabular-nums">{overallProgress}%</span>
            </div>
          </div>
          <div className="hud-panel p-3 flex items-center gap-3">
            <div className="flex items-center justify-center size-9 rounded-md bg-[hsl(195_100%_42%/0.1)]">
              <BookOpen className="size-4 text-cyan-hud" />
            </div>
            <div>
              <span className="text-[10px] text-[hsl(var(--text-muted))] uppercase tracking-wider block">
                Lessons
              </span>
              <span className="text-lg font-display font-bold text-[hsl(var(--text-primary))] tabular-nums">
                {completedLessons}/{totalLessons}
              </span>
            </div>
          </div>
          <div className="hud-panel p-3 flex items-center gap-3">
            <div className="flex items-center justify-center size-9 rounded-md bg-[hsl(38_100%_50%/0.1)]">
              <GraduationCap className="size-4 text-medium" />
            </div>
            <div>
              <span className="text-[10px] text-[hsl(var(--text-muted))] uppercase tracking-wider block">
                Modules
              </span>
              <span className="text-lg font-display font-bold text-[hsl(var(--text-primary))] tabular-nums">
                {TRAINING_MODULES.length}
              </span>
            </div>
          </div>
          <div className="hud-panel p-3 flex items-center gap-3">
            <div className="flex items-center justify-center size-9 rounded-md bg-[hsl(348_100%_60%/0.1)]">
              <Trophy className="size-4 text-critical" />
            </div>
            <div>
              <span className="text-[10px] text-[hsl(var(--text-muted))] uppercase tracking-wider block">
                Rank
              </span>
              <span className="text-lg font-display font-bold text-[hsl(var(--text-primary))]">
                Novice
              </span>
            </div>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded text-[11px] font-medium transition-colors ${
                category === c
                  ? 'bg-[hsl(157_100%_50%/0.1)] text-neon border border-[hsl(157_100%_50%/0.2)]'
                  : 'text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-secondary))] border border-transparent'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Module grid */}
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((module, i) => (
            <TrainingModuleCard
              key={module.id}
              module={module}
              index={i}
              onStart={handleStart}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
