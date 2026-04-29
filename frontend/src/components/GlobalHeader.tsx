"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  X, 
  LayoutDashboard, 
  FileText, 
  Users,
  FolderOpen, 
  Calculator,
  Menu,
  Zap,
  LayoutGrid,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: FileText, label: "Relatórios", href: "/relatorios" },
  { icon: FolderOpen, label: "Arquivos", href: "/arquivos" },
  { icon: LayoutGrid, label: "Inventário", href: "/inventario" },
  { icon: Calculator, label: "Ferramentas", href: "/ferramentas" },
  { icon: Users, label: "Usuários", href: "/analytics", adminOnly: true },
];

export function GlobalHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { logout, user } = useAuth();

  if (pathname === "/login") return null;

  return (
    <>
      {/* Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-2">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <Zap className="text-white fill-white" size={18} />
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-950">
              Audit<span className="text-primary">Energy</span>
            </h1>
          </Link>

          <button 
            onClick={() => setIsOpen(true)}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-xl border border-slate-200 transition-all active:scale-95 shadow-sm"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Padding for fixed header */}
      <div className="h-14" />

      {/* Sidebar Overlay Menu */}
      <div className={cn(
        "fixed inset-0 z-50 transition-all duration-500",
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      )}>
        {/* Backdrop */}
        <div 
          className={cn(
            "absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-500",
            isOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setIsOpen(false)}
        />

        {/* Menu Panel */}
        <div className={cn(
          "absolute top-0 right-0 bottom-0 w-full max-w-sm bg-white border-l border-slate-200 shadow-2xl transition-transform duration-500 ease-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}>
          <div className="flex justify-between items-center p-8 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Menu de Navegação</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
            {navItems.map((item, index) => {
              if (item.adminOnly && user?.cargo !== "ADMIN") return null;
              
              const active = pathname === item.href;
              return (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group",
                    active 
                      ? "bg-primary/10 border border-primary/10 text-primary" 
                      : "hover:bg-slate-50 text-slate-500 hover:text-slate-900 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-2.5 rounded-xl transition-all",
                      active ? "bg-primary text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600"
                    )}>
                      <item.icon size={20} />
                    </div>
                    <span className="font-semibold">{item.label}</span>
                  </div>
                  <ChevronRight size={18} className={cn(
                    "transition-transform",
                    active ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                  )} />
                </Link>
              );
            })}
          </nav>

          <div className="p-8 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary p-[1px]">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                   <span className="text-sm font-bold text-primary">{user?.nome?.split(' ').map(n => n[0]).join('').toUpperCase() || 'AU'}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{user?.nome || 'Usuário'}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{user?.cargo || 'CARGO'}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full py-3 rounded-xl bg-white hover:bg-rose-50 text-rose-500 text-xs font-bold transition-all border border-slate-200 hover:border-rose-200 shadow-sm"
            >
              Sair da Conta
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
