import React, { useState } from "react";
import { motion } from "motion/react";
import { AlertCircle, HardHat, Lock, Mail } from "lucide-react";
import {
  auth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "../firebase-compat";
import { AppConfig } from "../types";
import { cn } from "../lib/utils";

export function LoginScreen({ appConfig }: { appConfig?: AppConfig }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const resetFeedback = () => {
    setError("");
    setMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage("Conta criada com sucesso!");
      }
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError('Este e-mail ja esta cadastrado. Clique em "Entrar".');
      } else if (err.code === "auth/invalid-credential") {
        setError("E-mail ou senha incorretos.");
      } else {
        setError(err.message);
      }
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Informe seu e-mail para redefinir a senha.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("E-mail de redefinicao enviado. Verifique sua caixa de entrada.");
      setError("");
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("E-mail nao encontrado. Confira o endereco informado.");
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="login-card w-full max-w-[440px] relative overflow-hidden"
      >
        <div className="absolute left-0 top-0 h-1 w-full bg-[#123f35]" />

        <div className="flex flex-col items-center mb-7">
          <div
            className={cn(
              "login-logo-wrap mb-4 flex items-center justify-center",
              appConfig?.logoUrl ? "bg-transparent" : "bg-[#123f35] text-white",
            )}
          >
            {appConfig?.logoUrl ? (
              <img src={appConfig.logoUrl} alt="Logo" className="login-logo-img" />
            ) : (
              <HardHat className="h-9 w-9" />
            )}
          </div>

          <h2 className="font-display text-[2rem] leading-none font-black tracking-tight text-white mb-2">
            {appConfig?.name || "SPlan"}
          </h2>
          <p className="text-sm font-semibold tracking-wide text-slate-400">
            Gestao Inteligente de Obras
          </p>
        </div>

        <div className="login-segmented flex mb-6 p-1.5">
          <button
            type="button"
            className={cn(
              "flex-1 rounded-xl py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-300",
              isLogin
                ? "bg-[#123f35] text-white shadow-md shadow-emerald-950/10"
                : "text-slate-500 hover:text-slate-300",
            )}
            onClick={() => {
              setIsLogin(true);
              resetFeedback();
            }}
          >
            Entrar
          </button>
          <button
            type="button"
            className={cn(
              "flex-1 rounded-xl py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-300",
              !isLogin
                ? "bg-[#123f35] text-white shadow-md shadow-emerald-950/10"
                : "text-slate-500 hover:text-slate-300",
            )}
            onClick={() => {
              setIsLogin(false);
              resetFeedback();
            }}
          >
            Criar Conta
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs font-semibold text-red-400"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs font-semibold text-emerald-400"
          >
            {message}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block px-0.5 text-xs font-bold text-slate-400">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="premium-input pl-11"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-0.5">
              <label className="text-xs font-bold text-slate-400">Senha</label>
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-xs font-bold text-[#123f35] transition-opacity hover:opacity-75"
              >
                Esqueci a senha
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="premium-input pl-11"
                placeholder="********"
              />
            </div>
          </div>

          <button
            type="submit"
            className="login-submit mt-2 w-full py-3.5 text-sm font-black uppercase tracking-wider"
          >
            {isLogin ? "Entrar Agora" : "Comecar Gratuitamente"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
