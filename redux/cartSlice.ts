import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

export interface CartState {
  items: Product[];
}

// const [item, setItem] = useState([])

const initialState: CartState = {
  items: [],
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state: CartState, action: PayloadAction<Product>) => {
      state.items = [...state.items, action.payload];
    },
    removeFromCart: (
      state: CartState,
      action: PayloadAction<{ id: string }>
    ) => {
      const index = state.items.findIndex(
        (item: Product) => item._id === action.payload.id
      );
      const newCart = [...state.items];

      if (index >= 0) {
        newCart.splice(index, 1);
      } else {
        console.log(
          `Can't remove product ${action.payload.id} as its not in cart`
        );
      }
      /* Mutating the state. */
      state.items = newCart;
    },
  },
});

// Action creators are generated for each case reducer function
export const { addToCart, removeFromCart } = cartSlice.actions;

// Selector - retrieving items in state to use in different components
export const selectBasketItems = (state: RootState) => state.cart.items;

export const selectBasketItemsWithId = (state: RootState, id: string) => {
  state.cart.items.filter((item: Product) => item._id === id);
};

export const selectBasketTotal = (state: RootState) =>
  state.cart.items.reduce(
    (total: number, item: Product) => (total += item.price),
    0
  );

export default cartSlice.reducer;
