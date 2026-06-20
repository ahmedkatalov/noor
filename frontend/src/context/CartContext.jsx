import { useMemo, useReducer } from "react";
import { CartCtx } from "./cart-context.js";

function reducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const existing = state.items[action.payload.id];
      return {
        items: {
          ...state.items,
          [action.payload.id]: existing
            ? { ...existing, qty: existing.qty + 1 }
            : { ...action.payload, qty: 1 }
        }
      };
    }
    case "INC": {
      const it = state.items[action.id];
      if (!it) return state;
      return {
        items: {
          ...state.items,
          [action.id]: { ...it, qty: it.qty + 1 }
        }
      };
    }
    case "DEC": {
      const it = state.items[action.id];
      if (!it) return state;
      if (it.qty <= 1) {
        const copy = { ...state.items };
        delete copy[action.id];
        return { items: copy };
      }
      return {
        items: {
          ...state.items,
          [action.id]: { ...it, qty: it.qty - 1 }
        }
      };
    }
    case "CLEAR":
      return { items: {} };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { items: {} });

  const api = useMemo(() => ({
    items: state.items,
    add: (item) => dispatch({ type: "ADD", payload: item }),
    inc: (id) => dispatch({ type: "INC", id }),
    dec: (id) => dispatch({ type: "DEC", id }),
    clear: () => dispatch({ type: "CLEAR" })
  }), [state.items]);

  return <CartCtx.Provider value={api}>{children}</CartCtx.Provider>;
}
