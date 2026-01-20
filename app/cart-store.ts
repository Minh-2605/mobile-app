

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

// Chỉ khai báo biến này một lần duy nhất
export let globalCart: CartItem[] = [];

export const clearCart = () => {
  // Dùng cách này để xóa sạch mảng mà không làm mất tham chiếu
  globalCart.length = 0;
  console.log("Đã xóa sạch giỏ hàng");
};

export const getTotalPrice = () => {
  // Bây giờ item.price và item.quantity sẽ không còn bị gạch đỏ
  return globalCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

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



export const getCartCount = () => {
  return globalCart.reduce((count, item) => count + item.quantity, 0);
};
// app/cart-store.ts

