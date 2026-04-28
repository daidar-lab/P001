import React from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  label: string;
  icon: React.ReactNode;
  progress?: number;
  className?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export function MetricCard({
  title,
  value,
  label,
  icon,
  progress,
  className,
  trend,
  trendValue,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-2xl p-6 transition-all duration-300 hover:translate-y-[-4px]",
        className
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
          {title}
        </h3>
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-4xl font-bold tracking-tighter">{value}</span>
        {trendValue && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              trend === "up" && "bg-emerald-500/10 text-emerald-500",
              trend === "down" && "bg-rose-500/10 text-rose-500",
              trend === "neutral" && "bg-slate-500/10 text-slate-400"
            )}
          >
            {trendValue}
          </span>
        )}
      </div>

      {progress !== undefined && (
        <div className="space-y-2">
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">
            {label}
          </p>
        </div>
      )}
    </div>
  );
}
