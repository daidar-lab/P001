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

interface ProductivityChartProps {
  data: { name: string; total: number }[];
}

export function ProductivityChart({ data }: ProductivityChartProps) {
  return (
    <div className="w-full h-[400px] mt-8 p-8 glass-card rounded-[2.5rem]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
            <span className="h-2 w-2 bg-primary rounded-full animate-pulse" />
            Relatórios Enviados
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">Produtividade de envios por e-mail nos últimos 7 dias.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <span className="px-4 py-1.5 bg-white text-primary text-[10px] font-black rounded-lg shadow-sm">SEMANAL</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="70%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              padding: "12px"
            }}
            itemStyle={{ color: "#10b981", fontWeight: "bold" }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#10b981"
            strokeWidth={4}
            fillOpacity={1}
            fill="url(#colorSent)"
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
