import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "provider" | "user" | null;

export function useRole() {
  const [role, setRole] = useState<AppRole>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { if (active) { setRole(null); setLoading(false); } return; }
      if (active) setUserId(auth.user.id);
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", auth.user.id);
      if (!active) return;
      const roles = (data ?? []).map((r) => r.role as string);
      const picked: AppRole = roles.includes("admin") ? "admin" : roles.includes("provider") ? "provider" : roles.includes("user") ? "user" : null;
      setRole(picked);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  return { role, loading, userId };
}
