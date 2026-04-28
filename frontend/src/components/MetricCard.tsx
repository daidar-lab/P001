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
        "glass-card rounded-2xl p-6 transition-all duration-300",
        className
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">
          {title}
        </h3>
        <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-4xl font-bold tracking-tighter text-slate-900">{value}</span>
        {trendValue && (
          <span
            className={cn(
              "text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider",
              trend === "up" && "bg-emerald-100 text-emerald-600",
              trend === "down" && "bg-rose-100 text-rose-600",
              trend === "neutral" && "bg-slate-100 text-slate-500"
            )}
          >
            {trendValue}
          </span>
        )}
      </div>

      {progress !== undefined && (
        <div className="space-y-3">
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {label}
            </p>
            {progress !== undefined && (
              <span className="text-[10px] font-black text-slate-900">{Math.round(progress)}%</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
