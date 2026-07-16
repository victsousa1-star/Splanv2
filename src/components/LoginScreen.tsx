import React, { useState } from "react";
import { motion } from "motion/react";
import { HardHat, AlertCircle } from "lucide-react";
import { 
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail 
} from "../firebase-compat";
import { AppConfig } from "../types";
import { cn } from "../lib/utils";

export function LoginScreen({ appConfig }: { appConfig?: AppConfig }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage("Conta criada com sucesso!");
      }
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError(
          'Este e-mail já está cadastrado. Por favor, clique em "Entrar".',
        );
      } else if (err.code === "auth/invalid-credential") {
        setError("E-mail ou senha incorretos.");
      } else {
        setError(err.message);
      }
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Por favor, insira seu e-mail para redefinir a senha.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(
        "E-mail de redefinição de senha enviado! Verifique sua caixa de entrada.",
      );
      setError("");
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("E-mail não encontrado. Verifique se o e-mail está correto.");
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-slate-800/80 shadow-2xl p-8 md:p-10 w-full max-w-md relative overflow-hidden card-shadow"
      >
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500" />

        <div className="flex flex-col items-center mb-8">
          <div className={cn(
            "mb-6 flex items-center justify-center transition-transform hover:scale-[1.03]",
            appConfig?.logoUrl 
              ? "max-w-[180px] max-h-[70px]" 
              : "bg-gradient-to-br from-blue-600 to-indigo-600 p-5 rounded-2xl shadow-lg shadow-blue-500/15 w-24 h-24"
          )}>
            {appConfig?.logoUrl ? (
              <img
                src={appConfig.logoUrl}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <HardHat className="w-12 h-12 text-white" />
            )}
          </div>
          <h2 className="text-3xl font-bold text-white font-display tracking-tight mb-1">
            {appConfig?.name || "SPlan"}
          </h2>
          <p className="text-slate-400 text-sm font-medium tracking-wide">
            Gestão Inteligente de Obras
          </p>
        </div>

        <div className="flex mb-6 bg-slate-950/40 p-1.5 rounded-2xl border border-slate-800/40">
          <button
            type="button"
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 ${isLogin ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" : "text-slate-500 hover:text-slate-300"}`}
            onClick={() => {
              setIsLogin(true);
              setError("");
              setMessage("");
            }}
          >
            Entrar
          </button>
          <button
            type="button"
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 ${!isLogin ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" : "text-slate-500 hover:text-slate-300"}`}
            onClick={() => {
              setIsLogin(false);
              setError("");
              setMessage("");
            }}
          >
            Criar Conta
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/10 text-red-400 text-xs p-3.5 rounded-xl mb-6 border border-red-500/20 font-medium flex items-center gap-3"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-500/10 text-emerald-400 text-xs p-3.5 rounded-xl mb-6 border border-emerald-500/20 font-medium flex items-center gap-3"
          >
            <span>{message}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-0.5">
              <label className="text-xs font-semibold text-slate-400">
                E-mail
              </label>
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="premium-input"
              placeholder="seu@email.com"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-0.5">
              <label className="text-xs font-semibold text-slate-400">
                Senha
              </label>
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Esqueci a senha
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="premium-input"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full btn-primary py-3.5 text-sm font-bold uppercase tracking-wider mt-2"
          >
            {isLogin ? "Entrar Agora" : "Começar Gratuitamente"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
