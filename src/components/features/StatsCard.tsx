interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  subtitle?: string;
}

export default function StatsCard({ label, value, icon: Icon, color, bgColor, subtitle }: StatsCardProps) {
  return (
    <div className="hud-panel-active p-4 flex items-start gap-3.5 animate-fadeIn">
      <div className={`flex items-center justify-center size-10 rounded-md ${bgColor}`}>
        <Icon className={`size-5 ${color}`} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[11px] text-[hsl(var(--text-muted))] uppercase tracking-wider font-medium">
          {label}
        </span>
        <span className={`text-2xl font-display font-bold tabular-nums ${color}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {subtitle && (
          <span className="text-[10px] text-[hsl(var(--text-muted))] mt-0.5">{subtitle}</span>
        )}
      </div>
    </div>
  );
}
