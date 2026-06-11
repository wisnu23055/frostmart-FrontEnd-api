import { createSlice } from "@reduxjs/toolkit";
import { logout, loginSuccess } from "./authSlice.js";

const saveCartToStorage = (items) => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && user.id) {
        localStorage.setItem(`cartItems_${user.id}`, JSON.stringify(items));
        return;
      }
    } catch (e) {
      // ignore
    }
  }
  localStorage.setItem("cartItems_guest", JSON.stringify(items));
};

const getInitialCart = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && user.id) {
        return JSON.parse(localStorage.getItem(`cartItems_${user.id}`) || "[]");
      }
    } catch (e) {
      // ignore
    }
  }
  return JSON.parse(localStorage.getItem("cartItems_guest") || "[]");
};

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: getInitialCart(),
  },
  reducers: {
    addToCart: (state, action) => {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        existing.qty += 1;
      } else {
        state.items.push({ ...action.payload, qty: 1 });
      }
      saveCartToStorage(state.items);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
      saveCartToStorage(state.items);
    },
    updateQty: (state, action) => {
      const { id, qty } = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (item) {
        if (qty <= 0) {
          state.items = state.items.filter((i) => i.id !== id);
        } else {
          item.qty = qty;
        }
      }
      saveCartToStorage(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      saveCartToStorage(state.items);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      state.items = [];
    });
    builder.addCase(loginSuccess, (state, action) => {
      const user = action.payload;
      if (user && user.id) {
        state.items = JSON.parse(localStorage.getItem(`cartItems_${user.id}`) || "[]");
      }
    });
  },
});

export const { addToCart, removeFromCart, updateQty, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
