"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { EquipamentosTable } from "@/components/EquipamentosTable";
import { 
  User, 
  Building2, 
  MapPin, 
  Mail, 
  Hash,
  ChevronDown,
  LayoutGrid,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export default function ArquivosPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<any>(null);
  const [equipamentos, setEquipamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  // Carregar Clientes
  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:3001/api/clientes", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setClientes(data.data || []))
      .catch(err => console.error(err));
  }, [token]);

  // Carregar Equipamentos quando o cliente muda
  useEffect(() => {
    if (selectedCliente && token) {
      fetchEquipamentos(selectedCliente.id);
    } else {
      setEquipamentos([]);
    }
  }, [selectedCliente, token]);

  const fetchEquipamentos = async (clienteId: string) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/equipamentos?clienteId=${clienteId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setEquipamentos(data.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleAddEquipamento = async (item: any) => {
    if (!selectedCliente || !token) return;
    try {
      const res = await fetch("http://localhost:3001/api/equipamentos", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ...item, clienteId: selectedCliente.id }),
      });
      if (res.ok) fetchEquipamentos(selectedCliente.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEquipamento = async (id: string) => {
    if (!token) return;
    try {
      await fetch(`http://localhost:3001/api/equipamentos/${id}`, { 
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (selectedCliente) fetchEquipamentos(selectedCliente.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateEquipamento = async (id: string, item: any) => {
    if (!token || !selectedCliente) return;
    try {
      // Filtrar apenas campos editáveis
      const { descricao, quantidade, potenciaWatts, horasDia, diasMes } = item;
      const updateData = { descricao, quantidade, potenciaWatts, horasDia, diasMes };

      const res = await fetch(`http://localhost:3001/api/equipamentos/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) throw new Error("Erro ao atualizar equipamento");
      
      fetchEquipamentos(selectedCliente.id);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar alterações do equipamento");
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen p-6 md:p-12 pb-32">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1 text-slate-900">Inventário de Equipamentos</h1>
            <p className="text-slate-500 text-sm font-medium">Checklist técnico para levantamento de carga instalada.</p>
          </div>
          
          {/* Cliente Selector */}
          <div className="relative group">
            <select 
              onChange={(e) => {
                const cliente = clientes.find(c => c.id === e.target.value);
                setSelectedCliente(cliente);
              }}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer min-w-[240px] appearance-none text-slate-700 font-bold shadow-sm hover:border-slate-300 transition-all"
            >
              <option value="">Selecione um Cliente...</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id} className="bg-white text-slate-900">{c.nome}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-primary transition-colors" size={16} />
          </div>
        </div>

        {!selectedCliente ? (
          <div className="flex flex-col items-center justify-center h-[50vh] border-2 border-dashed border-slate-200 rounded-[40px] bg-white shadow-sm">
            <div className="p-6 bg-slate-50 rounded-full mb-4">
              <LayoutGrid size={48} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">Por favor, selecione um cliente para gerenciar o inventário.</p>
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
              <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                <div className="flex items-center gap-3 text-emerald-600 mb-2">
                  <Zap size={18} fill="currentColor" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Status da Auditoria</span>
                </div>
                <p className="text-sm font-bold text-emerald-700">Levantamento em Andamento</p>
              </div>
            </div>

            {/* Equipment Table CRUD */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Checklist de Equipamentos</h2>
                <div className="h-px flex-1 bg-slate-200" />
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
      </main>
    </ProtectedRoute>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-primary/30 transition-all group">
      <div className="flex items-center gap-3 text-slate-400 mb-2 group-hover:text-primary transition-colors">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-sm font-bold text-slate-900 truncate" title={value}>{value}</p>
    </div>
  );
}
