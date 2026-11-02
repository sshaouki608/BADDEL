"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Listing = { id: string; title: string; description: string; price_dzd: number | null; wilaya: string; contact_phone: string | null; created_at: string; listing_type: string };

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { setAllowed(false); setLoading(false); return; }
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", userData.user.id).single();
    if (!profile?.is_admin) { setAllowed(false); setLoading(false); return; }
    setAllowed(true);
    const { data, error } = await supabase.from("listings").select("id,title,description,price_dzd,wilaya,contact_phone,created_at,listing_type").eq("status", "pending_review").order("created_at", { ascending: true });
    if (error) setMessage(error.message);
    setListings((data || []) as Listing[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function moderate(id: string, status: "active" | "rejected") {
    const { error } = await supabase.from("listings").update({ status }).eq("id", id);
    if (error) { setMessage(error.message); return; }
    setMessage(status === "active" ? "تمت الموافقة على الإعلان ونشره." : "تم رفض الإعلان.");
    await load();
  }

  return <main dir="rtl" style={{ minHeight: "100vh", background: "#f4f8f5", padding: 24, color: "#173b2d", fontFamily: "Arial,sans-serif" }}>
    <section style={{ maxWidth: 850, margin: "20px auto" }}>
      <a href="/" style={{ color: "#16834b", fontWeight: 700 }}>← BADDEL</a>
      <h1>لوحة مراجعة الإعلانات</h1>
      {loading ? <p>جارٍ التحقق...</p> : !allowed ? <div style={{ background: "white", padding: 20, borderRadius: 12 }}><p>هذه الصفحة مخصصة لمدير الموقع فقط.</p><a href="/account">تسجيل الدخول بحساب الإدارة</a></div> : <>
        <p>الإعلانات الجديدة لا تظهر للزوار حتى توافق عليها.</p>
        {message && <p role="status">{message}</p>}
        {listings.length === 0 ? <p>لا توجد إعلانات تنتظر المراجعة حاليًا.</p> : listings.map(item => <article key={item.id} style={{ background: "white", padding: 20, margin: "14px 0", borderRadius: 14, boxShadow: "0 5px 20px #0000000a" }}>
          <h2>{item.title}</h2><p>{item.description}</p><p>الولاية: {item.wilaya} · السعر: {item.price_dzd == null ? "غير محدد" : item.price_dzd + " دج"}</p><p>الهاتف: {item.contact_phone || "غير متوفر"}</p><small>{new Date(item.created_at).toLocaleString("ar-DZ")}</small>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}><button onClick={()=>moderate(item.id,"active")} style={{ padding: "10px 18px", border: 0, borderRadius: 8, background: "#16834b", color: "white" }}>موافقة ونشر</button><button onClick={()=>moderate(item.id,"rejected")} style={{ padding: "10px 18px", border: 0, borderRadius: 8, background: "#b42318", color: "white" }}>رفض</button></div>
        </article>)}
      </>}
    </section>
  </main>;
}
