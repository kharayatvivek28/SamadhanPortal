const shimmerClass =
  "relative overflow-hidden bg-muted rounded before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent";

interface SkeletonCardProps {
  variant?: "stats" | "complaint" | "default";
}

const SkeletonCard = ({ variant = "default" }: SkeletonCardProps) => {
  if (variant === "stats") {
    return (
      <div className="bg-card rounded-lg border shadow-sm p-5 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className={`h-3 w-24 ${shimmerClass}`} />
            <div className={`h-7 w-16 ${shimmerClass}`} />
          </div>
          <div className={`h-10 w-10 rounded-lg ${shimmerClass}`} />
        </div>
      </div>
    );
  }

  if (variant === "complaint") {
    return (
      <div className="bg-card rounded-lg border shadow-sm p-5 animate-pulse">
        <div className="flex items-start justify-between mb-3">
          <div className="space-y-2 flex-1">
            <div className={`h-3 w-28 ${shimmerClass}`} />
            <div className={`h-4 w-48 ${shimmerClass}`} />
          </div>
          <div className={`h-5 w-20 rounded-full ${shimmerClass}`} />
        </div>
        <div className="flex gap-4 mb-4">
          <div className={`h-3 w-24 ${shimmerClass}`} />
          <div className={`h-3 w-20 ${shimmerClass}`} />
          <div className={`h-3 w-20 ${shimmerClass}`} />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`h-5 w-5 rounded-full ${shimmerClass}`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border shadow-sm p-5 animate-pulse">
      <div className="space-y-3">
        <div className={`h-4 w-3/4 ${shimmerClass}`} />
        <div className={`h-3 w-1/2 ${shimmerClass}`} />
        <div className={`h-3 w-2/3 ${shimmerClass}`} />
      </div>
    </div>
  );
};

export default SkeletonCard;
