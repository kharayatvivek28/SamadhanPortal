import { CheckCircle2, Clock, Circle } from "lucide-react";

const steps = ["Submitted", "Dept. Assigned", "Officer Assigned", "In Progress", "Resolved"];

const statusIndex: Record<string, number> = {
  submitted: 0,
  assigned_dept: 1,
  assigned_officer: 2,
  in_progress: 3,
  resolved: 4,
};

interface Props {
  status: string;
}

const ProgressTracker = ({ status }: Props) => {
  const current = statusIndex[status] ?? 0;

  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {steps.map((step, i) => {
        const done = i <= current;
        const active = i === current;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center min-w-[64px]">
              {done && !active ? (
                <CheckCircle2 className="h-5 w-5 text-status-resolved" />
              ) : active ? (
                <Clock className="h-5 w-5 text-status-progress" />
              ) : (
                <Circle className="h-5 w-5 text-status-pending" />
              )}
              <span className={`text-[10px] mt-1 text-center leading-tight ${done ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-6 ${i < current ? "bg-status-resolved" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProgressTracker;
