import React, { useState } from "react";
import { motion } from "motion/react";
import { Trash2, Plus, ArrowLeft, Store, DollarSign, X } from "lucide-react";
import { Allowance } from "../types";
import { toast } from "sonner";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, db } from "../firebase-compat";
import { handleFirestoreError, OperationType } from "../firestoreError";

interface AllowanceViewProps {
  allowances: Allowance[];
  user: any;
  onBack: () => void;
  onSelectAllowance: (allowance: Allowance) => void;
}

export function AllowanceView({ allowances, user, onBack, onSelectAllowance }: AllowanceViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [value, setValue] = useState("");

  const handleAddAllowance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !value) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    try {
      const numericValue = parseFloat(value.replace(/\./g, "").replace(",", "."));
      if (isNaN(numericValue)) {
        toast.error("Valor inválido");
        return;
      }

      const newAllowance = {
        storeName,
        value: numericValue,
        ownerId: user.uid,
        createdAt: Date.now(),
      };

      await addDoc(collection(db, "allowances"), newAllowance);
      toast.success("Allowance adicionado com sucesso!");
      setShowAddModal(false);
      setStoreName("");
      setValue("");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "allowances");
      toast.error("Erro ao adicionar allowance");
    }
  };

  const handleDeleteAllowance = async (id: string) => {
    try {
      await deleteDoc(doc(db, "allowances", id));
      toast.success("Allowance removido com sucesso");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `allowances/${id}`);
      toast.error("Erro ao remover allowance");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
        <div className="flex items-center gap-3.5">
          <button
            onClick={onBack}
            className="p-2.5 text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800 rounded-xl transition-all hover:scale-105 active:scale-95 flex-shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white font-display tracking-tight">
              Allowance
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5 font-medium">
              Gestão de valores de subsídios de obra (allowance) pagos às lojas.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto btn-primary px-5 py-3 text-xs font-bold uppercase tracking-wider shadow-md"
        >
          <Plus className="w-4 h-4" />
          Novo Allowance
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {allowances.map((allowance) => (
          <motion.div
            key={allowance.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="airo-card p-6 flex flex-col justify-between cursor-pointer hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-300 group"
            onClick={() => onSelectAllowance(allowance)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600/10 p-3 rounded-xl text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-display leading-tight">{allowance.storeName}</h3>
                  <p className="text-xs text-slate-500 font-medium">Loja identificada</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteAllowance(allowance.id);
                }}
                className="text-slate-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="bg-slate-950/40 rounded-xl p-4 mt-2 border border-slate-800/40">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">
                <span>Valor de Allowance</span>
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <p className="text-xl font-bold text-white font-display">
                {allowance.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {allowances.length === 0 && (
        <div className="text-center py-16 bg-slate-900/10 rounded-2xl border border-dashed border-slate-800/80 max-w-xl mx-auto">
          <div className="bg-slate-850/60 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-5 h-5 text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Nenhum allowance registrado</h3>
          <p className="text-slate-500 text-xs max-w-xs mx-auto font-medium">
            Comece registrando o primeiro allowance de loja do seu projeto clicando em "Novo Allowance".
          </p>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-600 to-indigo-600" />
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white font-display">Novo Allowance</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-500 hover:text-white p-2 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAllowance} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Nome da Loja</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="premium-input"
                  placeholder="Ex: Farm, Vivara, etc."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Valor Pactuado (R$)</label>
                <input
                  type="text"
                  required
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="premium-input font-mono"
                  placeholder="0,00"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-800/80 text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-700/80 transition-colors rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary text-xs font-bold uppercase tracking-wider py-2.5 shadow-md"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
