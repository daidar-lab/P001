"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ClientesTable } from "@/components/ClientesTable";
import { Pagination } from "@/components/Pagination";
import { 
  Users, 
  Upload, 
  Download, 
  Search, 
  Settings2,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { API_URL } from "@/config/api";

export default function FerramentasPage() {
  const [activeTab, setActiveTab] = useState<"gestao" | "importar">("gestao");
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [importStatus, setImportStatus] = useState<"idle" | "uploading" | "success">("idle");
  const { token } = useAuth();

  useEffect(() => {
    if (token) fetchClientes();
  }, [token, page]);

  const fetchClientes = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/clientes?page=${page}&limit=10`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setClientes(data.data || []);
        setTotalPages(data.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleAddCliente = async (item: any) => {
    if (!token) return;
    try {
      await fetch(`${API_URL}/api/clientes`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(item),
      });
      fetchClientes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCliente = async (id: string) => {
    if (!token) return;
    try {
      await fetch(`${API_URL}/api/clientes/${id}`, { 
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      fetchClientes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCliente = async (id: string, item: any) => {
    if (!token) return;
    try {
      // Filtrar apenas campos editáveis para evitar erro de campos protegidos no Prisma
      const { nome, cnpj, endereco, cidade, responsavel, emailFinanceiro } = item;
      const updateData = { nome, cnpj, endereco, cidade, responsavel, emailFinanceiro };

      const res = await fetch(`${API_URL}/api/clientes/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao atualizar cliente");
      }

      fetchClientes();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar alterações do cliente");
    }
  };

  const [importResult, setImportResult] = useState<{sucesso: number, falhas: number, erros: string[]} | null>(null);

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setImportStatus("uploading");
    setImportResult(null);

    const formData = new FormData();
    formData.append("arquivo", file);

    try {
      const res = await fetch(`${API_URL}/api/clientes/importar`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();
      
      if (result.success) {
        setImportStatus("success");
        setImportResult(result.data);
        fetchClientes();
      } else {
        throw new Error(result.message || "Erro na importação");
      }
    } catch (err) {
      console.error(err);
      setImportStatus("idle");
      alert("Erro ao importar arquivo. Verifique o formato e tente novamente.");
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen p-6 md:p-12 pb-32">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1 text-slate-900">Ferramentas de Gestão</h1>
            <p className="text-slate-500 text-sm font-medium">Configure seus clientes e importe dados do PowerHub.</p>
          </div>

          {/* Tab Switcher */}
          <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 border border-slate-200">
            <button 
              onClick={() => setActiveTab("gestao")}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2",
                activeTab === "gestao" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Users size={18} />
              Gestão de Clientes
            </button>
            <button 
              onClick={() => setActiveTab("importar")}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2",
                activeTab === "importar" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Upload size={18} />
              Importar PowerHub
            </button>
          </div>
        </div>

        {activeTab === "gestao" ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                <Settings2 size={20} className="text-primary" />
                Cadastro Manual
              </h2>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
                <input 
                  type="text" placeholder="Filtrar clientes..."
                  className="bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-w-[280px]"
                />
              </div>
            </div>
            
            <ClientesTable 
              clientes={clientes} 
              onAdd={handleAddCliente}
              onDelete={handleDeleteCliente}
              onUpdate={handleUpdateCliente}
              loading={loading}
            />

            <Pagination 
              currentPage={page} 
              totalPages={totalPages} 
              onPageChange={setPage} 
            />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto py-10 animate-in zoom-in-95 duration-300">
            <div className="bg-white rounded-[40px] p-12 border-2 border-dashed border-slate-200 flex flex-col items-center text-center shadow-sm">
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-8">
                <FileSpreadsheet size={40} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-slate-900">Importação PowerHub</h2>
              <p className="text-slate-500 mb-10 max-w-md font-medium">
                Arraste seu arquivo CSV ou Excel exportado do PowerHub para carregar automaticamente a estrutura fixa dos seus clientes.
              </p>

              {importStatus === "idle" ? (
                <div className="relative">
                  <input 
                    type="file" 
                    id="client-import" 
                    className="hidden" 
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileImport}
                  />
                  <label 
                    htmlFor="client-import"
                    className="bg-primary hover:bg-emerald-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Download size={20} />
                    Selecionar Arquivo
                  </label>
                </div>
              ) : importStatus === "uploading" ? (
                <div className="flex flex-col items-center gap-4 text-primary font-black">
                  <Loader2 size={40} className="animate-spin text-primary/40" />
                  <span>Processando e sanitizando dados...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 animate-in bounce-in w-full max-w-md">
                  <CheckCircle2 size={48} className="text-emerald-500" />
                  <span className="text-emerald-500 font-black text-xl">Importação Concluída!</span>
                  
                  <div className="grid grid-cols-2 gap-4 w-full mt-2">
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
                      <span className="block text-2xl font-black text-emerald-600">{importResult?.sucesso}</span>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600/60">Sucesso</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                      <span className="block text-2xl font-black text-slate-400">{importResult?.falhas}</span>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400/60">Ignorados</span>
                    </div>
                  </div>

                  {importResult && importResult.erros.length > 0 && (
                    <div className="mt-4 w-full text-left bg-slate-50 rounded-2xl p-4 max-h-40 overflow-y-auto border border-slate-100">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Detalhes dos Alertas</h4>
                      {importResult.erros.map((erro, idx) => (
                        <div key={idx} className="text-[11px] text-slate-500 mb-1 flex gap-2">
                          <span className="text-primary">•</span> {erro}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-4 mt-6">
                    <button 
                      onClick={() => setImportStatus("idle")}
                      className="text-sm text-slate-400 hover:text-slate-600 font-bold transition-colors"
                    >
                      Importar outro arquivo
                    </button>
                    <button 
                      onClick={() => setActiveTab("gestao")} 
                      className="bg-slate-900 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all"
                    >
                      Ver Clientes
                    </button>
                  </div>
                </div>
              )}
              
              <div className="mt-12 flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <AlertCircle size={20} className="text-amber-500 shrink-0" />
                <span className="text-xs text-slate-500 text-left font-medium leading-relaxed">
                  Aceita arquivos <strong className="text-slate-700">.xlsx</strong> e <strong className="text-slate-700">.csv</strong>. O sistema remove automaticamente a formatação científica de CNPJs e IDs.
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
