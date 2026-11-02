"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AccountPage() {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [resetMode, setResetMode] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    if (resetMode) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      setMessage(error ? error.message : "إذا كان البريد مسجلًا، ستصلك رسالة لإعادة تعيين كلمة المرور. افحص صندوق الوارد والرسائل غير المرغوب فيها.");
    } else if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: name.trim() || "مستخدم جديد" }, emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      setMessage(
        error
          ? error.message
          : "تم إنشاء طلب الحساب. تفقد بريدك الإلكتروني واضغط رابط التأكيد قبل تسجيل الدخول."
      );
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setMessage(error ? error.message : "تم تسجيل الدخول بنجاح.");
    }

    setBusy(false);
  }

  return (
    <main dir="rtl" style={{ minHeight: "100vh", background: "#f4f8f5", padding: "32px 16px", color: "#173b2d", fontFamily: "Arial, sans-serif" }}>
      <section style={{ maxWidth: 460, margin: "32px auto", padding: 28, borderRadius: 20, background: "white", boxShadow: "0 12px 40px rgba(0,0,0,.07)" }}>
        <a href="/" style={{ color: "#16834b", textDecoration: "none", fontWeight: 700 }}>← العودة إلى BADDEL</a>
        <h1 style={{ fontSize: 28, margin: "24px 0 8px" }}>{resetMode ? "استعادة كلمة المرور" : mode === "signup" ? "إنشاء حساب جديد" : "تسجيل الدخول"}</h1>
        <p style={{ color: "#66756c", lineHeight: 1.7 }}>{resetMode ? "أدخل بريدك الإلكتروني وسنرسل لك رابطًا آمنًا لتعيين كلمة مرور جديدة." : "أنشئ حسابك لتتمكن من نشر إعلاناتك والتواصل مع الآخرين."}</p>

        {!resetMode && <div style={{ display: "flex", gap: 8, margin: "22px 0" }}>
          <button type="button" onClick={() => { setMode("signup"); setMessage(""); }} style={{ flex: 1, padding: 12, border: 0, borderRadius: 10, background: mode === "signup" ? "#16834b" : "#edf2ee", color: mode === "signup" ? "white" : "#173b2d", fontWeight: 700 }}>حساب جديد</button>
          <button type="button" onClick={() => { setMode("login"); setMessage(""); }} style={{ flex: 1, padding: 12, border: 0, borderRadius: 10, background: mode === "login" ? "#16834b" : "#edf2ee", color: mode === "login" ? "white" : "#173b2d", fontWeight: 700 }}>دخول</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
          {!resetMode && mode === "signup" && (
            <label style={{ display: "grid", gap: 7 }}>
              الاسم
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="اسمك" style={fieldStyle} />
            </label>
          )}
          <label style={{ display: "grid", gap: 7 }}>
            البريد الإلكتروني
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" dir="ltr" style={fieldStyle} />
          </label>
          <label style={{ display: "grid", gap: 7 }}>
            كلمة المرور
            <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6 أحرف على الأقل" dir="ltr" style={fieldStyle} />
          </label>
          <button disabled={busy} type="submit" style={{ border: 0, borderRadius: 10, padding: 14, background: "#16834b", color: "white", fontWeight: 700, opacity: busy ? .65 : 1 }}>
            {busy ? "يرجى الانتظار..." : resetMode ? "إرسال رابط الاستعادة" : mode === "signup" ? "إنشاء الحساب" : "تسجيل الدخول"}
          </button>
        </form>

        {!resetMode && mode === "login" && <button type="button" onClick={() => setResetMode(true)} style={{ marginTop: 14, padding: 0, border: 0, background: "transparent", color: "#16834b", fontWeight: 700, cursor: "pointer" }}>نسيت كلمة المرور؟</button>}\n        {resetMode && <button type="button" onClick={() => { setResetMode(false); setMessage(""); }} style={{ marginTop: 14, padding: 0, border: 0, background: "transparent", color: "#16834b", fontWeight: 700, cursor: "pointer" }}>العودة إلى تسجيل الدخول</button>}\n        {message && <p role="status" style={{ marginTop: 18, padding: 12, borderRadius: 10, background: "#edf7f0", lineHeight: 1.7, overflowWrap: "anywhere" }}>{message}</p>}
        <p style={{ marginTop: 18, color: "#718078", fontSize: 13, lineHeight: 1.7 }}>لا تشارك كلمة مرورك مع أي شخص. تأكيد البريد الإلكتروني مطلوب للحسابات الجديدة.</p>
      </section>
    </main>
  );
}

const fieldStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  border: "1px solid #d9e4dc",
  borderRadius: 10,
  padding: 13,
  fontSize: 16,
  background: "white",
};
