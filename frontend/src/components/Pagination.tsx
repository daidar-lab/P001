"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="p-6 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        Página <span className="text-slate-900">{currentPage}</span> de <span className="text-slate-900">{totalPages}</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-2.5 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 text-slate-600 transition-all shadow-sm"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-2.5 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 text-slate-600 transition-all shadow-sm"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
