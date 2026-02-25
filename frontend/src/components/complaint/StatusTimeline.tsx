import { CheckCircle2, Clock, Circle } from "lucide-react";
import { TimelineEntry } from "@/data/mockData";

interface Props {
  timeline: TimelineEntry[];
}

const StatusTimeline = ({ timeline }: Props) => {
  return (
    <div className="space-y-0">
      {timeline.map((entry, i) => {
        const isLast = i === timeline.length - 1;
        const inProgress = !entry.completed && i > 0 && timeline[i - 1]?.completed;

        return (
          <div key={i} className="flex gap-4">
            {/* Line + icon */}
            <div className="flex flex-col items-center">
              {entry.completed ? (
                <CheckCircle2 className="h-6 w-6 text-status-resolved shrink-0" />
              ) : inProgress ? (
                <Clock className="h-6 w-6 text-status-progress shrink-0" />
              ) : (
                <Circle className="h-6 w-6 text-status-pending shrink-0" />
              )}
              {!isLast && (
                <div className={`w-0.5 flex-1 min-h-[2rem] ${entry.completed ? "bg-status-resolved" : "bg-border"}`} />
              )}
            </div>

            {/* Content */}
            <div className="pb-6">
              <p className={`font-medium text-sm ${entry.completed ? "text-foreground" : "text-muted-foreground"}`}>
                {entry.step}
              </p>
              {entry.timestamp && (
                <p className="text-xs text-muted-foreground mt-0.5">{entry.timestamp}</p>
              )}
              {entry.updatedBy && (
                <p className="text-xs text-muted-foreground">By: {entry.updatedBy}</p>
              )}
              {entry.remarks && (
                <p className="text-sm text-muted-foreground mt-1 bg-muted px-3 py-1.5 rounded">{entry.remarks}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatusTimeline;
