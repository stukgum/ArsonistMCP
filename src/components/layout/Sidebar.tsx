import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import {
  LayoutDashboard,
  Bot,
  GraduationCap,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Flame,
  Wifi,
  WifiOff,
  Shield,
} from 'lucide-react';
import logoIcon from '@/assets/logo-icon.png';

const NAV = [
  { path: '/', label: 'Command Center', Icon: LayoutDashboard },
  { path: '/agents', label: 'Agents', Icon: Bot },
  { path: '/training', label: 'Training', Icon: GraduationCap },
  { path: '/reports', label: 'Reports', Icon: FileText },
  { path: '/settings', label: 'Configuration', Icon: Settings },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggle = useAppStore((s) => s.toggleSidebar);
  const mcpStatus = useAppStore((s) => s.mcpStatus);
  const burpConnected = useAppStore((s) => s.burpConnected);

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-sidebar flex flex-col bg-abyss border-r border-dim transition-all duration-300 ${
        collapsed ? 'w-[68px]' : 'w-[240px]'
      }`}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-dim">
        <img src={logoIcon} alt="Arsonist" className="size-8 rounded" />
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="font-display font-bold text-sm text-neon truncate flex items-center gap-1.5">
              <Flame className="size-3.5 shrink-0" />
              ARSONIST
            </span>
            <span className="text-[10px] text-[hsl(var(--text-muted))] uppercase tracking-wider">
              MCP AI v1.0
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV.map(({ path, label, Icon }) => {
          const active = path === '/' ? pathname === '/' : pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors duration-150 ${
                active
                  ? 'bg-[hsl(157_100%_50%/0.08)] text-neon border border-[hsl(157_100%_50%/0.15)]'
                  : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-hover))] border border-transparent'
              }`}
              title={collapsed ? label : undefined}
            >
              <Icon className={`size-[18px] shrink-0 ${active ? 'text-neon' : ''}`} />
              {!collapsed && (
                <span className="text-[13px] font-medium truncate">{label}</span>
              )}
              {active && !collapsed && (
                <div className="ml-auto size-1.5 rounded-full bg-neon animate-pulse-neon" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Status */}
      {!collapsed && (
        <div className="px-3 pb-3 space-y-2">
          <div className="hud-panel p-3 space-y-2.5">
            <StatusRow
              icon={mcpStatus === 'connected' ? Wifi : WifiOff}
              label="MCP Server"
              status={mcpStatus === 'connected' ? 'online' : 'offline'}
              color={mcpStatus === 'connected' ? 'text-neon' : 'text-critical'}
            />
            <StatusRow
              icon={Shield}
              label="Burp Suite"
              status={burpConnected ? 'linked' : 'unlinked'}
              color={burpConnected ? 'text-neon' : 'text-critical'}
            />
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={toggle}
        className="flex items-center justify-center h-10 border-t border-dim text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-hover))] transition-colors"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
      </button>
    </aside>
  );
}

function StatusRow({
  icon: Icon,
  label,
  status,
  color,
}: {
  icon: React.ElementType;
  label: string;
  status: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className={`size-3.5 ${color}`} />
        <span className="text-[11px] text-[hsl(var(--text-secondary))]">{label}</span>
      </div>
      <span className={`text-[10px] font-medium uppercase ${color}`}>{status}</span>
    </div>
  );
}
