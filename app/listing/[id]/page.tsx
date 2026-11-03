"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Listing = {
  id: string; title: string; description: string | null;
  price_dzd: number | null; wilaya: string; municipality: string | null;
  listing_type: string; item_condition: string; contact_phone: string | null; created_at: string;
};
type ListingImage = { id: string; image_url: string; sort_order: number };

const typeLabels: Record<string, string> = { sale: "للبيع", exchange: "للتبادل", both: "للبيع أو التبادل" };
const conditionLabels: Record<string, string> = { new: "جديد", like_new: "شبه جديد", good: "حالة جيدة", acceptable: "حالة مقبولة" };

export default function ListingDetailsPage() {
  const params = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [images, setImages] = useState<ListingImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadListing() {
      const { data, error } = await supabase.from("listings")
        .select("id,title,description,price_dzd,wilaya,municipality,listing_type,item_condition,contact_phone,created_at")
        .eq("id", params.id).eq("status", "active").maybeSingle();
      if (error) setError("تعذر تحميل الإعلان: " + error.message);
      else if (!data) setError("هذا الإعلان غير موجود أو لم يعد متاحًا.");
      else {
        setListing(data as Listing);
        const { data: imageData } = await supabase.from("listing_images")
          .select("id,image_url,sort_order").eq("listing_id", params.id).order("sort_order");
        setImages((imageData || []) as ListingImage[]);
      }
      setLoading(false);
    }
    if (params.id) loadListing();
  }, [params.id]);

  return <main dir="rtl" style={{minHeight:"100vh",background:"#f4f8f5",padding:24,color:"#173b2d",fontFamily:"Arial,sans-serif"}}>
    <article style={{maxWidth:760,margin:"24px auto",background:"#fff",padding:28,borderRadius:18,boxShadow:"0 10px 35px #0000000d"}}>
      <a href="/" style={{color:"#16834b",fontWeight:700}}>← العودة إلى BADDEL</a>
      {loading ? <p style={{padding:30}}>جارٍ تحميل تفاصيل الإعلان...</p> : error ? <p role="alert" style={{padding:20,color:"#a33",lineHeight:1.8}}>{error}</p> : listing && <>
        <span style={{display:"inline-block",marginTop:24,padding:"6px 12px",borderRadius:20,background:"#eaf6ee",color:"#16834b"}}>{typeLabels[listing.listing_type] || "إعلان"}</span>
        <h1 style={{fontSize:30,margin:"16px 0"}}>{listing.title}</h1>
        {images.length > 0 && <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,margin:"20px 0"}}>{images.map(image=><img key={image.id} src={image.image_url} alt={listing.title} style={{width:"100%",height:220,objectFit:"cover",borderRadius:12,background:"#f0f4f1"}}/>)}</div>}
        <strong style={{fontSize:25,color:"#16834b"}}>{listing.price_dzd == null ? "السعر عند التواصل" : Number(listing.price_dzd).toLocaleString("ar-DZ") + " دج"}</strong>
        <hr style={{border:0,borderTop:"1px solid #e5eee8",margin:"24px 0"}}/>
        <h2>تفاصيل المنتج</h2>
        <p style={{whiteSpace:"pre-wrap",lineHeight:2,color:"#52645a"}}>{listing.description || "لا يوجد وصف إضافي."}</p>
        <h2 style={{marginTop:26}}>معلومات الإعلان</h2>
        <p style={{lineHeight:2}}>📍 الولاية: {listing.wilaya}</p>
        {listing.municipality && <p style={{lineHeight:2}}>🏘️ البلدية: {listing.municipality}</p>}
        <p style={{lineHeight:2}}>📦 حالة المنتج: {conditionLabels[listing.item_condition] || listing.item_condition}</p>
        <p style={{lineHeight:2}}>🗓️ تاريخ النشر: {new Date(listing.created_at).toLocaleDateString("ar-DZ")}</p>
        {listing.contact_phone && <section style={{marginTop:28,padding:18,borderRadius:14,background:"#f0f8f2"}}>
          <h2 style={{marginTop:0}}>التواصل مع صاحب الإعلان</h2>
          <p dir="ltr" style={{textAlign:"right",fontSize:20,fontWeight:700}}>{listing.contact_phone}</p>
          <a href={"tel:" + listing.contact_phone} style={{display:"inline-block",padding:"12px 18px",borderRadius:10,background:"#16834b",color:"#fff",textDecoration:"none",fontWeight:700}}>اتصل الآن</a>
        </section>}
      </>}
    </article>
  </main>;
}
