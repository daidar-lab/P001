"use client";

import React, { useState, useEffect } from "react";
import { X, Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [clientes, setClientes] = useState<any[]>([]);
  const [selectedCliente, setSelectedCliente] = useState("");
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    if (isOpen && token) {
      fetch("http://localhost:3001/api/clientes", {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setClientes(data.data || []))
        .catch(err => console.error("Erro ao carregar clientes", err));
    }
  }, [isOpen, token]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedCliente || !token) return;

    setUploading(true);
    setStatus("idle");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("clienteId", selectedCliente);
    formData.append("uploadedBy", "Gestor");

    try {
      const res = await fetch("http://localhost:3001/api/relatorios/upload", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setTimeout(() => {
          onSuccess();
          onClose();
          reset();
        }, 2000);
      } else {
        setStatus("error");
        setErrorMessage(data.message || "Erro no processamento do CSV");
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage("Erro de conexão com o servidor");
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setSelectedCliente("");
    setStatus("idle");
    setUploading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full transition-all"
        >
          <X size={24} />
        </button>

        <div className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Novo Relatório</h2>
          <p className="text-slate-500 font-medium">Faça o upload do CSV da fatura para iniciar o pipeline.</p>
        </div>

        <div className="space-y-8">
          {/* Cliente Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-1">Selecionar Cliente</label>
            <div className="relative group">
              <select 
                value={selectedCliente}
                onChange={(e) => setSelectedCliente(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none text-slate-900 font-bold transition-all"
              >
                <option value="">Selecione um cliente...</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id} className="text-slate-900">{c.nome}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dropzone */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-1">Arquivo CSV</label>
            <label 
              className={cn(
                "group relative border-2 border-dashed border-slate-200 rounded-[2rem] p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all hover:border-primary/50 hover:bg-emerald-50/50",
                file && "border-primary/50 bg-emerald-50"
              )}
            >
              <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
              
              {file ? (
                <>
                  <div className="p-4 bg-primary rounded-2xl text-white shadow-lg shadow-primary/20">
                    <FileText size={32} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-900">{file.name}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-slate-100 rounded-2xl text-slate-400 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                    <Upload size={32} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-900">Clique ou arraste o arquivo</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Apenas arquivos .csv são aceitos</p>
                  </div>
                </>
              )}
            </label>
          </div>

          {/* Action Button */}
          <button
            onClick={handleUpload}
            disabled={!file || !selectedCliente || uploading}
            className="w-full bg-primary hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4.5 rounded-2xl font-bold transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95"
          >
            {uploading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Processando Pipeline...
              </>
            ) : status === "success" ? (
              <>
                <CheckCircle2 size={20} />
                Sucesso!
              </>
            ) : (
              "Iniciar Processamento"
            )}
          </button>

          {status === "error" && (
            <div className="flex items-center gap-3 text-rose-600 text-xs bg-rose-50 p-4 rounded-2xl border border-rose-100 font-bold animate-in shake-1">
              <AlertCircle size={18} className="shrink-0" />
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
