import { AlertTriangle, AlertCircle, Info, Clock } from 'lucide-react';
import { Alert } from '@/types/sensor';

interface AlertPanelProps {
  alerts: Alert[];
}

const severityConfig = {
  critical: { icon: AlertCircle, className: 'status-critical bg-status-critical' },
  warning: { icon: AlertTriangle, className: 'status-warning bg-status-warning' },
  normal: { icon: Info, className: 'text-primary bg-primary/10' },
};

const AlertPanel = ({ alerts }: AlertPanelProps) => {
  return (
    <div className="glow-card rounded-xl bg-card p-5 h-full">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <AlertTriangle size={14} className="text-primary" />
        Alerts
      </h3>
      <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin pr-1">
        {alerts.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">No active alerts</p>
        ) : (
          alerts.map((alert) => {
            const config = severityConfig[alert.severity];
            const Icon = config.icon;
            return (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-3 rounded-lg border border-border transition-all duration-300 hover:border-border/80`}
              >
                <div className={`p-1 rounded-md ${config.className}`}>
                  <Icon size={12} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground leading-relaxed">{alert.message}</p>
                  <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                    <Clock size={10} />
                    <span className="text-[10px] font-mono">
                      {alert.timestamp.toLocaleTimeString('en-US', { hour12: false })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AlertPanel;
