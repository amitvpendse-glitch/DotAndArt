import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { AuditLog } from '../types';

interface AdminErrorLogsProps {
  logs: AuditLog[];
}

export const AdminErrorLogs: React.FC<AdminErrorLogsProps> = ({ logs }) => {
  const errorLogs = logs.filter(log => log.action.includes('failed') || log.action.includes('error'));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-theme-primary">
        <AlertTriangle className="w-5 h-5 text-amber-500" />
        <h2 className="font-serif text-xl font-semibold">System Error Logs</h2>
      </div>
      
      {errorLogs.length === 0 ? (
        <div className="p-8 text-center text-xs text-theme-muted glass-card rounded-2xl border border-theme-glass">
          No recent system errors found.
        </div>
      ) : (
        <div className="space-y-3">
          {errorLogs.map((log) => (
            <div key={log.id} className="p-4 rounded-xl glass-card border border-red-200 dark:border-red-900/30 bg-red-50/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">{log.action}</span>
                <span className="text-[10px] text-theme-muted flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-theme-primary opacity-80 font-mono">
                {JSON.stringify(log.safe_metadata_json)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
