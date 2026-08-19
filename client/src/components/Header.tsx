import { Button } from "@/components/ui/button";
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "首頁", href: "/" },
  { label: "產品", href: "/?category=all#products" },
  { label: "關於我們", href: "/#about" },
  { label: "聯絡", href: "/#contact" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 shadow-sm backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between md:h-20">
        <a href="/" className="group flex items-center gap-3">
          <img src="/manus-storage/mofu-haven-logo_75fb6778.png" alt="Mofu Haven Logo" className="h-8 w-8 transition-transform duration-300 group-hover:scale-110 md:h-10 md:w-10" />
          <div className="hidden sm:block">
            <div className="flex items-baseline gap-1"><h1 className="text-lg font-bold text-foreground md:text-xl">毛毛港</h1><span className="text-xs font-semibold text-primary md:text-sm">Mofu Haven</span></div>
            <p className="text-xs leading-none text-muted-foreground">日本寵物用品專門店</p>
          </div>
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="主選單">
          {navItems.map((item) => <a key={item.href} href={item.href} className="group relative text-sm font-medium text-foreground transition-colors duration-200 hover:text-primary">{item.label}<span className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full" /></a>)}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <a href="/?category=all#products" aria-label="搜尋及瀏覽商品" className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-primary/10 hover:text-primary"><Search className="h-5 w-5" /></a>
          <Button variant="ghost" size="icon" className="relative transition-colors hover:bg-primary/10" aria-label="購物車"><ShoppingCart className="h-5 w-5 text-foreground" /><span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">0</span></Button>
          <button className="rounded-lg p-2 transition-colors hover:bg-primary/10 md:hidden" onClick={() => setIsMenuOpen((open) => !open)} aria-label="開啟選單" aria-expanded={isMenuOpen}>{isMenuOpen ? <X className="h-5 w-5 text-foreground" /> : <Menu className="h-5 w-5 text-foreground" />}</button>
        </div>
      </div>

      {isMenuOpen && <nav className="border-t border-border bg-white/90 backdrop-blur-sm md:hidden" aria-label="手機主選單"><div className="container flex flex-col gap-3 py-4">{navItems.map((item) => <a key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)} className="text-sm font-medium text-foreground transition-all hover:pl-2 hover:text-primary">{item.label}</a>)}</div></nav>}
    </header>
  );
}
