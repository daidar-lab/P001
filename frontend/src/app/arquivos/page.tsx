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
import { API_URL } from "@/config/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ArquivosImportPage() {
  const [importStatus, setImportStatus] = useState<"idle" | "uploading" | "success">("idle");
  const [relatorios, setRelatorios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    if (token) fetchRelatoriosList();
  }, [token]);

  const fetchRelatoriosList = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/relatorios`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setRelatorios(data.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const [validationErrors, setValidationErrors] = useState<any[]>([]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    if (e.type === 'drop' || e.type === 'dragover') {
      e.preventDefault();
      e.stopPropagation();
    }

    if (e.type === 'dragover') return;

    let file: File | undefined;

    if ('target' in e && 'files' in e.target && e.target.files) {
      file = e.target.files[0];
    } else if ('dataTransfer' in e && e.dataTransfer.files) {
      file = e.dataTransfer.files[0];
    }

    if (!file || !token) return;

    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      alert("Por favor, selecione apenas arquivos CSV.");
      return;
    }

    setImportStatus("uploading");
    setValidationErrors([]);

    const formData = new FormData();
    formData.append("arquivo", file);

    try {
      const res = await fetch(`${API_URL}/api/relatorios/upload`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();

      if (result.success) {
        setImportStatus("success");
        fetchRelatoriosList();
        setTimeout(() => setImportStatus("idle"), 3000);
      } else {
        if (result.validation?.errors) {
          setValidationErrors(result.validation.errors);
        }
        throw new Error(result.error || result.message || "Erro no upload");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setImportStatus("idle");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen p-6 md:p-12 pb-32">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1 text-slate-900">Importação de Dados — Estável</h1>
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
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <CloudUpload size={22} />
                </div>
                <h2 className="font-bold text-slate-900">Novo Upload</h2>
              </div>

              <div
                onDragOver={handleDragOver}
                onDrop={handleFileUpload}
                className={cn(
                  "relative border-2 border-dashed rounded-[24px] p-8 flex flex-col items-center text-center transition-all",
                  importStatus === "uploading" ? "border-primary bg-primary/5" : "border-slate-100 hover:border-primary/30"
                )}
              >
                {importStatus === "idle" ? (
                <>
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-300 group-hover:text-primary transition-all">
                    <FileText size={32} />
                  </div>
                  <p className="text-sm font-bold text-slate-900 mb-1">Arraste seu CSV aqui</p>
                  <p className="text-[11px] text-slate-400 mb-6 font-medium">Arquivos CSV de até 10MB</p>

                  <input
                    type="file" id="csv-upload" className="hidden"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
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

              {validationErrors.length > 0 && (
                <div className="mt-6 p-4 bg-red-50 rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-4">
                  <div className="flex items-center gap-2 mb-2 text-red-600">
                    <AlertCircle size={16} />
                    <span className="text-xs font-black uppercase tracking-widest">Erros de Validação</span>
                  </div>
                  <ul className="space-y-1">
                    {validationErrors.slice(0, 5).map((err, i) => (
                      <li key={i} className="text-[10px] text-red-500 font-medium list-disc list-inside">
                        {err.message}
                      </li>
                    ))}
                    {validationErrors.length > 5 && (
                      <li className="text-[10px] text-red-400 italic">...e mais {validationErrors.length - 5} erros.</li>
                    )}
                  </ul>
                  <button
                    onClick={() => setValidationErrors([])}
                    className="mt-3 text-[10px] font-black text-red-600 uppercase hover:underline"
                  >
                    Limpar Avisos
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h2 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
                  <FileText size={16} className="text-primary" />
                  Histórico de Importações
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Relatório</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      [1, 2, 3].map(i => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={3} className="px-6 py-8">
                            <div className="h-4 bg-slate-100 rounded w-full" />
                          </td>
                        </tr>
                      ))
                    ) : relatorios.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-20 text-center text-slate-400 font-medium">Nenhum relatório encontrado.</td>
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
