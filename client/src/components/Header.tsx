import { Button } from "@/components/ui/button";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/contexts/CartContext";
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { label: "首頁", href: "/" },
  { label: "產品", href: "/products" },
  { label: "探索寵物世界", href: "/pet-world" },
  { label: "關於我們", href: "/about" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartBumping, setIsCartBumping] = useState(false);
  const { itemCount, openCart } = useCart();
  const previousItemCount = useRef(itemCount);

  useEffect(() => {
    if (itemCount > previousItemCount.current) {
      setIsCartBumping(true);
      const timeoutId = window.setTimeout(() => setIsCartBumping(false), 450);
      previousItemCount.current = itemCount;
      return () => window.clearTimeout(timeoutId);
    }
    previousItemCount.current = itemCount;
  }, [itemCount]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[#F5EFE6] shadow-sm backdrop-blur-md">
      <div className="container flex h-[70px] items-center justify-between md:h-32">
        <a href="/" aria-label="Mofu Haven 首頁" className="group flex h-full min-w-0 items-center">
          <img src="/manus-storage/mofu-haven-logo-transparent_20d068b4.png" alt="Mofu Haven" className="h-[58px] max-h-[58px] w-auto max-w-[168px] object-contain transition-transform duration-300 group-hover:scale-[1.02] md:h-[130px] md:max-h-[135px] md:max-w-none" />
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="主選單">
          {navItems.map((item) => <a key={item.href} href={item.href} className="group relative text-sm font-medium text-foreground transition-colors duration-200 hover:text-[#8C6B53]">{item.label}<span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#D3A87C] transition-all duration-300 group-hover:w-full" /></a>)}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <a href="/products" aria-label="搜尋及瀏覽商品" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#FFFDF9] text-[#8C6B53] transition-colors hover:bg-[#D3A87C] hover:text-white md:h-10 md:w-10"><Search className="h-4 w-4 md:h-5 md:w-5" /></a>
          <Button variant="ghost" size="icon" onClick={openCart} className="relative h-10 w-10 rounded-full bg-[#FFFDF9] text-[#8C6B53] transition-colors hover:bg-[#D3A87C] hover:text-white md:h-10 md:w-10" aria-label={`購物車，目前 ${itemCount} 件商品`}><ShoppingCart className="h-4 w-4 md:h-5 md:w-5" /><span className={`absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#D3A87C] text-[9px] font-semibold text-white md:h-4 md:w-4 md:text-[10px] ${isCartBumping ? "cart-badge-bump" : ""}`}>{itemCount > 99 ? "99+" : itemCount}</span></Button>
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#FFFDF9] p-0 text-[#8C6B53] transition-colors hover:bg-[#D3A87C] hover:text-white md:hidden" onClick={() => setIsMenuOpen((open) => !open)} aria-label="開啟選單" aria-expanded={isMenuOpen}>{isMenuOpen ? <X className="h-5 w-5 text-foreground" /> : <Menu className="h-5 w-5 text-foreground" />}</button>
        </div>
      </div>

      <CartDrawer />

      {isMenuOpen && <nav className="border-t border-[#D3A87C]/20 bg-[#F5EFE6] backdrop-blur-sm md:hidden" aria-label="手機主選單"><div className="container flex flex-col gap-3 py-4">{navItems.map((item) => <a key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)} className="text-sm font-medium text-foreground transition-all hover:pl-2 hover:text-[#8C6B53]">{item.label}</a>)}</div></nav>}
    </header>
  );
}
