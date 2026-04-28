"use client";

import { useEffect, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { ClientesTable } from "@/components/ClientesTable";
import { 
  Users, 
  Upload, 
  Download, 
  Search, 
  Settings2,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function FerramentasPage() {
  const [activeTab, setActiveTab] = useState<"gestao" | "importar">("gestao");
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [importStatus, setImportStatus] = useState<"idle" | "uploading" | "success">("idle");

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/clientes");
      const data = await res.json();
      setClientes(data.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleAddCliente = async (item: any) => {
    try {
      await fetch("http://localhost:3001/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      fetchClientes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCliente = async (id: string) => {
    try {
      await fetch(`http://localhost:3001/api/clientes/${id}`, { method: "DELETE" });
      fetchClientes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCliente = async (id: string, item: any) => {
    try {
      await fetch(`http://localhost:3001/api/clientes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      fetchClientes();
    } catch (err) {
      console.error(err);
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
    <main className="min-h-screen bg-background text-slate-100 p-6 md:p-12 pb-32">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Ferramentas de Gestão</h1>
          <p className="text-muted-foreground text-sm">Configure seus clientes e importe dados do PowerHub.</p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white/5 p-1 rounded-2xl flex gap-1 border border-white/5">
          <button 
            onClick={() => setActiveTab("gestao")}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2",
              activeTab === "gestao" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"
            )}
          >
            <Users size={18} />
            Gestão de Clientes
          </button>
          <button 
            onClick={() => setActiveTab("importar")}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2",
              activeTab === "importar" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"
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
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Settings2 size={20} className="text-primary" />
              Cadastro Manual
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input 
                type="text" placeholder="Filtrar clientes..."
                className="bg-white/5 border border-white/10 rounded-xl py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
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
          <div className="glass-card rounded-[40px] p-12 border-2 border-dashed border-white/10 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8">
              <FileSpreadsheet size={40} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Importação PowerHub</h2>
            <p className="text-muted-foreground mb-10 max-w-md">
              Arraste seu arquivo CSV exportado do PowerHub para carregar automaticamente a estrutura fixa dos seus clientes.
            </p>

            {importStatus === "idle" ? (
              <button 
                onClick={handleImport}
                className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-2xl font-bold shadow-2xl shadow-primary/30 flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95"
              >
                <Download size={20} />
                Selecionar Arquivo
              </button>
            ) : importStatus === "uploading" ? (
              <div className="flex items-center gap-4 text-primary font-bold">
                <Loader2 size={24} className="animate-spin" />
                Processando dados...
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 animate-in bounce-in">
                <CheckCircle2 size={48} className="text-emerald-500" />
                <span className="text-emerald-500 font-bold">Dados Importados com Sucesso!</span>
                <button onClick={() => setActiveTab("gestao")} className="text-sm text-muted-foreground hover:text-white underline underline-offset-4">Ver clientes cadastrados</button>
              </div>
            )}
            
            <div className="mt-12 flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
              <AlertCircle size={20} className="text-amber-500" />
              <span className="text-xs text-muted-foreground text-left">
                Certifique-se de que o arquivo contém as colunas <strong>Nome</strong> e <strong>CNPJ</strong> para uma importação correta.
              </span>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  );
}
