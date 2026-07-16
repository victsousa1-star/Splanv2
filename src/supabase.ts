import { createClient } from "@supabase/supabase-js";

let rawUrl = (import.meta.env.VITE_SUPABASE_URL || "").trim();
let rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();

// Sanitize URL:
// 1. Remove trailing slashes
// 2. Remove /rest/v1 or /rest/v1/ if they were copied from the dashboard
if (rawUrl) {
  // Remove trailing slashes
  rawUrl = rawUrl.replace(/\/+$/, "");
  // Remove /rest/v1 if present at the end
  if (rawUrl.endsWith("/rest/v1")) {
    rawUrl = rawUrl.substring(0, rawUrl.length - 8);
  }
  // Trim any remaining trailing slashes
  rawUrl = rawUrl.replace(/\/+$/, "");
}

// Auto-prefix protocol if it looks like a domain and missing it
if (
  rawUrl &&
  !rawUrl.startsWith("http://") &&
  !rawUrl.startsWith("https://") &&
  rawUrl !== "undefined" &&
  rawUrl !== "null"
) {
  if (rawUrl.includes(".") && !rawUrl.includes(" ")) {
    rawUrl = "https://" + rawUrl;
  }
}

const isValidSupabaseConfig = (url: string, key: string): boolean => {
  if (!url || !key) return false;
  
  const u = url.trim().toLowerCase();
  const k = key.trim().toLowerCase();
  
  if (u === "" || u === "undefined" || u === "null" || u.startsWith("https://undefined") || u.startsWith("https://null")) return false;
  if (k === "" || k === "undefined" || k === "null") return false;
  
  if (
    u.includes("placeholder") || 
    u.includes("your") || 
    u.includes("sua") || 
    u.includes("url") || 
    u.includes("chave") || 
    u.includes("inserir") ||
    u.includes("sua-url")
  ) return false;
  
  if (
    k.includes("placeholder") || 
    k.includes("your") || 
    k.includes("sua") || 
    k.includes("url") || 
    k.includes("chave") || 
    k.includes("inserir") ||
    k.includes("sua-chave")
  ) return false;
  
  // Must be a valid absolute URL starting with http:// or https://
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return false;
  }
  
  return true;
};

export const supabase = isValidSupabaseConfig(rawUrl, rawKey)
  ? createClient(rawUrl, rawKey)
  : null;

