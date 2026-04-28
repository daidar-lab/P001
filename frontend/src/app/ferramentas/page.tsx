"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ClientesTable } from "@/components/ClientesTable";
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

export default function FerramentasPage() {
  const [activeTab, setActiveTab] = useState<"gestao" | "importar">("gestao");
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [importStatus, setImportStatus] = useState<"idle" | "uploading" | "success">("idle");
  const { token } = useAuth();

  useEffect(() => {
    if (token) fetchClientes();
  }, [token]);

  const fetchClientes = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/clientes", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setClientes(data.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleAddCliente = async (item: any) => {
    if (!token) return;
    try {
      await fetch("http://localhost:3001/api/clientes", {
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
      await fetch(`http://localhost:3001/api/clientes/${id}`, { 
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

      const res = await fetch(`http://localhost:3001/api/clientes/${id}`, {
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

  const handleImport = () => {
    setImportStatus("uploading");
    setTimeout(() => {
      setImportStatus("success");
      fetchClientes();
    }, 2000);
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
          </div>
        ) : (
          <div className="max-w-3xl mx-auto py-10 animate-in zoom-in-95 duration-300">
            <div className="bg-white rounded-[40px] p-12 border-2 border-dashed border-slate-200 flex flex-col items-center text-center shadow-sm">
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-8">
                <FileSpreadsheet size={40} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-slate-900">Importação PowerHub</h2>
              <p className="text-slate-500 mb-10 max-w-md font-medium">
                Arraste seu arquivo CSV exportado do PowerHub para carregar automaticamente a estrutura fixa dos seus clientes.
              </p>

              {importStatus === "idle" ? (
                <button 
                  onClick={handleImport}
                  className="bg-primary hover:bg-emerald-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95"
                >
                  <Download size={20} />
                  Selecionar Arquivo
                </button>
              ) : importStatus === "uploading" ? (
                <div className="flex items-center gap-4 text-primary font-black">
                  <Loader2 size={24} className="animate-spin" />
                  Processando dados...
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 animate-in bounce-in">
                  <CheckCircle2 size={48} className="text-emerald-500" />
                  <span className="text-emerald-500 font-black text-lg">Dados Importados com Sucesso!</span>
                  <button onClick={() => setActiveTab("gestao")} className="text-sm text-slate-400 hover:text-primary font-bold underline underline-offset-4 decoration-2">Ver clientes cadastrados</button>
                </div>
              )}
              
              <div className="mt-12 flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <AlertCircle size={20} className="text-amber-500 shrink-0" />
                <span className="text-xs text-slate-500 text-left font-medium leading-relaxed">
                  Certifique-se de que o arquivo contém as colunas <strong className="text-slate-700">Nome</strong> e <strong className="text-slate-700">CNPJ</strong> para uma importação correta.
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
