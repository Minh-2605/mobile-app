// app/cart-store.ts

// app/cart-store.ts

export interface CartItem {
  id: string;
  name: string;
  price: string;
  image: string;
  quantity: number;
}

// Chỉ khai báo biến này một lần duy nhất
export let globalCart: CartItem[] = []; 

export const addToCart = (product: any) => {
  const existingItem = globalCart.find(item => item.id === product.id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    globalCart.push({ ...product, quantity: 1 });
  }
};

export const incrementQuantity = (id: string) => {
  const item = globalCart.find(i => i.id === id);
  if (item) item.quantity += 1;
};

export const decrementQuantity = (id: string) => {
  const item = globalCart.find(i => i.id === id);
  if (item && item.quantity > 1) {
    item.quantity -= 1;
  }
};

export const removeFromCart = (id: string) => {
  globalCart = globalCart.filter(item => item.id !== id);
};

// 6. Hàm tính tổng tiền (Bổ sung thêm)

export const getTotalPrice = () => {
  return globalCart.reduce((total, item) => {
    // Loại bỏ dấu chấm và chữ 'đ' để chuyển thành số
    const numericPrice = parseInt(item.price.replace(/\./g, '').replace('đ', ''));
    return total + numericPrice * item.quantity;
  }, 0);
};
export const getCartCount = () => {
  return globalCart.reduce((count, item) => count + item.quantity, 0);
};
