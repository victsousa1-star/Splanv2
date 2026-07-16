import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { db, auth, updatePassword, doc, updateDoc } from '../firebase-compat';
import { toast } from 'sonner';
import { AppConfig } from '../types';
import { cn } from '../lib/utils';

interface PasswordResetScreenProps {
  user: {
    uid: string;
    email: string | null;
    name?: string;
  };
  onPasswordChanged: () => void;
  appConfig?: AppConfig;
}

export function PasswordResetScreen({ user, onPasswordChanged, appConfig }: PasswordResetScreenProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return "A senha deve ter pelo menos 8 caracteres.";
    if (!/[A-Z]/.test(pass)) return "A senha deve conter pelo menos uma letra maiúscula.";
    if (!/[a-z]/.test(pass)) return "A senha deve conter pelo menos uma letra minúscula.";
    if (!/[0-9]/.test(pass)) return "A senha deve conter pelo menos um número.";
    return null;
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validatePassword(newPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        
        // Update Firestore flag
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          needsPasswordReset: false
        });

        toast.success("Senha atualizada com sucesso!");
        onPasswordChanged();
      }
    } catch (err: any) {
      console.error("Error updating password:", err);
      if (err.code === 'auth/requires-recent-login') {
        setError("Para sua segurança, saia e entre novamente antes de trocar a senha.");
      } else {
        setError("Erro ao atualizar senha: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[130px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800/85 rounded-[2rem] p-8 md:p-10 relative z-10 card-shadow"
      >
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-600 to-indigo-600" />

        <div className="flex justify-center mb-8">
          <div className={cn(
            "flex items-center justify-center transition-transform hover:scale-[1.03]",
            appConfig?.logoUrl 
              ? "max-w-[180px] max-h-[70px]" 
              : "bg-gradient-to-br from-blue-600 to-indigo-600 p-5 rounded-2xl shadow-lg shadow-blue-500/15 w-24 h-24 text-white"
          )}>
            {appConfig?.logoUrl ? (
              <img src={appConfig.logoUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <ShieldCheck className="w-12 h-12" />
            )}
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white font-display tracking-tight mb-2">
            {appConfig?.name || "Segurança Obrigatória"}
          </h2>
          <p className="text-slate-400 text-sm font-medium leading-relaxed">
            Este é o seu primeiro acesso ou sua senha expirou. Crie uma nova credencial para continuar com segurança.
          </p>
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

        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400">Nova Senha</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="premium-input pl-11 pr-11"
                placeholder="Mínimo 8 caracteres"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400">Confirmar Nova Senha</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="premium-input pl-11"
                placeholder="Repita a nova senha"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            </div>
          </div>

          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/50 space-y-2">
             <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Requisitos de Segurança:</h4>
             <div className="flex items-center gap-2 text-xs font-medium">
               {newPassword.length >= 8 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Clock className="w-3.5 h-3.5 text-slate-600" />}
               <span className={newPassword.length >= 8 ? "text-emerald-400" : "text-slate-500"}>Mínimo 8 caracteres</span>
             </div>
             <div className="flex items-center gap-2 text-xs font-medium">
               {/[A-Z]/.test(newPassword) ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Clock className="w-3.5 h-3.5 text-slate-600" />}
               <span className={/[A-Z]/.test(newPassword) ? "text-emerald-400" : "text-slate-500"}>Uma letra maiúscula</span>
             </div>
             <div className="flex items-center gap-2 text-xs font-medium">
               {/[0-9]/.test(newPassword) ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Clock className="w-3.5 h-3.5 text-slate-600" />}
               <span className={/[0-9]/.test(newPassword) ? "text-emerald-400" : "text-slate-500"}>Pelo menos um número</span>
             </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-3.5 text-sm font-bold uppercase tracking-wider mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>Atualizar Senha <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
