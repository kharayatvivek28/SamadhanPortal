import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
}

const StatsCard = ({ title, value, icon: Icon, description }: Props) => (
  <div className="bg-card rounded-lg border shadow-sm p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-card-foreground mt-1">{value}</p>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="bg-primary/10 p-2.5 rounded-lg">
        <Icon className="h-5 w-5 text-primary" />
      </div>
    </div>
  </div>
);

export default StatsCard;
