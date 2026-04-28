"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FileText, 
  LayoutDashboard, 
  PieChart, 
  FolderOpen, 
  Calculator 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: FileText, label: "Relatórios", href: "/relatorios" },
  { icon: PieChart, label: "Analytics", href: "/analytics" },
  { icon: FolderOpen, label: "Arquivos", href: "/arquivos" },
  { icon: Calculator, label: "Ferramentas", href: "/tools" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <nav className="flex items-center gap-2 p-2 bg-[#1a0a0a]/90 backdrop-blur-xl border border-white/5 rounded-full shadow-2xl">
        {navItems.map((item, index) => {
          const active = pathname === item.href;
          return (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "group relative flex items-center justify-center p-4 rounded-full transition-all duration-300",
                active 
                  ? "bg-white/10 text-white" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={22} strokeWidth={2} />
              
              {/* Tooltip on Hover */}
              <span className="absolute -top-12 scale-0 group-hover:scale-100 transition-all bg-[#12121a] border border-white/10 text-white text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-widest pointer-events-none whitespace-nowrap">
                {item.label}
              </span>
              
              {/* Active Indicator Dot */}
              {active && (
                <span className="absolute -bottom-1 h-1 w-1 bg-primary rounded-full shadow-[0_0_8px_#6366f1]" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
