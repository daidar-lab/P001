"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StatusBadge } from "@/components/StatusBadge";
import { 
  Search, 
  Filter, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Download,
  MoreVertical,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { API_URL } from "@/config/api";
import { Pagination } from "@/components/Pagination";
import { cn } from "@/lib/utils";

export default function RelatoriosPage() {
  const [relatorios, setRelatorios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { token } = useAuth();
  
  const [status, setStatus] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const statusLabels: any = {
    "": "Todos os Status",
    processado: "Concluído",
    pronto_revisao: "Em Revisão",
    falha: "Falha",
  };

  const fetchRelatorios = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        status: status,
        dataInicio: dateRange.start,
        dataFim: dateRange.end,
      });
      const res = await fetch(`${API_URL}/api/relatorios?${query}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
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

  const handleDownload = async (id: string, codigo: string) => {
    try {
      const res = await fetch(`${API_URL}/api/relatorios/${id}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        alert("O PDF ainda não foi gerado ou ocorreu um erro.");
        return;
      }

      const blob = await res.blob();
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Relatorio-Audit-${codigo}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Erro ao baixar PDF:", err);
    }
  };

  useEffect(() => {
    fetchRelatorios();
  }, [page, status, dateRange, token]);

  return (
    <ProtectedRoute>
      <main className="min-h-screen p-6 md:p-12 pb-32">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1 text-slate-900">Relatórios Gerados</h1>
            <p className="text-slate-500 text-sm font-medium">Acompanhe o status e realize o envio dos relatórios finais.</p>
          </div>
        </div>

        {/* Filters Area */}
        <div className="bg-white rounded-2xl p-4 mb-8 flex flex-wrap items-center gap-4 border border-slate-200 shadow-sm">
          <div className="flex-1 min-w-[280px] relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por código ou cliente..."
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5">
              <Filter size={16} className="text-primary" />
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-transparent text-sm focus:outline-none cursor-pointer text-slate-600 font-bold"
              >
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label as string}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5">
              <Calendar size={16} className="text-primary" />
              <input 
                type="date" 
                className="bg-transparent text-sm focus:outline-none cursor-pointer text-slate-600 font-bold"
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
              <span className="text-slate-300">/</span>
              <input 
                type="date" 
                className="bg-transparent text-sm focus:outline-none cursor-pointer text-slate-600 font-bold"
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Table Area */}
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-200">
                  <th className="px-6 py-5">Código</th>
                  <th className="px-6 py-5">Cliente</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Data Criação</th>
                  <th className="px-6 py-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 animate-pulse">
                      Carregando relatórios...
                    </td>
                  </tr>
                ) : relatorios.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                      Nenhum relatório encontrado.
                    </td>
                  </tr>
                ) : (
                  relatorios.map((rel) => (
                    <tr key={rel.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-5">
                        <span className="font-mono text-xs font-bold text-primary">{rel.codigoRelatorio}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{rel.cliente?.nome || "Cliente não definido"}</span>
                          <span className="text-[10px] text-slate-400 font-bold">{rel.cliente?.cnpj}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge status={rel.status} />
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-500 font-medium">
                        {new Date(rel.criadoEm).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleDownload(rel.id, rel.codigoRelatorio)}
                            className="p-2.5 bg-slate-100 text-slate-400 hover:bg-primary hover:text-white rounded-xl transition-all" 
                            title="Download PDF"
                          >
                            <Download size={18} />
                          </button>
                          <button className="p-2.5 bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-900 rounded-xl transition-all">
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
            onPageChange={setPage} 
          />
        </div>
      </main>
    </ProtectedRoute>
  );
}
