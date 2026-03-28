// In-memory database for demo purposes
// In production, replace with real Supabase or PostgreSQL

interface AgentRecord {
  id: string;
  name: string;
  type: string;
  description: string;
  target: string;
  status: string;
  progress: number;
  findings: number;
  requests_sent: number;
  started_at: string;
  last_action: string;
  prompt_template: string;
  safety_mode: string;
  created_at: string;
  updated_at: string;
}

interface VulnerabilityRecord {
  id: string;
  title: string;
  severity: string;
  category: string;
  target: string;
  description: string;
  evidence: string;
  remediation: string;
  found_at: string;
  agent_name: string;
  confirmed: boolean;
  cvss: number;
}

interface MCPSessionRecord {
  id: string;
  client_info?: string;
  capabilities?: string;
  status?: string;
  tool_calls?: unknown[];
  created_at: string;
}

interface ScanRecord {
  id: string;
  target: string;
  type: string;
  status: string;
  results: unknown;
  started_at: string;
  completed_at?: string;
}

interface UserRecord {
  id: string;
  email: string;
  password: string;
  created_at: string;
}

interface TrafficEntry {
  id: string;
  timestamp: string;
  [key: string]: any;
}

type DatabaseRecord = AgentRecord | VulnerabilityRecord | MCPSessionRecord | ScanRecord | UserRecord | TrafficEntry;

class InMemoryDatabase {
  private tables: Map<string, any[]> = new Map();

  constructor() {
    this.initializeDemoData();
  }

  private initializeDemoData() {
    this.tables.set('agents', [
      {
        id: 'agent-1',
        name: 'Passive Recon Alpha',
        type: 'recon',
        description: 'Passive reconnaissance agent',
        target: '*.target.com',
        status: 'running',
        progress: 67,
        findings: 12,
        requests_sent: 245,
        started_at: new Date().toISOString(),
        last_action: 'Scanning subdomains',
        prompt_template: 'You are a passive reconnaissance agent...',
        safety_mode: 'cautious',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);

    this.tables.set('vulnerabilities', [
      {
        id: 'vuln-1',
        title: 'SQL Injection in Login',
        severity: 'critical',
        category: 'Injection',
        target: 'api.target.com',
        description: 'SQL injection vulnerability found',
        evidence: 'POST /api/login...',
        remediation: 'Use parameterized queries',
        found_at: new Date().toISOString(),
        agent_name: 'Passive Recon Alpha',
        confirmed: true,
        cvss: 9.8
      }
    ]);

    this.tables.set('mcp_sessions', []);
    this.tables.set('scans', []);
    this.tables.set('users', []);
    this.tables.set('traffic_entries', []);
  }

  from(table: string) {
    const data = this.tables.get(table) || [];
    return {
      select: (columns?: string) => {
        let filteredData = [...data];
        let sortColumn = 'created_at';
        let sortAscending = false;
        let limitCount: number | null = null;

        const applyFilters = (filters: { column: string; value: string | number | boolean; operator: 'eq' | 'ilike' }[]) => {
          filters.forEach(filter => {
            if (filter.operator === 'eq') {
              filteredData = filteredData.filter(item => (item as any)[filter.column] === filter.value);
            } else if (filter.operator === 'ilike') {
              const pattern = String(filter.value).replace(/%/g, '');
              filteredData = filteredData.filter(item =>
                (item as any)[filter.column] && String((item as any)[filter.column]).toLowerCase().includes(pattern.toLowerCase())
              );
            }
          });
        };

        const applySorting = () => {
          filteredData.sort((a, b) => {
            const aVal = (a as any)[sortColumn];
            const bVal = (b as any)[sortColumn];
            if (sortAscending) {
              return aVal < bVal ? -1 : 1;
            } else {
              return aVal > bVal ? -1 : 1;
            }
          });
        };

        const applyLimit = () => {
          if (limitCount !== null) {
            filteredData = filteredData.slice(0, limitCount);
          }
        };

        const execute = () => {
          applySorting();
          applyLimit();
          
          // Apply column selection
          if (columns && columns !== '*') {
            const columnList = columns.split(',').map(col => col.trim());
            filteredData = filteredData.map(item => {
              const result: Record<string, unknown> = {};
              columnList.forEach(col => {
                if (Object.prototype.hasOwnProperty.call(item, col)) {
                  result[col] = item[col as keyof DatabaseRecord];
                }
              });
              return result;
            });
          }
          
          return { data: filteredData, error: null };
        };

        const builder = {
          eq: (column: string, value: string | number | boolean) => {
            applyFilters([{ column, value, operator: 'eq' }]);
            return builder;
          },
          ilike: (column: string, pattern: string) => {
            applyFilters([{ column, value: pattern, operator: 'ilike' }]);
            return builder;
          },
          order: (column: string, options?: { ascending?: boolean }) => {
            sortColumn = column;
            sortAscending = options?.ascending !== false;
            return builder;
          },
          range: (start: number, end: number) => {
            filteredData = filteredData.slice(start, end + 1);
            return builder;
          },
          limit: (count: number) => {
            limitCount = count;
            return builder;
          },
          single: () => {
            const result = filteredData[0] || null;
            if (result && columns && columns !== '*') {
              const columnList = columns.split(',').map(col => col.trim());
              const filteredResult: Record<string, unknown> = {};
              columnList.forEach(col => {
                if (Object.prototype.hasOwnProperty.call(result, col)) {
                  filteredResult[col] = result[col as keyof DatabaseRecord];
                }
              });
              return { data: filteredResult, error: null };
            }
            return { data: result, error: null };
          },
          ...execute()
        };

        return builder;
      },
      insert: (record: Partial<any>) => ({
        select: (columns?: string) => ({
          single: () => {
            const newRecord = { ...record, id: record.id || `rec-${Date.now()}` } as any;
            data.push(newRecord);
            
            if (columns && columns !== '*') {
              const columnList = columns.split(',').map(col => col.trim());
              const filteredResult: Record<string, unknown> = {};
              columnList.forEach(col => {
                if (Object.prototype.hasOwnProperty.call(newRecord, col)) {
                  filteredResult[col] = newRecord[col];
                }
              });
              return { data: filteredResult, error: null };
            }
            
            return { data: newRecord, error: null };
          }
        })
      }),
      update: (updates: Partial<DatabaseRecord>) => ({
        eq: (column: string, value: string | number | boolean) => ({
          select: (columns?: string) => ({
            single: () => {
              const index = data.findIndex(item => (item as any)[column] === value);
              if (index !== -1) {
                data[index] = { ...(data[index] as any), ...updates };
                
                if (columns && columns !== '*') {
                  const columnList = columns.split(',').map(col => col.trim());
                  const filteredResult: Record<string, unknown> = {};
                  columnList.forEach(col => {
                    if (data[index] && Object.prototype.hasOwnProperty.call(data[index], col)) {
                      filteredResult[col] = (data[index] as any)[col];
                    }
                  });
                  return { data: filteredResult, error: null };
                }
                
                return { data: data[index], error: null };
              }
              return { data: null, error: { code: 'PGRST116' } };
            }
          })
        })
      }),
      delete: () => ({
        eq: (column: string, value: any) => {
          const index = data.findIndex(item => (item as any)[column] === value);
          if (index !== -1) data.splice(index, 1);
          return { error: null };
        }
      })
    };
  }
}

const mockDb = new InMemoryDatabase();
export const supabase = { from: (table: string) => mockDb.from(table) };
export const supabaseAdmin = supabase;