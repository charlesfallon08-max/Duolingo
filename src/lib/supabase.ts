import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Client Supabase, ou null si la configuration est absente.
 * Sans configuration, le site fonctionne en mode local (localStorage)
 * et les boutons de connexion sont masqués.
 */
export const supabase = url && key ? createClient(url, key) : null;

export const accountsEnabled = supabase !== null;
