import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { REQUEST_RATE_DATA } from '@/constants/mockData';

export default function RequestRateChart() {
  return (
    <div className="hud-panel p-4 h-full flex flex-col">
      <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-[hsl(var(--text-secondary))] mb-3">
        Request Rate (req/min)
      </h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={REQUEST_RATE_DATA}>
            <defs>
              <linearGradient id="neonGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(157 100% 50%)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(157 100% 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              tick={{ fill: 'hsl(218 15% 38%)', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
              axisLine={{ stroke: 'hsl(220 20% 14%)' }}
              tickLine={false}
              interval={3}
            />
            <YAxis
              tick={{ fill: 'hsl(218 15% 38%)', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(222 30% 9%)',
                border: '1px solid hsl(220 20% 14%)',
                borderRadius: 6,
                fontSize: 11,
                fontFamily: 'IBM Plex Mono',
              }}
              itemStyle={{ color: 'hsl(157 100% 50%)' }}
              labelStyle={{ color: 'hsl(215 20% 62%)' }}
            />
            <Area
              type="monotone"
              dataKey="rate"
              stroke="hsl(157 100% 50%)"
              strokeWidth={1.5}
              fill="url(#neonGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
