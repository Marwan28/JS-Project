import { createClient } from "https://esm.sh/@supabase/supabase-js";
export const supabaseUrl = "https://ujichqxxfsbgdjorkolz.supabase.co";
export const supabaseKey = "sb_publishable_vs3dcyNAq9MoeQH77xkVuA_fGdHPIq6";
export const supabase = createClient(supabaseUrl, supabaseKey);
export const headers = {
  apikey: supabaseKey,
  Authorization: "Bearer " + supabaseKey,
  "Content-Type": "application/json",
};
