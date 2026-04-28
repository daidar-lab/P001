"use client";

import React from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const data = [
  { name: "Sun", value: 5 },
  { name: "Mon", value: 45 },
  { name: "Tue", value: 20 },
  { name: "Wed", value: 55 },
  { name: "Thu", value: 35 },
  { name: "Fri", value: 90 },
  { name: "Sat", value: 70 },
];

export function EnergyChart() {
  return (
    <div className="w-full h-[350px] mt-8 p-6 glass-card rounded-3xl">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="h-2 w-2 bg-accent rounded-full animate-pulse" />
        Consumption Pulse (kWh)
      </h2>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#12121a",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              color: "#f1f5f9",
            }}
            itemStyle={{ color: "#22d3ee" }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#6366f1"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorValue)"
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
