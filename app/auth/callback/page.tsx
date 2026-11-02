"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const [message, setMessage] = useState("جارٍ التحقق من رابط البريد الإلكتروني...");

  useEffect(() => {
    async function completeConfirmation() {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        setMessage(error ? `تعذر تأكيد البريد: ${error.message}` : "تم تأكيد البريد الإلكتروني بنجاح. يمكنك الآن تسجيل الدخول.");
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setMessage(`تعذر تأكيد البريد: ${error.message}`);
      } else if (data.session) {
        setMessage("تم تأكيد البريد الإلكتروني بنجاح. يمكنك الآن تسجيل الدخول.");
      } else {
        const description = url.hash.match(/error_description=([^&]+)/)?.[1];
        setMessage(description ? decodeURIComponent(description.replace(/\+/g, " ")) : "رابط التأكيد غير صالح أو انتهت صلاحيته. اطلب رسالة تأكيد جديدة.");
      }
    }
    completeConfirmation();
  }, []);

  return (
    <main dir="rtl" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f4f8f5", color: "#173b2d", fontFamily: "Arial, sans-serif" }}>
      <section style={{ maxWidth: 480, padding: 28, background: "white", borderRadius: 18, textAlign: "center", lineHeight: 1.9 }}>
        <h1>تأكيد حساب BADDEL</h1>
        <p>{message}</p>
        <a href="/account" style={{ display: "inline-block", marginTop: 12, color: "white", background: "#16834b", padding: "11px 20px", borderRadius: 10, textDecoration: "none" }}>الذهاب إلى تسجيل الدخول</a>
      </section>
    </main>
  );
}
