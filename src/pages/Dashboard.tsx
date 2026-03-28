import { ShieldAlert, Bug, Bot, Zap } from 'lucide-react';
import StatsCard from '@/components/features/StatsCard';
import InteractiveTerminal from '@/components/features/InteractiveTerminal';
import AgentLogStream from '@/components/features/AgentLogStream';
import TrafficMonitor from '@/components/features/TrafficMonitor';
import VulnChart from '@/components/features/VulnChart';
import RequestRateChart from '@/components/features/RequestRateChart';
import SeveritySummary from '@/components/features/SeveritySummary';
import { DASHBOARD_STATS } from '@/constants/mockData';

export default function Dashboard() {
  return (
    <div className="p-5 space-y-5 min-h-full">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <StatsCard
          label="Vulnerabilities"
          value={DASHBOARD_STATS.totalVulnerabilities}
          icon={Bug}
          color="text-critical"
          bgColor="bg-[hsl(348_100%_60%/0.1)]"
          subtitle={`${DASHBOARD_STATS.criticalCount} critical`}
        />
        <StatsCard
          label="Active Agents"
          value={DASHBOARD_STATS.activeAgents}
          icon={Bot}
          color="text-neon"
          bgColor="bg-[hsl(157_100%_50%/0.1)]"
          subtitle="3 running, 1 paused"
        />
        <StatsCard
          label="Requests Processed"
          value={DASHBOARD_STATS.requestsProcessed}
          icon={Zap}
          color="text-cyan-hud"
          bgColor="bg-[hsl(195_100%_42%/0.1)]"
          subtitle="289 req/min current"
        />
        <StatsCard
          label="Risk Score"
          value="87/100"
          icon={ShieldAlert}
          color="text-high"
          bgColor="bg-[hsl(20_100%_55%/0.1)]"
          subtitle="High exposure"
        />
      </div>

      {/* Interactive Terminal */}
      <InteractiveTerminal />

      {/* Main Grid: Agent Stream + Traffic */}
      <div className="grid grid-cols-12 gap-4" style={{ height: '380px' }}>
        <div className="col-span-5">
          <AgentLogStream />
        </div>
        <div className="col-span-7">
          <TrafficMonitor />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-12 gap-4" style={{ height: '280px' }}>
        <div className="col-span-3">
          <SeveritySummary />
        </div>
        <div className="col-span-5">
          <VulnChart />
        </div>
        <div className="col-span-4">
          <RequestRateChart />
        </div>
      </div>
    </div>
  );
}
