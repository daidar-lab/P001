"use client";

import { useEffect, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { StatusBadge } from "@/components/StatusBadge";
import { UploadModal } from "@/components/UploadModal";
import { 
  Search, 
  Filter, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Download,
  MoreVertical,
  Zap,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function RelatoriosPage() {
  const [relatorios, setRelatorios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  
  // Filtros
  const [status, setStatus] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const statusLabels: any = {
    "": "Todos os Status",
    processado: "Concluído",
    pronto_revisao: "Em Revisão",
    falha: "Falha",
  };

  const fetchRelatorios = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        status: status,
        dataInicio: dateRange.start,
        dataFim: dateRange.end,
      });
      const res = await fetch(`http://localhost:3001/api/relatorios?${query}`);
      const data = await res.json();
      if (data.success) {
        setRelatorios(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRelatorios();
  }, [page, status, dateRange]);

  return (
    <main className="min-h-screen bg-background text-slate-100 p-6 md:p-12 pb-32">
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onSuccess={fetchRelatorios} 
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Relatórios</h1>
          <p className="text-muted-foreground text-sm">Gerencie e audite suas faturas processadas.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all shadow-lg shadow-primary/20"
          >
            <Zap size={18} fill="currentColor" />
            Novo Upload
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card rounded-2xl p-4 mb-8 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por código ou cliente..."
            className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Custom Status Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
              className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-sm hover:bg-white/10 transition-all min-w-[160px] justify-between"
            >
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-primary" />
                {statusLabels[status]}
              </div>
              <ChevronDown size={14} className={cn("transition-transform", isStatusMenuOpen && "rotate-180")} />
            </button>

            {isStatusMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsStatusMenuOpen(false)} />
                <div className="absolute top-full left-0 mt-2 w-full bg-[#1a1a24] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setStatus(key);
                        setIsStatusMenuOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-3 text-sm hover:bg-primary/10 transition-colors border-b border-white/5 last:border-0",
                        status === key && "text-primary bg-primary/5"
                      )}
                    >
                      {label as string}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-3 py-2">
            <Calendar size={16} className="text-primary" />
            <input 
              type="date" 
              className="bg-transparent text-sm focus:outline-none cursor-pointer"
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
            <span className="text-white/20">/</span>
            <input 
              type="date" 
              className="bg-transparent text-sm focus:outline-none cursor-pointer"
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-muted-foreground text-[11px] uppercase tracking-widest border-b border-white/5">
                <th className="px-6 py-4 font-semibold">Código</th>
                <th className="px-6 py-4 font-semibold">Cliente</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Data Criação</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground animate-pulse">
                    Carregando relatórios...
                  </td>
                </tr>
              ) : relatorios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    Nenhum relatório encontrado.
                  </td>
                </tr>
              ) : (
                relatorios.map((rel) => (
                  <tr key={rel.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-primary">{rel.codigoRelatorio}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{rel.cliente?.nome || "Cliente não definido"}</span>
                        <span className="text-[10px] text-muted-foreground">{rel.cliente?.cnpj}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={rel.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(rel.criadoEm).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-all" title="Download PDF">
                          <Download size={16} />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 bg-white/5 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Página <span className="text-white font-medium">{page}</span> de <span className="text-white font-medium">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-white/5 rounded-lg disabled:opacity-30 hover:bg-white/5 transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-white/5 rounded-lg disabled:opacity-30 hover:bg-white/5 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
