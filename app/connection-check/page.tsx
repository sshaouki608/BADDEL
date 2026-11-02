"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type CheckState =
  | { status: "checking"; message: string }
  | { status: "success"; message: string; count: number; categories: string[] }
  | { status: "error"; message: string };

export default function ConnectionCheckPage() {
  const [state, setState] = useState<CheckState>({
    status: "checking",
    message: "جارٍ اختبار الاتصال بقاعدة البيانات...",
  });

  useEffect(() => {
    let active = true;

    async function checkConnection() {
      const { data, error } = await supabase
        .from("categories")
        .select("name_ar")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!active) return;

      if (error) {
        setState({
          status: "error",
          message: error.message,
        });
        return;
      }

      setState({
        status: "success",
        message: "الاتصال بقاعدة بيانات Supabase يعمل بنجاح.",
        count: data.length,
        categories: data.map((item) => item.name_ar),
      });
    }

    checkConnection();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main style={{ minHeight: "100vh", padding: "40px 20px", background: "#f5f8f6", color: "#173b2d", fontFamily: "Arial, sans-serif" }}>
      <section style={{ maxWidth: 680, margin: "40px auto", padding: 28, borderRadius: 20, background: "#fff", boxShadow: "0 12px 40px rgba(0,0,0,.07)", textAlign: "right" }}>
        <p style={{ color: "#16834b", fontWeight: 700 }}>BADDEL · فحص الاتصال</p>
        <h1 style={{ fontSize: 28, marginBottom: 12 }}>اختبار قاعدة البيانات</h1>
        <p aria-live="polite">{state.message}</p>
        {state.status === "checking" && <p>يرجى الانتظار...</p>}
        {state.status === "success" && (
          <div>
            <p style={{ color: "#16834b", fontWeight: 700 }}>نجح الاتصال ✓</p>
            <p>عدد التصنيفات النشطة: {state.count}</p>
            <ul>{state.categories.map((name) => <li key={name}>{name}</li>)}</ul>
          </div>
        )}
        {state.status === "error" && (
          <div>
            <p style={{ color: "#b42318", fontWeight: 700 }}>تعذر الاتصال</p>
            <p dir="ltr" style={{ overflowWrap: "anywhere", background: "#fff4f2", padding: 12, borderRadius: 8 }}>{state.message}</p>
          </div>
        )}
        <a href="/" style={{ display: "inline-block", marginTop: 20, color: "#16834b", fontWeight: 700 }}>العودة إلى الصفحة الرئيسية</a>
      </section>
    </main>
  );
}
