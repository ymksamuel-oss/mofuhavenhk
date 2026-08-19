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
        <a href="/" aria-label="Mofu Haven 首頁" className="group flex min-w-0 items-center">
          <img src="/manus-storage/mofu-haven-logo-transparent_20d068b4.png" alt="Mofu Haven" className="h-[45px] w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]" />
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="主選單">
          {navItems.map((item) => <a key={item.href} href={item.href} className="group relative text-sm font-medium text-foreground transition-colors duration-200 hover:text-[#8C6B53]">{item.label}<span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#D3A87C] transition-all duration-300 group-hover:w-full" /></a>)}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <a href="/?category=all#products" aria-label="搜尋及瀏覽商品" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#FFFDF9] text-[#8C6B53] transition-colors hover:bg-[#D3A87C] hover:text-white"><Search className="h-5 w-5" /></a>
          <Button variant="ghost" size="icon" className="relative rounded-full bg-[#FFFDF9] text-[#8C6B53] transition-colors hover:bg-[#D3A87C] hover:text-white" aria-label="購物車"><ShoppingCart className="h-5 w-5" /><span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D3A87C] text-xs font-semibold text-white">0</span></Button>
          <button className="rounded-full bg-[#FFFDF9] p-2 text-[#8C6B53] transition-colors hover:bg-[#D3A87C] hover:text-white md:hidden" onClick={() => setIsMenuOpen((open) => !open)} aria-label="開啟選單" aria-expanded={isMenuOpen}>{isMenuOpen ? <X className="h-5 w-5 text-foreground" /> : <Menu className="h-5 w-5 text-foreground" />}</button>
        </div>
      </div>

      {isMenuOpen && <nav className="border-t border-border bg-white/90 backdrop-blur-sm md:hidden" aria-label="手機主選單"><div className="container flex flex-col gap-3 py-4">{navItems.map((item) => <a key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)} className="text-sm font-medium text-foreground transition-all hover:pl-2 hover:text-[#8C6B53]">{item.label}</a>)}</div></nav>}
    </header>
  );
}
