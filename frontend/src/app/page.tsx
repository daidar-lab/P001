"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "@/components/MetricCard";
import { EnergyChart } from "@/components/EnergyChart";
import { BottomNav } from "@/components/BottomNav";
import { fetchStats } from "@/lib/api";
import { 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  Menu, 
  UserCircle,
  Loader2
} from "lucide-react";

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await fetchStats();
      if (data) {
        setStats(data.data);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <main className="min-h-screen bg-background text-slate-100 p-6 md:p-12 pb-32">
      {/* Header Area */}
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-indigo-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="text-white fill-white" size={20} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Audit<span className="text-indigo-500">Energy</span>
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <button className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors">
            <UserCircle size={18} />
            MY ACCOUNT
          </button>
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <Menu size={24} />
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-muted-foreground animate-pulse">Sincronizando com o Pipeline...</p>
        </div>
      ) : (
        <>
          {/* Hero Metrics - Dados Reais do Backend */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <MetricCard
              title="Relatórios Totais"
              value={stats?.totalRelatorios || 0}
              label="Faturas no Sistema"
              icon={<Zap size={20} />}
              progress={100}
              trend="neutral"
              trendValue="Live"
            />
            <MetricCard
              title="Processados"
              value={stats?.porStatus?.processado || 0}
              label="Concluídos com Sucesso"
              icon={<ShieldCheck size={20} />}
              progress={stats?.totalRelatorios ? (stats.porStatus.processado / stats.totalRelatorios) * 100 : 0}
              trend="up"
              trendValue="Eficiência"
            />
            <MetricCard
              title="Em Revisão"
              value={stats?.porStatus?.pronto_revisao || 0}
              label="Aguardando Aprovação"
              icon={<TrendingUp size={20} />}
              progress={stats?.totalRelatorios ? (stats.porStatus.pronto_revisao / stats.totalRelatorios) * 100 : 0}
              trend="down"
              trendValue="Pendentes"
            />
          </div>

          {/* Main Chart Area */}
          <EnergyChart />
        </>
      )}

      {/* Floating Navigation */}
      <BottomNav />

      {/* Ambient background glows */}
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/5 blur-[120px] pointer-events-none" />
    </main>
  );
}
