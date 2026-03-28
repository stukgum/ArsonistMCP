import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { VULNERABILITY_CHART_DATA } from '@/constants/mockData';

export default function VulnChart() {
  return (
    <div className="hud-panel p-4 h-full flex flex-col">
      <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-[hsl(var(--text-secondary))] mb-3">
        Vulnerability Trend
      </h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={VULNERABILITY_CHART_DATA} barGap={2}>
            <XAxis
              dataKey="name"
              tick={{ fill: 'hsl(218 15% 38%)', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
              axisLine={{ stroke: 'hsl(220 20% 14%)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'hsl(218 15% 38%)', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
              axisLine={false}
              tickLine={false}
              width={24}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(222 30% 9%)',
                border: '1px solid hsl(220 20% 14%)',
                borderRadius: 6,
                fontSize: 11,
                fontFamily: 'IBM Plex Mono',
              }}
              itemStyle={{ color: 'hsl(210 40% 90%)' }}
              labelStyle={{ color: 'hsl(215 20% 62%)', marginBottom: 4 }}
            />
            <Bar dataKey="critical" fill="hsl(348 100% 60%)" radius={[2, 2, 0, 0]} />
            <Bar dataKey="high" fill="hsl(20 100% 55%)" radius={[2, 2, 0, 0]} />
            <Bar dataKey="medium" fill="hsl(38 100% 50%)" radius={[2, 2, 0, 0]} />
            <Bar dataKey="low" fill="hsl(195 100% 42%)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
