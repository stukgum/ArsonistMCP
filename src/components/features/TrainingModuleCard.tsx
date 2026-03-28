import { Lock, CheckCircle2, BookOpen, Clock } from 'lucide-react';
import type { TrainingModule } from '@/types';

interface TrainingModuleCardProps {
  module: TrainingModule;
  index: number;
  onStart: (id: string) => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'text-neon bg-[hsl(157_100%_50%/0.08)] border-[hsl(157_100%_50%/0.15)]',
  intermediate: 'text-cyan-hud bg-[hsl(195_100%_42%/0.08)] border-[hsl(195_100%_42%/0.15)]',
  advanced: 'text-medium bg-[hsl(38_100%_50%/0.08)] border-[hsl(38_100%_50%/0.15)]',
  expert: 'text-critical bg-[hsl(348_100%_60%/0.08)] border-[hsl(348_100%_60%/0.15)]',
};

export default function TrainingModuleCard({ module, index, onStart }: TrainingModuleCardProps) {
  const progress = module.lessons > 0 ? (module.completedLessons / module.lessons) * 100 : 0;
  const isComplete = progress === 100;

  return (
    <div
      className={`hud-panel overflow-hidden animate-fadeIn ${module.locked ? 'opacity-60' : ''}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${DIFFICULTY_COLORS[module.difficulty]}`}>
                {module.difficulty}
              </span>
              <span className="text-[10px] text-[hsl(var(--text-muted))]">{module.category}</span>
            </div>
            <h3 className="font-display font-semibold text-sm text-[hsl(var(--text-primary))]">
              {module.title}
            </h3>
          </div>
          {module.locked && <Lock className="size-4 text-[hsl(var(--text-muted))] shrink-0 mt-1" />}
          {isComplete && <CheckCircle2 className="size-4 text-neon shrink-0 mt-1" />}
        </div>

        <p className="text-[11px] text-[hsl(var(--text-secondary))] leading-relaxed line-clamp-2">
          {module.description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 text-[10px] text-[hsl(var(--text-muted))]">
          <span className="flex items-center gap-1">
            <BookOpen className="size-3" />
            {module.lessons} lessons
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {module.duration}
          </span>
        </div>

        {/* Topics */}
        <div className="flex flex-wrap gap-1">
          {module.topics.slice(0, 3).map((topic) => (
            <span
              key={topic}
              className="px-1.5 py-0.5 rounded text-[9px] bg-[hsl(var(--surface-elevated))] text-[hsl(var(--text-muted))]"
            >
              {topic}
            </span>
          ))}
          {module.topics.length > 3 && (
            <span className="px-1.5 py-0.5 text-[9px] text-[hsl(var(--text-muted))]">
              +{module.topics.length - 3}
            </span>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-[hsl(var(--text-muted))]">
              {module.completedLessons}/{module.lessons} completed
            </span>
            <span className="tabular-nums text-[hsl(var(--text-secondary))]">{Math.round(progress)}%</span>
          </div>
          <div className="h-1 bg-[hsl(var(--surface-elevated))] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isComplete ? 'bg-neon' : progress > 0 ? 'bg-cyan' : 'bg-transparent'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Action */}
        <button
          onClick={() => onStart(module.id)}
          disabled={module.locked}
          className={`w-full py-2 rounded text-[11px] font-semibold transition-colors ${
            module.locked
              ? 'bg-[hsl(var(--surface-elevated))] text-[hsl(var(--text-muted))] cursor-not-allowed'
              : isComplete
              ? 'bg-[hsl(var(--surface-elevated))] text-cyan-hud hover:bg-[hsl(var(--surface-hover))]'
              : progress > 0
              ? 'bg-[hsl(195_100%_42%/0.1)] border border-[hsl(195_100%_42%/0.2)] text-cyan-hud hover:bg-[hsl(195_100%_42%/0.15)]'
              : 'bg-[hsl(157_100%_50%/0.1)] border border-[hsl(157_100%_50%/0.2)] text-neon hover:bg-[hsl(157_100%_50%/0.15)]'
          }`}
        >
          {module.locked ? 'Locked — Complete Prerequisites' : isComplete ? 'Review Module' : progress > 0 ? 'Continue Learning' : 'Start Module'}
        </button>
      </div>
    </div>
  );
}
