"use client";

import { useEffect, useState } from "react";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("baddel-theme");
    const enabled = saved === "dark";
    setDark(enabled);
    document.documentElement.dataset.theme = enabled ? "dark" : "light";
  }, []);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("baddel-theme", next ? "dark" : "light");
  }
  return <>
    {children}
    <button type="button" className="global-theme-toggle" onClick={toggle} aria-label={dark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"} title={dark ? "الوضع الفاتح" : "الوضع الداكن"}>{dark ? "☀️" : "🌙"}<span>{dark ? "الوضع الفاتح" : "الوضع الداكن"}</span></button>
  </>;
}
