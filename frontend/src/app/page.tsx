"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "@/components/MetricCard";
import { ProductivityChart } from "@/components/ProductivityChart";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { BottomNav } from "@/components/BottomNav";
import { fetchStats } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
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
  const { token } = useAuth();

  useEffect(() => {
    async function loadData() {
      if (!token) return;
      const data = await fetchStats(token);
      setStats(data);
      setLoading(false);
    }
    loadData();
  }, [token]);

  return (
    <ProtectedRoute>
      <main className="min-h-screen p-6 md:p-12">
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

            {/* Main Chart Area - Dados Reais de Produtividade */}
            <ProductivityChart data={stats?.enviadosPorDia || []} />
          </>
        )}

        {/* Ambient background glows */}
        <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[120px] pointer-events-none" />
        <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/5 blur-[120px] pointer-events-none" />
      </main>
    </ProtectedRoute>
  );
}
