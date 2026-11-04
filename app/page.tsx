"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Category = { id: number; name_ar: string; icon: string | null };

type Listing = {
  id: string;
  title: string;
  description: string | null;
  price_dzd: number | null;
  wilaya: string;
  listing_type: string;
  category_id: number | null;
  created_at: string;
  image_url?: string | null;
};


const typeLabels: Record<string, string> = {
  sale: "للبيع",
  exchange: "للتبادل",
  both: "للبيع أو التبادل",
};

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    async function loadListings() {
      setLoading(true);
      const { data: categoryRows } = await supabase.from("categories").select("id,name_ar,icon").eq("is_active", true).order("sort_order");
      setCategories((categoryRows || []) as Category[]);
      const { data, error } = await supabase
        .from("listings")
        .select("id,title,description,price_dzd,wilaya,listing_type,category_id,created_at")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error || !data?.length) {
        setListings([]);
        setLoading(false);
        return;
      }

      const ids = data.map((item) => item.id);
      const { data: imageRows } = await supabase
        .from("listing_images")
        .select("listing_id,image_url,sort_order")
        .in("listing_id", ids)
        .order("sort_order", { ascending: true });

      const firstImage = new Map<string, string>();
      (imageRows || []).forEach((image) => {
        if (!firstImage.has(image.listing_id)) firstImage.set(image.listing_id, image.image_url);
      });
      setListings(data.map((item) => ({ ...item, image_url: firstImage.get(item.id) || null })) as Listing[]);
      setLoading(false);
    }
    loadListings();
  }, []);

  const wilayas = useMemo(
    () => [...new Set(listings.map((item) => item.wilaya).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ar")),
    [listings]
  );

  const filteredListings = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("ar");
    const result = listings.filter((item) => {
      const matchesSearch = !term || [item.title, item.description || "", item.wilaya]
        .some((value) => value.toLocaleLowerCase("ar").includes(term));
      const matchesWilaya = !wilaya || item.wilaya === wilaya;
      const matchesCategory = !category || String(item.category_id) === category;
      const matchesType = !type || item.listing_type === type || (type === "sale" && item.listing_type === "both") || (type === "exchange" && item.listing_type === "both");
      return matchesSearch && matchesWilaya && matchesCategory && matchesType;
    });
    if (sort === "price-low") result.sort((a, b) => (a.price_dzd ?? Number.MAX_SAFE_INTEGER) - (b.price_dzd ?? Number.MAX_SAFE_INTEGER));
    if (sort === "price-high") result.sort((a, b) => (b.price_dzd ?? -1) - (a.price_dzd ?? -1));
    if (sort === "newest") result.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    return result;
  }, [listings, search, wilaya, category, type, sort]);

  function resetFilters() {
    setSearch("");
    setWilaya("");
    setCategory("");
    setType("");
    setSort("newest");
  }

  return <main>
    <div className="topline"><div className="wrap top-inner"><span>🇩🇿 منصة جزائرية 100%</span><span>بيع • شراء • بدّل</span></div></div>
    <header className="wrap header">
      <a className="brand" href="/"><span className="brand-icon">ب</span><span>BADDEL<small>بدّلها… تلقى واش تحتاج</small></span></a>
      <nav><a href="#categories">التصنيفات</a><a href="#listings">الإعلانات</a><a href="#how">كيفاش تخدم؟</a><a href="https://wa.me/213667661934" target="_blank" rel="noopener noreferrer">تواصل معنا</a></nav>
      <div className="head-actions"><a className="btn primary" href="/submit">＋ أضف إعلان</a></div>
    </header>

    <section className="hero"><div className="wrap hero-grid">
      <div className="hero-copy">
        <span className="eyebrow">السوق الجزائري بين يديك</span>
        <h1>ما تحتاجوش جديد…<br/><em>بدّلو!</em></h1>
        <p>بيع واش ما تحتاجوش، اشري واش ناقصك، ولا بدّل منتجك بحاجة تفيدك. كل هذا في مكان واحد.</p>
        <form className="search" onSubmit={(event) => { event.preventDefault(); document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" }); }}>
          <span>⌕</span><input aria-label="ابحث عن منتج" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="واش راك تحوس عليه؟ هاتف، دراجة، أثاث..." />
          <button type="submit">ابحث</button>
        </form>
        <div className="hero-notes"><span>✓ إعلانات من مختلف الولايات</span><span>✓ البيع والتبادل</span></div>
      </div>
      <div className="hero-art"><div className="art-circle"></div><div className="float-card card-one"><b>🔄</b><span>بدّل منتجك</span><small>واعثر على شيء جديد</small></div><div className="product-emoji">🛍️</div><div className="float-card card-two"><b>📍</b><span>قريب منك</span><small>من ولايتك وبلديتك</small></div><div className="art-sticker">بدّلها<br/>بذكاء!</div></div>
    </div></section>

    <section className="wrap stats"><div><b>كل الجزائر</b><span>منصة وطنية</span></div><div><b>بيع وشراء</b><span>إعلانات متنوعة</span></div><div><b>تبادل</b><span>فرص جديدة</span></div><div><b>بسهولة</b><span>تصفح واكتشف</span></div></section>

    <section className="wrap section" id="categories"><div className="section-head"><div><span className="eyebrow">اكتشف ما يناسبك</span><h2>تصفح حسب التصنيف</h2></div><a href="#listings">كل التصنيفات ←</a></div>
      <div className="categories">{categories.map((item) => <button type="button" className={category === String(item.id) ? "category category-selected" : "category"} onClick={() => { setCategory(category === String(item.id) ? "" : String(item.id)); document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" }); }} key={item.id}><span>{item.icon || "📦"}</span><b>{item.name_ar}</b><small>اضغط لعرض الإعلانات</small></button>)}</div>
    </section>

    <section className="section pale" id="listings"><div className="wrap">
      <div className="section-head"><div><span className="eyebrow">فرص تستاهل تشوفها</span><h2>اكتشف الإعلانات</h2><p className="muted">ابحث وصفّ النتائج حسب ما تحتاج.</p></div><a className="btn primary" href="/submit">＋ أضف إعلان</a></div>
      <div className="listing-filters">
        <label className="filter-search">بحث<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="اسم المنتج أو وصفه..." /></label>
        <label>الولاية<select value={wilaya} onChange={(event) => setWilaya(event.target.value)}><option value="">كل الولايات</option>{wilayas.map((name) => <option key={name} value={name}>{name}</option>)}</select></label>
        <label>التصنيف<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">كل التصنيفات</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name_ar}</option>)}</select></label>
        <label>نوع الإعلان<select value={type} onChange={(event) => setType(event.target.value)}><option value="">الكل</option><option value="sale">للبيع</option><option value="exchange">للتبادل</option></select></label>
        <label>الترتيب<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">الأحدث أولًا</option><option value="price-low">السعر: الأقل</option><option value="price-high">السعر: الأعلى</option></select></label>
        <button type="button" className="filter-reset" onClick={resetFilters}>إعادة ضبط</button>
      </div>
      <div className="results-count">تم العثور على {filteredListings.length} إعلان</div>
      {loading ? <div className="empty-listings"><p>جارٍ تحميل الإعلانات...</p></div> : filteredListings.length === 0 ? <div className="empty-listings"><div className="empty-listings-icon">🔎</div><h3>{listings.length ? "ما لقيناش نتائج مطابقة" : "ماكان حتى إعلان منشور حاليًا"}</h3><p>{listings.length ? "جرّب تغيير كلمات البحث أو الفلاتر." : "كون أول واحد ينشر إعلان في BADDEL."}</p><button className="btn light" onClick={resetFilters}>عرض جميع الإعلانات</button></div> :
        <div className="listing-grid">{filteredListings.map((item) => <a className="listing" href={"/listing/" + item.id} key={item.id}>
          <div className="listing-image">{item.image_url ? <img src={item.image_url} alt={item.title} loading="lazy"/> : <span>📦</span>}<label>{typeLabels[item.listing_type] || "إعلان"}</label></div>
          <div className="listing-info"><small>{item.wilaya}</small><h3>{item.title}</h3><p className="listing-description">{item.description || "لا يوجد وصف إضافي."}</p><strong>{item.price_dzd == null ? "السعر عند التواصل" : Number(item.price_dzd).toLocaleString("ar-DZ") + " دج"}</strong><div className="location">عرض التفاصيل ←</div></div>
        </a>)}</div>}
    </div></section>

    <section className="wrap how section" id="how"><div><span className="eyebrow">بسيطة وما فيهاش تعقيد</span><h2>ثلاث خطوات وتبدأ</h2><p className="muted">BADDEL تجمع الناس والمنتجات في تجربة واحدة سهلة.</p></div><div className="steps"><div><b>01</b><h3>انشر إعلانك</h3><p>صوّر منتجك، زيد التفاصيل وحدد السعر والولاية.</p></div><div><b>02</b><h3>تواصل واتفق</h3><p>تواصل مع الطرف الآخر واتفقوا على التفاصيل.</p></div><div><b>03</b><h3>بيع أو بدّل</h3><p>كملوا الاتفاق والتسليم بالطريقة المناسبة لكم.</p></div></div></section>
    <footer><div className="wrap footer-inner"><a className="brand" href="/"><span className="brand-icon">ب</span><span>BADDEL<small>بدّلها… تلقى واش تحتاج</small></span></a><span>© 2026 BADDEL — مشروع قيد التطوير</span><a href="https://wa.me/213667661934" target="_blank" rel="noopener noreferrer">💬 تواصل مع إدارة الموقع عبر واتساب</a><span>صُنع للجزائر 🇩🇿</span></div></footer>
  </main>;
}
