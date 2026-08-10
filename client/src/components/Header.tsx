import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";

/**
 * Header Component
 * Design: Japanese Healing Aesthetic
 * - Soft green accent color
 * - Clean, minimal navigation
 * - Logo with brand mark
 * - Enhanced brand identity
 */
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container flex items-center justify-between h-16 md:h-20">
        {/* Logo & Brand - Enhanced Wordmark */}
        <a href="/" className="flex items-center gap-3 group" aria-label="Mofu Haven home">
          <span className="flex w-8 h-8 md:w-10 md:h-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-sm md:text-base font-bold text-primary group-hover:scale-110 transition-transform duration-300">
            毛
          </span>
          <div className="hidden sm:block">
            <div className="flex items-baseline gap-1">
              <h1 className="text-lg md:text-xl font-bold text-foreground">
                毛毛港
              </h1>
              <span className="text-xs md:text-sm text-primary font-semibold">
                Mofu Haven
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-none">
              日本寵物用品專門店
            </p>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="/"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200 relative group"
          >
            首頁
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
          </a>
          <a
            href="#products"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200 relative group"
          >
            產品
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
          </a>
          <a
            href="#about"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200 relative group"
          >
            關於我們
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
          </a>
          <a
            href="#contact"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200 relative group"
          >
            聯絡
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="relative hover:bg-primary/10 transition-colors"
          >
            <a href="#products" aria-label="Shopping Cart">
              <ShoppingCart className="w-5 h-5 text-foreground" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-xs rounded-full flex items-center justify-center font-semibold">
                0
              </span>
            </a>
          </Button>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 hover:bg-primary/10 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden border-t border-border bg-white/50 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="container py-4 flex flex-col gap-3">
            <a
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="text-sm font-medium text-foreground hover:text-primary hover:pl-2 transition-all"
            >
              首頁
            </a>
            <a
              href="#products"
              onClick={() => setIsMenuOpen(false)}
              className="text-sm font-medium text-foreground hover:text-primary hover:pl-2 transition-all"
            >
              產品
            </a>
            <a
              href="#about"
              onClick={() => setIsMenuOpen(false)}
              className="text-sm font-medium text-foreground hover:text-primary hover:pl-2 transition-all"
            >
              關於我們
            </a>
            <a
              href="#contact"
              onClick={() => setIsMenuOpen(false)}
              className="text-sm font-medium text-foreground hover:text-primary hover:pl-2 transition-all"
            >
              聯絡
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
