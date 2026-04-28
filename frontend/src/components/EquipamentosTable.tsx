"use client";

import React, { useState } from "react";
import { Plus, Trash2, Edit2, Check, X, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface Equipamento {
  id: string;
  descricao: string;
  quantidade: number;
  potenciaWatts: number | string;
  horasDia: number | string;
  diasMes: number;
  consumoMensalKwh: number | string;
}

interface EquipamentosTableProps {
  equipamentos: Equipamento[];
  onAdd: (item: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, item: any) => Promise<void>;
  loading: boolean;
}

export function EquipamentosTable({ equipamentos, onAdd, onDelete, onUpdate, loading }: EquipamentosTableProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<any>(null);

  const [newItem, setNewItem] = useState({
    descricao: "",
    quantidade: 1,
    potenciaWatts: 0,
    horasDia: 0,
    diasMes: 22
  });

  const calculateKwh = (item: any) => {
    return (Number(item.potenciaWatts) * Number(item.horasDia) * Number(item.diasMes) * Number(item.quantidade)) / 1000;
  };

  const handleAdd = async () => {
    if (!newItem.descricao || newItem.potenciaWatts <= 0) return;
    setIsAdding(true);
    await onAdd(newItem);
    setNewItem({ descricao: "", quantidade: 1, potenciaWatts: 0, horasDia: 0, diasMes: 22 });
    setIsAdding(false);
  };

  const startEdit = (item: Equipamento) => {
    setEditingId(item.id);
    setEditItem({ ...item });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditItem(null);
  };

  const saveEdit = async () => {
    if (editingId && editItem) {
      await onUpdate(editingId, editItem);
      setEditingId(null);
      setEditItem(null);
    }
  };

  const totalKwh = equipamentos.reduce((acc, curr) => acc + Number(curr.consumoMensalKwh), 0);

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-3xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-muted-foreground text-[11px] uppercase tracking-widest border-b border-white/5">
                <th className="px-6 py-4 font-semibold">Equipamento</th>
                <th className="px-6 py-4 font-semibold text-center">Quant.</th>
                <th className="px-6 py-4 font-semibold text-center">Potência (W)</th>
                <th className="px-6 py-4 font-semibold text-center">Horas/Dia</th>
                <th className="px-6 py-4 font-semibold text-center">Dias/Mês</th>
                <th className="px-6 py-4 font-semibold text-center text-primary">kWh/Mês</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {/* Cadastro Row */}
              <tr className="bg-primary/10 group transition-all">
                <td className="px-6 py-4">
                  <input 
                    type="text" 
                    placeholder="Descrição do equipamento..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={newItem.descricao}
                    onChange={e => setNewItem({...newItem, descricao: e.target.value})}
                  />
                </td>
                <td className="px-6 py-4 text-center">
                  <input 
                    type="number" 
                    className="w-20 mx-auto bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-sm text-center focus:outline-none"
                    value={newItem.quantidade}
                    onChange={e => setNewItem({...newItem, quantidade: parseInt(e.target.value) || 0})}
                  />
                </td>
                <td className="px-6 py-4 text-center">
                  <input 
                    type="number" 
                    className="w-24 mx-auto bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-sm text-center focus:outline-none"
                    value={newItem.potenciaWatts}
                    onChange={e => setNewItem({...newItem, potenciaWatts: parseFloat(e.target.value) || 0})}
                  />
                </td>
                <td className="px-6 py-4 text-center">
                  <input 
                    type="number" 
                    step="0.5"
                    className="w-20 mx-auto bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-sm text-center focus:outline-none"
                    value={newItem.horasDia}
                    onChange={e => setNewItem({...newItem, horasDia: parseFloat(e.target.value) || 0})}
                  />
                </td>
                <td className="px-6 py-4 text-center">
                  <input 
                    type="number" 
                    className="w-20 mx-auto bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-sm text-center focus:outline-none"
                    value={newItem.diasMes}
                    onChange={e => setNewItem({...newItem, diasMes: parseInt(e.target.value) || 0})}
                  />
                </td>
                <td className="px-6 py-4 text-center font-bold text-primary text-sm">
                  {calculateKwh(newItem).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={handleAdd}
                    disabled={isAdding || !newItem.descricao}
                    className="p-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {isAdding ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                  </button>
                </td>
              </tr>

              {/* Listagem */}
              {equipamentos.map((item) => (
                <tr key={item.id} className={cn("hover:bg-white/[0.02] transition-colors group", editingId === item.id && "bg-white/5")}>
                  {editingId === item.id ? (
                    <>
                      <td className="px-6 py-4">
                        <input 
                          type="text" 
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-primary"
                          value={editItem.descricao}
                          onChange={e => setEditItem({...editItem, descricao: e.target.value})}
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input 
                          type="number" 
                          className="w-16 mx-auto bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-sm text-center"
                          value={editItem.quantidade}
                          onChange={e => setEditItem({...editItem, quantidade: parseInt(e.target.value) || 0})}
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input 
                          type="number" 
                          className="w-24 mx-auto bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-sm text-center"
                          value={editItem.potenciaWatts}
                          onChange={e => setEditItem({...editItem, potenciaWatts: parseFloat(e.target.value) || 0})}
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input 
                          type="number" 
                          step="0.5"
                          className="w-20 mx-auto bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-sm text-center"
                          value={editItem.horasDia}
                          onChange={e => setEditItem({...editItem, horasDia: parseFloat(e.target.value) || 0})}
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input 
                          type="number" 
                          className="w-20 mx-auto bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-sm text-center"
                          value={editItem.diasMes}
                          onChange={e => setEditItem({...editItem, diasMes: parseInt(e.target.value) || 0})}
                        />
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-indigo-400 text-sm">
                        {calculateKwh(editItem).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={saveEdit} title="Salvar" className="p-2 bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg transition-all"><Check size={16} /></button>
                          <button onClick={cancelEdit} title="Cancelar" className="p-2 bg-white/10 text-white hover:bg-white/20 rounded-lg transition-all"><X size={16} /></button>
                          <button onClick={() => onDelete(item.id)} title="Excluir" className="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 text-sm font-medium">{item.descricao}</td>
                      <td className="px-6 py-4 text-center text-sm">{item.quantidade}</td>
                      <td className="px-6 py-4 text-center text-sm">{item.potenciaWatts.toString()}</td>
                      <td className="px-6 py-4 text-center text-sm">{item.horasDia.toString()}</td>
                      <td className="px-6 py-4 text-center text-sm">{item.diasMes}</td>
                      <td className="px-6 py-4 text-center text-sm font-bold text-indigo-400">
                        {Number(item.consumoMensalKwh).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit(item)} title="Editar" className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-all"><Edit2 size={16} /></button>
                          <button onClick={() => onDelete(item.id)} title="Excluir" className="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}

              {equipamentos.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground italic">
                    Nenhum equipamento cadastrado. Comece adicionando um acima.
                  </td>
                </tr>
              )}
            </tbody>
            {equipamentos.length > 0 && (
              <tfoot>
                <tr className="bg-white/5 border-t border-white/10 font-bold">
                  <td colSpan={5} className="px-6 py-5 text-right text-muted-foreground uppercase text-[10px] tracking-widest">Consumo Total Estimado:</td>
                  <td className="px-6 py-5 text-center text-xl text-primary font-black">{totalKwh.toFixed(2)} <span className="text-xs">kWh/Mês</span></td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
