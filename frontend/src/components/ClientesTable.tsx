"use client";

import React, { useState } from "react";
import { Plus, Trash2, Edit2, Check, X, Loader2 } from "lucide-react";
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
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-200">
              <th className="px-6 py-5 font-bold">Cliente</th>
              <th className="px-4 py-5 font-bold">CNPJ</th>
              <th className="px-4 py-5 font-bold">Cidade</th>
              <th className="px-4 py-5 font-bold">Endereço</th>
              <th className="px-4 py-5 font-bold">Responsável</th>
              <th className="px-4 py-5 font-bold">E-mail Financeiro</th>
              <th className="px-6 py-5 font-bold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Cadastro Row */}
            <tr className="bg-emerald-50/30 group transition-all">
              <td className="px-4 py-4">
                <input 
                  type="text" placeholder="Nome"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={newItem.nome} onChange={e => setNewItem({...newItem, nome: e.target.value})}
                />
              </td>
              <td className="px-4 py-4">
                <input 
                  type="text" placeholder="CNPJ"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={newItem.cnpj} onChange={e => setNewItem({...newItem, cnpj: e.target.value})}
                />
              </td>
              <td className="px-4 py-4">
                <input 
                  type="text" placeholder="Cidade"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={newItem.cidade} onChange={e => setNewItem({...newItem, cidade: e.target.value})}
                />
              </td>
              <td className="px-4 py-4">
                <input 
                  type="text" placeholder="Endereço"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={newItem.endereco} onChange={e => setNewItem({...newItem, endereco: e.target.value})}
                />
              </td>
              <td className="px-4 py-4">
                <input 
                  type="text" placeholder="Responsável"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={newItem.responsavel} onChange={e => setNewItem({...newItem, responsavel: e.target.value})}
                />
              </td>
              <td className="px-4 py-4">
                <input 
                  type="email" placeholder="E-mail"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={newItem.emailFinanceiro || ""} onChange={e => setNewItem({...newItem, emailFinanceiro: e.target.value})}
                />
              </td>
              <td className="px-6 py-4 text-right">
                <button 
                  onClick={handleAdd} disabled={isAdding || !newItem.nome}
                  className="p-3 bg-primary text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {isAdding ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                </button>
              </td>
            </tr>

            {/* Listagem */}
            {clientes.map((cliente) => (
              <tr key={cliente.id} className={cn("hover:bg-slate-50 transition-colors group", editingId === cliente.id && "bg-slate-50")}>
                {editingId === cliente.id ? (
                  <>
                    <td className="px-4 py-4"><input className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900" value={editItem.nome || ""} onChange={e => setEditItem({...editItem, nome: e.target.value})} /></td>
                    <td className="px-4 py-4"><input className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900" value={editItem.cnpj || ""} onChange={e => setEditItem({...editItem, cnpj: e.target.value})} /></td>
                    <td className="px-4 py-4"><input className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900" value={editItem.cidade || ""} onChange={e => setEditItem({...editItem, cidade: e.target.value})} /></td>
                    <td className="px-4 py-4"><input className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900" value={editItem.endereco || ""} onChange={e => setEditItem({...editItem, endereco: e.target.value})} /></td>
                    <td className="px-4 py-4"><input className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900" value={editItem.responsavel || ""} onChange={e => setEditItem({...editItem, responsavel: e.target.value})} /></td>
                    <td className="px-4 py-4"><input className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900" value={editItem.emailFinanceiro || ""} onChange={e => setEditItem({...editItem, emailFinanceiro: e.target.value})} /></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={saveEdit} className="p-2 bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg transition-all"><Check size={14} /></button>
                        <button onClick={() => setEditingId(null)} className="p-2 bg-slate-200 text-slate-600 hover:bg-slate-300 rounded-lg transition-all"><X size={14} /></button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-4 text-xs font-bold text-slate-900">{cliente.nome}</td>
                    <td className="px-4 py-4 text-xs text-slate-500 font-mono font-medium">{cliente.cnpj}</td>
                    <td className="px-4 py-4 text-xs text-slate-500 font-medium">{cliente.cidade || "-"}</td>
                    <td className="px-4 py-4 text-xs text-slate-500 font-medium truncate max-w-[150px]" title={cliente.endereco}>{cliente.endereco || "-"}</td>
                    <td className="px-4 py-4 text-xs text-slate-500 font-medium">{cliente.responsavel || "-"}</td>
                    <td className="px-4 py-4 text-xs text-slate-500 font-medium truncate max-w-[150px]" title={cliente.emailFinanceiro}>{cliente.emailFinanceiro || "-"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(cliente)} className="p-2 bg-slate-100 text-slate-400 hover:bg-primary hover:text-white rounded-lg transition-all"><Edit2 size={14} /></button>
                        <button onClick={() => onDelete(cliente.id)} className="p-2 bg-slate-100 text-slate-400 hover:bg-rose-500 hover:text-white rounded-lg transition-all"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}

            {clientes.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">
                  Nenhum cliente cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
