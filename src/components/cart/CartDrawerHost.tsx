"use client";

import { useEffect, useState } from "react";
import { MobileCartDrawer } from "@/components/cart/MobileCartDrawer";

export const OPEN_CART_EVENT = "mofu:open-cart";

export function CartDrawerHost() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener(OPEN_CART_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_CART_EVENT, handleOpen);
  }, []);

  return <MobileCartDrawer open={open} onClose={() => setOpen(false)} />;
}
