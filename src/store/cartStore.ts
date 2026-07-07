import { createContext, useContext, useReducer, ReactNode, createElement } from 'react';
import { CartItem, Product, ProductColor, TshirtCustomization } from '../types';

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        (item) =>
          item.product.id === action.payload.product.id &&
          item.selectedSize === action.payload.selectedSize &&
          item.selectedColor?.hex === action.payload.selectedColor?.hex &&
          JSON.stringify(item.customization) === JSON.stringify(action.payload.customization)
      );
      if (existingIndex >= 0) {
        const updated = [...state.items];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + action.payload.quantity,
        };
        return { items: updated };
      }
      return { items: [...state.items, action.payload] };
    }
    case 'REMOVE_ITEM':
      return { items: state.items.filter((_, i) => i !== parseInt(action.payload)) };
    case 'UPDATE_QUANTITY':
      return {
        items: state.items.map((item) =>
          item.product.id === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case 'CLEAR_CART':
      return { items: [] };
    default:
      return state;
  }
}

interface CartContextValue {
  state: CartState;
  addItem: (product: Product, quantity?: number, size?: string, color?: ProductColor, customization?: TshirtCustomization) => void;
  removeItem: (index: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

export const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const addItem = (
    product: Product,
    quantity = 1,
    size?: string,
    color?: ProductColor,
    customization?: TshirtCustomization
  ) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity, selectedSize: size, selectedColor: color, customization } });
  };

  const removeItem = (index: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: String(index) });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const total = state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return createElement(CartContext.Provider, {
    value: { state, addItem, removeItem, updateQuantity, clearCart, total, itemCount },
    children,
  });
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
