"use client";

import React, { useState } from "react";
import { Plus, Trash2, Edit2, Check, X, Loader2 } from "lucide-react";
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
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-200">
                <th className="px-6 py-5">Equipamento</th>
                <th className="px-6 py-5 text-center">Quant.</th>
                <th className="px-6 py-5 text-center">Potência (W)</th>
                <th className="px-6 py-5 text-center">Horas/Dia</th>
                <th className="px-6 py-5 text-center">Dias/Mês</th>
                <th className="px-6 py-5 text-center text-primary">kWh/Mês</th>
                <th className="px-6 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Cadastro Row */}
              <tr className="bg-emerald-50/50 group transition-all">
                <td className="px-6 py-5">
                  <input 
                    type="text" 
                    placeholder="Descrição do equipamento..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    value={newItem.descricao}
                    onChange={e => setNewItem({...newItem, descricao: e.target.value})}
                  />
                </td>
                <td className="px-6 py-5 text-center">
                  <input 
                    type="number" 
                    className="w-20 mx-auto bg-white border border-slate-200 rounded-xl px-2 py-2.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={newItem.quantidade}
                    onChange={e => setNewItem({...newItem, quantidade: parseInt(e.target.value) || 0})}
                  />
                </td>
                <td className="px-6 py-5 text-center">
                  <input 
                    type="number" 
                    className="w-24 mx-auto bg-white border border-slate-200 rounded-xl px-2 py-2.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={newItem.potenciaWatts}
                    onChange={e => setNewItem({...newItem, potenciaWatts: parseFloat(e.target.value) || 0})}
                  />
                </td>
                <td className="px-6 py-5 text-center">
                  <input 
                    type="number" 
                    step="0.5"
                    className="w-20 mx-auto bg-white border border-slate-200 rounded-xl px-2 py-2.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={newItem.horasDia}
                    onChange={e => setNewItem({...newItem, horasDia: parseFloat(e.target.value) || 0})}
                  />
                </td>
                <td className="px-6 py-5 text-center">
                  <input 
                    type="number" 
                    className="w-20 mx-auto bg-white border border-slate-200 rounded-xl px-2 py-2.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={newItem.diasMes}
                    onChange={e => setNewItem({...newItem, diasMes: parseInt(e.target.value) || 0})}
                  />
                </td>
                <td className="px-6 py-5 text-center font-black text-primary text-sm">
                  {calculateKwh(newItem).toFixed(2)}
                </td>
                <td className="px-6 py-5 text-right">
                  <button 
                    onClick={handleAdd}
                    disabled={isAdding || !newItem.descricao}
                    className="p-3 bg-primary text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {isAdding ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                  </button>
                </td>
              </tr>

              {/* Listagem */}
              {equipamentos.map((item) => (
                <tr key={item.id} className={cn("hover:bg-slate-50 transition-colors group", editingId === item.id && "bg-slate-50/80")}>
                  {editingId === item.id ? (
                    <>
                      <td className="px-6 py-5">
                        <input 
                          type="text" 
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary/20"
                          value={editItem.descricao || ""}
                          onChange={e => setEditItem({...editItem, descricao: e.target.value})}
                        />
                      </td>
                      <td className="px-6 py-5 text-center">
                        <input 
                          type="number" 
                          className="w-16 mx-auto bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-center"
                          value={editItem.quantidade}
                          onChange={e => setEditItem({...editItem, quantidade: parseInt(e.target.value) || 0})}
                        />
                      </td>
                      <td className="px-6 py-5 text-center">
                        <input 
                          type="number" 
                          className="w-24 mx-auto bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-center"
                          value={editItem.potenciaWatts}
                          onChange={e => setEditItem({...editItem, potenciaWatts: parseFloat(e.target.value) || 0})}
                        />
                      </td>
                      <td className="px-6 py-5 text-center">
                        <input 
                          type="number" 
                          step="0.5"
                          className="w-20 mx-auto bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-center"
                          value={editItem.horasDia}
                          onChange={e => setEditItem({...editItem, horasDia: parseFloat(e.target.value) || 0})}
                        />
                      </td>
                      <td className="px-6 py-5 text-center">
                        <input 
                          type="number" 
                          className="w-20 mx-auto bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-center"
                          value={editItem.diasMes}
                          onChange={e => setEditItem({...editItem, diasMes: parseInt(e.target.value) || 0})}
                        />
                      </td>
                      <td className="px-6 py-5 text-center font-black text-primary text-sm">
                        {calculateKwh(editItem).toFixed(2)}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={saveEdit} title="Salvar" className="p-2 bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg transition-all"><Check size={16} /></button>
                          <button onClick={cancelEdit} title="Cancelar" className="p-2 bg-slate-200 text-slate-600 hover:bg-slate-300 rounded-lg transition-all"><X size={16} /></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-5 text-sm font-bold text-slate-900">{item.descricao}</td>
                      <td className="px-6 py-5 text-center text-sm text-slate-600 font-medium">{item.quantidade}</td>
                      <td className="px-6 py-5 text-center text-sm text-slate-600 font-medium">{item.potenciaWatts.toString()}</td>
                      <td className="px-6 py-5 text-center text-sm text-slate-600 font-medium">{item.horasDia.toString()}</td>
                      <td className="px-6 py-5 text-center text-sm text-slate-600 font-medium">{item.diasMes}</td>
                      <td className="px-6 py-5 text-center text-sm font-black text-primary">
                        {Number(item.consumoMensalKwh).toFixed(2)}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit(item)} title="Editar" className="p-2 bg-slate-100 text-slate-400 hover:bg-primary hover:text-white rounded-lg transition-all"><Edit2 size={16} /></button>
                          <button onClick={() => onDelete(item.id)} title="Excluir" className="p-2 bg-slate-100 text-slate-400 hover:bg-rose-500 hover:text-white rounded-lg transition-all"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}

              {equipamentos.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">
                    Nenhum equipamento cadastrado. Comece adicionando um acima.
                  </td>
                </tr>
              )}
            </tbody>
            {equipamentos.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50/50 border-t border-slate-200 font-bold">
                  <td colSpan={5} className="px-6 py-6 text-right text-slate-400 uppercase text-[10px] tracking-widest">Consumo Total Estimado:</td>
                  <td className="px-6 py-6 text-center text-2xl text-primary font-black">{totalKwh.toFixed(2)} <span className="text-xs">kWh/Mês</span></td>
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
