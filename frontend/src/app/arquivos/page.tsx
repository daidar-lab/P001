"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { 
  CloudUpload, 
  FileText, 
  History, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  FileDown,
  MoreVertical,
  Search,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ArquivosImportPage() {
  const [importStatus, setImportStatus] = useState<"idle" | "uploading" | "success">("idle");
  const [relatorios, setRelatorios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    if (token) fetchRelatorios();
  }, [token]);

  const fetchRelatorios = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/relatorios", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setRelatorios(data.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setImportStatus("uploading");

    const formData = new FormData();
    formData.append("arquivo", file);

    try {
      const res = await fetch("http://localhost:3001/api/relatorios/upload", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();
      
      if (result.success) {
        setImportStatus("success");
        fetchRelatorios();
        setTimeout(() => setImportStatus("idle"), 3000);
      } else {
        throw new Error(result.message || "Erro no upload");
      }
    } catch (err) {
      console.error(err);
      setImportStatus("idle");
      alert("Erro ao enviar arquivo CSV. Verifique se o formato está correto.");
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen p-6 md:p-12 pb-32">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1 text-slate-900">Importação de Dados</h1>
            <p className="text-slate-500 text-sm font-medium">Suba seus arquivos CSV do PowerHub para gerar novos relatórios de auditoria.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-primary transition-all shadow-sm">
              <Filter size={20} />
            </button>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" placeholder="Buscar relatórios..."
                className="bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-w-[280px] shadow-sm"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <CloudUpload size={22} />
                </div>
                <h2 className="font-bold text-slate-900">Novo Upload</h2>
              </div>

              <div className={cn(
                "relative border-2 border-dashed rounded-[24px] p-8 flex flex-col items-center text-center transition-all",
                importStatus === "uploading" ? "border-primary bg-primary/5" : "border-slate-100 hover:border-primary/30"
              )}>
                {importStatus === "idle" ? (
                  <>
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-300 group-hover:text-primary transition-all">
                      <FileText size={32} />
                    </div>
                    <p className="text-sm font-bold text-slate-900 mb-1">Arraste seu CSV aqui</p>
                    <p className="text-[11px] text-slate-400 mb-6 font-medium">Arquivos CSV de até 10MB</p>
                    
                    <input 
                      type="file" id="csv-upload" className="hidden" accept=".csv"
                      onChange={handleFileUpload}
                    />
                    <label 
                      htmlFor="csv-upload"
                      className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg active:scale-95"
                    >
                      Selecionar Arquivo
                    </label>
                  </>
                ) : importStatus === "uploading" ? (
                  <div className="py-4 flex flex-col items-center">
                    <Loader2 size={40} className="animate-spin text-primary mb-4" />
                    <p className="text-sm font-black text-primary uppercase tracking-widest">Processando...</p>
                  </div>
                ) : (
                  <div className="py-4 flex flex-col items-center animate-in zoom-in">
                    <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
                    <p className="text-sm font-black text-emerald-600 uppercase tracking-widest">Sucesso!</p>
                  </div>
                )}
              </div>

              <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                <AlertCircle size={18} className="text-amber-500 shrink-0" />
                <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                  O sistema irá processar automaticamente os dados, validando faturas e preparando a análise de IA.
                </p>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-xl shadow-slate-200">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <History size={18} className="text-primary" />
                Resumo da Fila
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Pendente</span>
                  <span className="font-black">0</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="w-0 h-full bg-primary" />
                </div>
                <p className="text-[10px] text-slate-500 italic">Nenhum processo em execução no momento.</p>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h2 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
                  <FileText size={16} className="text-primary" />
                  Histórico de Importações
                </h2>
                <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Ver Tudo</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Relatório</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      [1,2,3].map(i => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={4} className="px-6 py-8">
                            <div className="h-4 bg-slate-100 rounded w-full" />
                          </td>
                        </tr>
                      ))
                    ) : relatorios.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-20 text-center text-slate-400 font-medium">Nenhum relatório encontrado.</td>
                      </tr>
                    ) : (
                      relatorios.map((rel) => (
                        <tr key={rel.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                <FileText size={20} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">{rel.titulo || rel.codigoRelatorio}</p>
                                <p className="text-[10px] text-slate-400 font-medium">{rel.codigoRelatorio}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                              rel.status === "processado" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                              rel.status === "processando" ? "bg-amber-50 text-amber-600 border-amber-100 animate-pulse" :
                              "bg-slate-50 text-slate-400 border-slate-100"
                            )}>
                              {rel.status}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-xs font-bold text-slate-500">
                            {format(new Date(rel.criadoEm), "dd MMM, yyyy", { locale: ptBR })}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="Baixar PDF">
                                <FileDown size={18} />
                              </button>
                              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
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
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
