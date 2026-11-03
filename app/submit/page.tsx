"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Category = { id: number; name_ar: string };

export default function SubmitListingPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState("sale");
  const [images, setImages] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.from("categories").select("id,name_ar").eq("is_active", true).order("sort_order")
      .then(({ data }) => setCategories((data || []) as Category[]));
  }, []);

  function chooseImages(files: FileList | null) {
    if (!files) return;
    const selected = Array.from(files);
    if (selected.length > 5) {
      setMessage("يمكنك اختيار 5 صور كحد أقصى.");
      return;
    }
    const invalid = selected.find(file => !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024);
    if (invalid) {
      setMessage("اختر صورًا فقط، وحجم كل صورة لا يتجاوز 5 ميغابايت.");
      return;
    }
    setImages(selected);
    setMessage("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const listingId = crypto.randomUUID();
    const { error } = await supabase.from("listings").insert({
      id: listingId,
      seller_id: null,
      category_id: categoryId ? Number(categoryId) : null,
      title: title.trim(),
      description: description.trim(),
      price_dzd: price ? Number(price) : null,
      listing_type: type,
      item_condition: "good",
      wilaya: wilaya.trim(),
      contact_phone: phone.trim(),
      status: "pending_review",
    });

    if (error) {
      setBusy(false);
      setMessage("تعذر إرسال الإعلان: " + (error?.message || "لم يتم إنشاء الإعلان."));
      return;
    }

    const imageRows: { listing_id: string; image_url: string; sort_order: number }[] = [];
    for (let index = 0; index < images.length; index++) {
      const file = images[index];
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = listingId + "/" + crypto.randomUUID() + "." + extension;
      const { error: uploadError } = await supabase.storage.from("listing-images").upload(path, file, {
        cacheControl: "3600", upsert: false, contentType: file.type,
      });
      if (uploadError) {
        setBusy(false);
        setMessage("تم حفظ الإعلان، لكن تعذر رفع الصور: " + uploadError.message + ". راجع صلاحيات التخزين.");
        return;
      }
      const { data: publicData } = supabase.storage.from("listing-images").getPublicUrl(path);
      imageRows.push({ listing_id: listingId, image_url: publicData.publicUrl, sort_order: index });
    }

    if (imageRows.length) {
      const { error: imageError } = await supabase.from("listing_images").insert(imageRows);
      if (imageError) {
        setBusy(false);
        setMessage("تم حفظ الإعلان، لكن تعذر ربط الصور به: " + imageError.message);
        return;
      }
    }

    setBusy(false);
    setMessage("وصل إعلانك وصوره إلى الإدارة بنجاح. سيظهر بعد المراجعة والموافقة عليه.");
    setTitle(""); setDescription(""); setPrice(""); setWilaya(""); setPhone("");
    setCategoryId(""); setType("sale"); setImages([]);
  }

  const field = { width: "100%", boxSizing: "border-box" as const, padding: 12, border: "1px solid #d9e4dc", borderRadius: 10, fontSize: 16 };
  return <main dir="rtl" style={{ minHeight: "100vh", background: "#f4f8f5", padding: 24, color: "#173b2d", fontFamily: "Arial,sans-serif" }}>
    <section style={{ maxWidth: 620, margin: "24px auto", background: "white", padding: 26, borderRadius: 18, boxShadow: "0 10px 35px #0000000d" }}>
      <a href="/" style={{ color: "#16834b", fontWeight: 700 }}>← العودة إلى BADDEL</a>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>أرسل إعلانك مجانًا</h1>
      <p style={{ color: "#66756c", lineHeight: 1.8 }}>لا تحتاج إلى إنشاء حساب. سيراجع فريق الإدارة إعلانك قبل ظهوره للزوار.</p>
      <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
        <label>عنوان الإعلان<input required minLength={3} maxLength={120} value={title} onChange={e=>setTitle(e.target.value)} placeholder="مثال: هاتف مستعمل بحالة جيدة" style={field}/></label>
        <label>التصنيف<select required value={categoryId} onChange={e=>setCategoryId(e.target.value)} style={field}><option value="">اختر التصنيف</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name_ar}</option>)}</select></label>
        <label>تفاصيل المنتج<textarea required value={description} onChange={e=>setDescription(e.target.value)} rows={4} placeholder="اكتب وصفًا واضحًا للمنتج..." style={field}/></label>
        <label>صور المنتج (حتى 5 صور، 5 ميغابايت للصورة)<input type="file" accept="image/*" multiple onChange={e=>chooseImages(e.target.files)} style={field}/></label>
        {images.length > 0 && <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>{images.map((file,index)=><div key={index} style={{width:88}}><img src={URL.createObjectURL(file)} alt={"معاينة "+(index+1)} style={{width:88,height:88,objectFit:"cover",borderRadius:10}}/><small>{file.name}</small></div>)}</div>}
        <label>السعر بالدينار الجزائري (اختياري)<input type="number" min="0" value={price} onChange={e=>setPrice(e.target.value)} style={field}/></label>
        <label>نوع الإعلان<select value={type} onChange={e=>setType(e.target.value)} style={field}><option value="sale">للبيع</option><option value="exchange">للتبادل</option><option value="both">للبيع أو التبادل</option></select></label>
        <label>الولاية<input required value={wilaya} onChange={e=>setWilaya(e.target.value)} placeholder="مثال: الوادي" style={field}/></label>
        <label>رقم التواصل<input required type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="05xxxxxxxx" style={field}/></label>
        <button disabled={busy} type="submit" style={{ border: 0, borderRadius: 10, padding: 14, background: "#16834b", color: "white", fontWeight: 700, fontSize: 16 }}>{busy ? "جارٍ إرسال الإعلان والصور..." : "إرسال للمراجعة"}</button>
      </form>
      {message && <p role="status" style={{ background: "#edf7f0", padding: 12, borderRadius: 10, lineHeight: 1.8, overflowWrap: "anywhere" }}>{message}</p>}
    </section>
  </main>;
}
