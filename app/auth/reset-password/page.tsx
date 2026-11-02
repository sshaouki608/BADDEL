"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("جارٍ التحقق من رابط الاستعادة...");

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      setReady(Boolean(data.session) && !error);
      setMessage(error ? error.message : data.session ? "أدخل كلمة المرور الجديدة." : "رابط الاستعادة غير صالح أو انتهت صلاحيته. اطلب رابطًا جديدًا.");
    });
    return () => { active = false; };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const { error } = await supabase.auth.updateUser({ password });
    setMessage(error ? error.message : "تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.");
    setBusy(false);
    if (!error) setReady(false);
  }

  return (
    <main dir="rtl" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f4f8f5", color: "#173b2d", fontFamily: "Arial, sans-serif" }}>
      <section style={{ width: "100%", maxWidth: 460, padding: 28, background: "white", borderRadius: 20, boxShadow: "0 12px 40px rgba(0,0,0,.07)" }}>
        <h1 style={{ fontSize: 26 }}>تعيين كلمة مرور جديدة</h1>
        <p style={{ lineHeight: 1.8, color: "#66756c" }}>اختر كلمة مرور جديدة لحساب BADDEL.</p>
        {ready && <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
          <label style={{ display: "grid", gap: 7 }}>كلمة المرور الجديدة
            <input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6 أحرف على الأقل" dir="ltr" style={{ width: "100%", boxSizing: "border-box", border: "1px solid #d9e4dc", borderRadius: 10, padding: 13, fontSize: 16 }} />
          </label>
          <button disabled={busy} type="submit" style={{ border: 0, borderRadius: 10, padding: 14, background: "#16834b", color: "white", fontWeight: 700 }}>{busy ? "جارٍ الحفظ..." : "حفظ كلمة المرور الجديدة"}</button>
        </form>}
        <p role="status" style={{ marginTop: 18, padding: 12, borderRadius: 10, background: "#edf7f0", lineHeight: 1.7, overflowWrap: "anywhere" }}>{message}</p>
        <a href="/account" style={{ display: "inline-block", marginTop: 12, color: "#16834b" }}>الذهاب إلى تسجيل الدخول</a>
      </section>
    </main>
  );
}
