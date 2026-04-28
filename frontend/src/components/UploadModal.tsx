"use client";

import React, { useState, useEffect } from "react";
import { X, Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

  useEffect(() => {
    if (isOpen) {
      fetch("http://localhost:3001/api/clientes")
        .then(res => res.json())
        .then(data => setClientes(data.data || []))
        .catch(err => console.error("Erro ao carregar clientes", err));
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedCliente) return;

    setUploading(true);
    setStatus("idle");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("clienteId", selectedCliente);
    formData.append("uploadedBy", "Gestor");

    try {
      const res = await fetch("http://localhost:3001/api/relatorios/upload", {
        method: "POST",
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg glass-card rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-all text-muted-foreground hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-2">Novo Relatório</h2>
        <p className="text-muted-foreground text-sm mb-8">Faça o upload do CSV da fatura para iniciar o pipeline.</p>

        <div className="space-y-6">
          {/* Cliente Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-primary">Selecionar Cliente</label>
            <select 
              value={selectedCliente}
              onChange={(e) => setSelectedCliente(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
            >
              <option value="" className="bg-[#12121a]">Selecione um cliente...</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id} className="bg-[#12121a]">{c.nome}</option>
              ))}
            </select>
          </div>

          {/* Dropzone */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-primary">Arquivo CSV</label>
            <label 
              className={cn(
                "group relative border-2 border-dashed border-white/10 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all hover:border-primary/50 hover:bg-primary/5",
                file && "border-primary/50 bg-primary/5"
              )}
            >
              <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
              
              {file ? (
                <>
                  <div className="p-4 bg-primary/20 rounded-2xl text-primary">
                    <FileText size={32} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-white/5 rounded-2xl text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all">
                    <Upload size={32} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold">Clique ou arraste o arquivo</p>
                    <p className="text-[10px] text-muted-foreground">Apenas arquivos .csv são aceitos</p>
                  </div>
                </>
              )}
            </label>
          </div>

          {/* Action Button */}
          <button
            onClick={handleUpload}
            disabled={!file || !selectedCliente || uploading}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
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
            <div className="flex items-center gap-2 text-rose-500 text-xs bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
              <AlertCircle size={16} />
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
