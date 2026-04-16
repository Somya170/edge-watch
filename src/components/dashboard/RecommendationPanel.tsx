import { Lightbulb, Wrench, ShieldAlert, Zap } from 'lucide-react';
import { Recommendation } from '@/types/sensor';

interface RecommendationPanelProps {
  data: Recommendation[];
}

const priorityStyles = {
  high: 'border-status-critical/30 bg-status-critical/5',
  medium: 'border-status-warning/30 bg-status-warning/5',
  low: 'border-border bg-muted/30',
};

const priorityBadge = {
  high: 'bg-status-critical/20 text-status-critical',
  medium: 'bg-status-warning/20 text-status-warning',
  low: 'bg-muted text-muted-foreground',
};

const categoryIcon = {
  maintenance: Wrench,
  risk: ShieldAlert,
  optimization: Zap,
};

const RecommendationPanel = ({ data }: RecommendationPanelProps) => {
  return (
    <div className="glow-card rounded-xl bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb size={16} className="text-accent" />
        <h3 className="text-sm font-semibold text-foreground">AI Recommendations</h3>
      </div>

      {data.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">No recommendations at this time.</p>
      ) : (
        <div className="space-y-2.5">
          {data.map((rec) => {
            const Icon = categoryIcon[rec.category];
            return (
              <div
                key={rec.id}
                className={`rounded-lg border p-3 transition-all duration-300 hover:scale-[1.01] ${priorityStyles[rec.priority]}`}
              >
                <div className="flex items-start gap-2.5">
                  <Icon size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground leading-relaxed">{rec.message}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase ${priorityBadge[rec.priority]}`}>
                        {rec.priority}
                      </span>
                      <span className="text-[10px] text-muted-foreground capitalize">{rec.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecommendationPanel;
