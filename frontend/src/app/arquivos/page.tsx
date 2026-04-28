"use client";

import { useEffect, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { EquipamentosTable } from "@/components/EquipamentosTable";
import { 
  User, 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  Hash,
  ChevronDown,
  LayoutGrid,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ArquivosPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<any>(null);
  const [equipamentos, setEquipamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar Clientes
  useEffect(() => {
    fetch("http://localhost:3001/api/clientes")
      .then(res => res.json())
      .then(data => setClientes(data.data || []))
      .catch(err => console.error(err));
  }, []);

  // Carregar Equipamentos quando o cliente muda
  useEffect(() => {
    if (selectedCliente) {
      fetchEquipamentos(selectedCliente.id);
    } else {
      setEquipamentos([]);
    }
  }, [selectedCliente]);

  const fetchEquipamentos = async (clienteId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/equipamentos?clienteId=${clienteId}`);
      const data = await res.json();
      if (data.success) setEquipamentos(data.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleAddEquipamento = async (item: any) => {
    if (!selectedCliente) return;
    try {
      const res = await fetch("http://localhost:3001/api/equipamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, clienteId: selectedCliente.id }),
      });
      if (res.ok) fetchEquipamentos(selectedCliente.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEquipamento = async (id: string) => {
    try {
      await fetch(`http://localhost:3001/api/equipamentos/${id}`, { method: "DELETE" });
      if (selectedCliente) fetchEquipamentos(selectedCliente.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateEquipamento = async (id: string, item: any) => {
    try {
      const res = await fetch(`http://localhost:3001/api/equipamentos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (res.ok && selectedCliente) fetchEquipamentos(selectedCliente.id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="min-h-screen bg-background text-slate-100 p-6 md:p-12 pb-32">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Inventário de Equipamentos</h1>
          <p className="text-muted-foreground text-sm">Checklist técnico para levantamento de carga instalada.</p>
        </div>
        
        {/* Cliente Selector */}
        <div className="relative group">
          <select 
            onChange={(e) => {
              const cliente = clientes.find(c => c.id === e.target.value);
              setSelectedCliente(cliente);
            }}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer min-w-[240px] appearance-none"
          >
            <option value="">Selecione um Cliente...</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id} className="bg-[#12121a]">{c.nome}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none group-hover:text-white transition-colors" size={16} />
        </div>
      </div>

      {!selectedCliente ? (
        <div className="flex flex-col items-center justify-center h-[50vh] border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.02]">
          <div className="p-6 bg-white/5 rounded-full mb-4">
            <LayoutGrid size={48} className="text-muted-foreground/30" />
          </div>
          <p className="text-muted-foreground">Por favor, selecione um cliente para gerenciar o inventário.</p>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Identificação Section (Real Data) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoCard icon={<Building2 size={18}/>} label="Cliente / Razão Social" value={selectedCliente.nome} />
            <InfoCard icon={<Hash size={18}/>} label="CNPJ" value={selectedCliente.cnpj || "Não informado"} />
            <InfoCard icon={<User size={18}/>} label="Responsável Técnico" value={selectedCliente.responsavel || "Não informado"} />
            <InfoCard icon={<MapPin size={18}/>} label="Endereço" value={selectedCliente.endereco || "Não informado"} />
            <InfoCard icon={<Mail size={18}/>} label="E-mail Financeiro" value={selectedCliente.emailFinanceiro || "Não informado"} />
            <div className="glass-card rounded-2xl p-5 border border-primary/20 bg-primary/5">
              <div className="flex items-center gap-3 text-primary mb-2">
                <Zap size={18} fill="currentColor" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Status da Auditoria</span>
              </div>
              <p className="text-sm font-semibold">Levantamento em Andamento</p>
            </div>
          </div>

          {/* Equipment Table CRUD */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold">Checklist de Equipamentos</h2>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            
            <EquipamentosTable 
              equipamentos={equipamentos} 
              onAdd={handleAddEquipamento}
              onDelete={handleDeleteEquipamento}
              onUpdate={handleUpdateEquipamento}
              loading={loading}
            />
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="glass-card rounded-2xl p-5 hover:bg-white/5 transition-all">
      <div className="flex items-center gap-3 text-muted-foreground mb-2">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-sm font-semibold truncate" title={value}>{value}</p>
    </div>
  );
}
