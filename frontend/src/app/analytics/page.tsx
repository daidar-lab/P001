"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Shield, 
  User, 
  Loader2, 
  AlertCircle,
  Search,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Usuario {
  id: string;
  username: string;
  nome: string;
  cargo: "ADMIN" | "USER";
  criadoEm: string;
}

export default function AnalyticsPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { token, user: currentUser } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    nome: "",
    username: "",
    password: "",
    cargo: "USER" as "ADMIN" | "USER"
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchUsuarios = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/usuarios", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setUsuarios(data.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsuarios();
  }, [token]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("http://localhost:3001/api/usuarios", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setFormData({ nome: "", username: "", password: "", cargo: "USER" });
        fetchUsuarios();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor");
    }
    setSaving(false);
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;
    try {
      const res = await fetch(`http://localhost:3001/api/usuarios/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) fetchUsuarios();
      else alert(data.message);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsuarios = usuarios.filter(u => 
    u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute role="ADMIN">
      <main className="min-h-screen p-6 md:p-12 pb-32">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1 text-slate-900">Gestão de Equipe</h1>
            <p className="text-slate-500 text-sm font-medium">Controle de acessos e permissões da plataforma.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative group flex-1 md:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por nome ou usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-w-[280px] shadow-sm"
              />
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-xl shadow-primary/20 transition-all active:scale-95 shrink-0"
            >
              <UserPlus size={20} />
              Novo Usuário
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-primary" size={40} />
              <p className="text-slate-400 font-medium">Carregando usuários...</p>
            </div>
          ) : filteredUsuarios.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4 border-2 border-dashed border-slate-200 rounded-[40px] bg-white shadow-sm">
              <div className="p-6 bg-slate-50 rounded-full">
                <Search size={48} className="text-slate-200" />
              </div>
              <p className="text-slate-400 font-medium">Nenhum usuário encontrado com "{searchTerm}"</p>
            </div>
          ) : filteredUsuarios.map((u) => (
            <div key={u.id} className="bg-white rounded-[2rem] p-6 border border-slate-200 hover:border-primary/30 transition-all group relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                {u.id !== currentUser?.id && (
                  <button 
                    onClick={() => handleDeleteUser(u.id)}
                    className="p-2.5 bg-rose-50 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-primary border border-slate-100 shadow-inner">
                  <User size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight text-slate-900">{u.nome}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">@{u.username}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5",
                  u.cargo === "ADMIN" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                )}>
                  <Shield size={10} />
                  {u.cargo}
                </div>
                <span className="text-[10px] text-slate-400 font-bold italic">
                  Desde {new Date(u.criadoEm).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>
          ))}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            
            <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 border border-slate-200 shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 rounded-full transition-colors"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary border border-emerald-100 shadow-inner">
                  <UserPlus size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Cadastrar Usuário</h2>
                <p className="text-sm text-slate-500 font-medium">Defina o acesso do novo colaborador.</p>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-6">
                {error && (
                  <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center gap-3 text-rose-600 text-xs font-bold animate-in shake-1">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={formData.nome || ""}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 transition-all"
                    placeholder="Ex: João Silva"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Usuário / Login</label>
                  <input
                    type="text"
                    required
                    value={formData.username || ""}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 transition-all"
                    placeholder="ex: joao.silva"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Senha Inicial</label>
                  <input
                    type="password"
                    required
                    value={formData.password || ""}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 transition-all"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Cargo / Permissão</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, cargo: "USER"})}
                      className={cn(
                        "py-3.5 rounded-2xl text-xs font-black border transition-all",
                        formData.cargo === "USER" 
                          ? "bg-slate-900 border-slate-900 text-white shadow-lg" 
                          : "bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      USER
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, cargo: "ADMIN"})}
                      className={cn(
                        "py-3.5 rounded-2xl text-xs font-black border transition-all",
                        formData.cargo === "ADMIN" 
                          ? "bg-primary border-emerald-600 text-white shadow-lg shadow-primary/20" 
                          : "bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      ADMIN
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-primary hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl mt-4 shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {saving ? <Loader2 className="animate-spin" size={20} /> : "Criar Usuário"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
