import { useState } from 'react';
import { Download, Filter, Search, FileText, Bookmark } from 'lucide-react';
import VulnerabilityRow from '@/components/features/VulnerabilityRow';
import SeveritySummary from '@/components/features/SeveritySummary';
import { VULNERABILITIES } from '@/constants/mockData';
import { useAppStore } from '@/stores/appStore';
import { useToast } from '@/hooks/use-toast';
import type { Severity } from '@/types';

const SEVERITY_FILTERS: (Severity | 'all')[] = ['all', 'critical', 'high', 'medium', 'low', 'info'];

export default function Reports() {
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBookmarked, setShowBookmarked] = useState(false);
  const bookmarkedVulns = useAppStore((s) => s.bookmarkedVulns);
  const { toast } = useToast();

  const filtered = VULNERABILITIES.filter((v) => {
    if (severityFilter !== 'all' && v.severity !== severityFilter) return false;
    if (showBookmarked && !bookmarkedVulns.includes(v.id)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        v.title.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.endpoint.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExport = () => {
    toast({
      title: 'Report generated',
      description: `Exported ${filtered.length} findings to Markdown format.`,
    });
  };

  return (
    <div className="p-5 min-h-full">
      <div className="grid grid-cols-12 gap-5">
        {/* Main content */}
        <div className="col-span-9 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-[hsl(var(--text-primary))]">
                Vulnerability Findings
              </h2>
              <p className="text-[11px] text-[hsl(var(--text-muted))] mt-0.5">
                {filtered.length} of {VULNERABILITIES.length} findings displayed
              </p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-semibold bg-[hsl(157_100%_50%/0.1)] border border-[hsl(157_100%_50%/0.2)] text-neon hover:bg-[hsl(157_100%_50%/0.15)] transition-colors"
            >
              <Download className="size-3.5" />
              Export Report
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 flex-1 bg-surface rounded border border-dim px-3 py-1.5 focus-within:border-[hsl(157_100%_50%/0.3)] transition-colors">
              <Search className="size-3.5 text-[hsl(var(--text-muted))]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vulnerabilities..."
                className="flex-1 bg-transparent text-[11px] font-mono-hud text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-muted))] outline-none"
              />
            </div>

            {/* Severity filter */}
            <div className="flex items-center gap-1">
              <Filter className="size-3.5 text-[hsl(var(--text-muted))]" />
              {SEVERITY_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setSeverityFilter(f)}
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    severityFilter === f
                      ? 'bg-[hsl(157_100%_50%/0.1)] text-neon border border-[hsl(157_100%_50%/0.2)]'
                      : 'text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-secondary))] border border-transparent'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Bookmark toggle */}
            <button
              onClick={() => setShowBookmarked(!showBookmarked)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors border ${
                showBookmarked
                  ? 'border-[hsl(157_100%_50%/0.2)] bg-[hsl(157_100%_50%/0.08)] text-neon'
                  : 'border-dim text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-secondary))]'
              }`}
            >
              <Bookmark className="size-3" />
              Saved
            </button>
          </div>

          {/* Vulnerability list */}
          <div className="space-y-2">
            {filtered.map((vuln) => (
              <VulnerabilityRow key={vuln.id} vuln={vuln} />
            ))}
            {filtered.length === 0 && (
              <div className="hud-panel flex flex-col items-center justify-center py-16 text-center">
                <FileText className="size-8 text-[hsl(var(--text-muted))] mb-3" />
                <p className="text-sm text-[hsl(var(--text-secondary))]">No findings match your filters.</p>
                <p className="text-[11px] text-[hsl(var(--text-muted))] mt-1">Adjust your search or severity filter.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-3 space-y-4">
          <SeveritySummary />

          {/* Quick facts */}
          <div className="hud-panel p-4 space-y-3">
            <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-[hsl(var(--text-secondary))]">
              Scan Summary
            </h3>
            <div className="space-y-2">
              {[
                { label: 'Target', value: '*.target.com' },
                { label: 'Duration', value: '4h 23m' },
                { label: 'Endpoints Tested', value: '142' },
                { label: 'Agents Used', value: '5' },
                { label: 'Unique Categories', value: '12' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-[10px] text-[hsl(var(--text-muted))]">{item.label}</span>
                  <span className="text-[11px] font-mono-hud text-[hsl(var(--text-secondary))] font-medium">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top categories */}
          <div className="hud-panel p-4 space-y-3">
            <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-[hsl(var(--text-secondary))]">
              Top Categories
            </h3>
            <div className="space-y-1.5">
              {[
                { name: 'Broken Access Control', count: 5 },
                { name: 'Injection', count: 3 },
                { name: 'Information Disclosure', count: 3 },
                { name: 'Misconfiguration', count: 2 },
                { name: 'Authentication', count: 2 },
              ].map((cat) => (
                <div key={cat.name} className="flex items-center justify-between py-1">
                  <span className="text-[11px] text-[hsl(var(--text-secondary))] truncate">{cat.name}</span>
                  <span className="text-[11px] font-mono-hud text-neon font-medium tabular-nums ml-2 shrink-0">
                    {cat.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
