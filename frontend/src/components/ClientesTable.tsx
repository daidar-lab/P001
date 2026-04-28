"use client";

import React, { useState } from "react";
import { Plus, Trash2, Edit2, Check, X, Loader2, Building2, MapPin, User, Mail, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

interface Cliente {
  id: string;
  nome: string;
  cnpj: string;
  endereco?: string;
  cidade?: string;
  responsavel?: string;
  emailFinanceiro?: string;
}

interface ClientesTableProps {
  clientes: Cliente[];
  onAdd: (item: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, item: any) => Promise<void>;
  loading: boolean;
}

export function ClientesTable({ clientes, onAdd, onDelete, onUpdate, loading }: ClientesTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [newItem, setNewItem] = useState({
    nome: "",
    cnpj: "",
    endereco: "",
    cidade: "",
    responsavel: "",
    emailFinanceiro: ""
  });

  const handleAdd = async () => {
    if (!newItem.nome || !newItem.cnpj) return;
    setIsAdding(true);
    await onAdd(newItem);
    setNewItem({ nome: "", cnpj: "", endereco: "", cidade: "", responsavel: "", emailFinanceiro: "" });
    setIsAdding(false);
  };

  const startEdit = (item: Cliente) => {
    setEditingId(item.id);
    setEditItem({ ...item });
  };

  const saveEdit = async () => {
    if (editingId && editItem) {
      await onUpdate(editingId, editItem);
      setEditingId(null);
      setEditItem(null);
    }
  };

  return (
    <div className="glass-card rounded-3xl overflow-hidden border border-white/5">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-muted-foreground text-[11px] uppercase tracking-widest border-b border-white/5">
              <th className="px-6 py-4 font-semibold">Cliente / Razão Social</th>
              <th className="px-6 py-4 font-semibold">CNPJ</th>
              <th className="px-6 py-4 font-semibold">Cidade / Endereço</th>
              <th className="px-6 py-4 font-semibold">Responsável</th>
              <th className="px-6 py-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {/* Cadastro Row */}
            <tr className="bg-primary/5">
              <td className="px-6 py-4">
                <input 
                  type="text" placeholder="Nome da Empresa"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-primary"
                  value={newItem.nome} onChange={e => setNewItem({...newItem, nome: e.target.value})}
                />
              </td>
              <td className="px-6 py-4">
                <input 
                  type="text" placeholder="00.000.000/0000-00"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-primary"
                  value={newItem.cnpj} onChange={e => setNewItem({...newItem, cnpj: e.target.value})}
                />
              </td>
              <td className="px-6 py-4">
                <input 
                  type="text" placeholder="Cidade, UF - Endereço"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-primary"
                  value={newItem.cidade} onChange={e => setNewItem({...newItem, cidade: e.target.value})}
                />
              </td>
              <td className="px-6 py-4">
                <input 
                  type="text" placeholder="Responsável"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-primary"
                  value={newItem.responsavel} onChange={e => setNewItem({...newItem, responsavel: e.target.value})}
                />
              </td>
              <td className="px-6 py-4 text-right">
                <button 
                  onClick={handleAdd} disabled={isAdding || !newItem.nome}
                  className="p-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {isAdding ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                </button>
              </td>
            </tr>

            {/* Listagem */}
            {loading && clientes.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground animate-pulse">Carregando clientes...</td></tr>
            ) : clientes.map((cliente) => (
              <tr key={cliente.id} className={cn("hover:bg-white/[0.02] transition-colors group", editingId === cliente.id && "bg-white/5")}>
                {editingId === cliente.id ? (
                  <>
                    <td className="px-6 py-4"><input className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm" value={editItem.nome} onChange={e => setEditItem({...editItem, nome: e.target.value})} /></td>
                    <td className="px-6 py-4"><input className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm" value={editItem.cnpj} onChange={e => setEditItem({...editItem, cnpj: e.target.value})} /></td>
                    <td className="px-6 py-4"><input className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm" value={editItem.cidade} onChange={e => setEditItem({...editItem, cidade: e.target.value})} /></td>
                    <td className="px-6 py-4"><input className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm" value={editItem.responsavel} onChange={e => setEditItem({...editItem, responsavel: e.target.value})} /></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={saveEdit} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg"><Check size={16} /></button>
                        <button onClick={() => setEditingId(null)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg"><X size={16} /></button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {cliente.nome.charAt(0)}
                        </div>
                        <span className="text-sm font-medium">{cliente.nome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{cliente.cnpj}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{cliente.cidade || "Não informado"}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{cliente.responsavel || "Não informado"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(cliente)} className="p-2 text-muted-foreground hover:text-white hover:bg-white/5 rounded-lg"><Edit2 size={16} /></button>
                        <button onClick={() => onDelete(cliente.id)} className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
