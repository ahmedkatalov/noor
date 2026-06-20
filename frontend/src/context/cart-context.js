import { createContext, useContext } from "react";

export const CartCtx = createContext(null);

export function useCart() {
  return useContext(CartCtx);
}
