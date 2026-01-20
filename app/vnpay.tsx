import { WebView, WebViewNavigation } from 'react-native-webview'; // Import thêm WebViewNavigation
import { router } from 'expo-router';
import { useState, useEffect } from 'react';

export default function PaymentScreen() {
  const [payUrl, setPayUrl] = useState<string>('');

  useEffect(() => {
    // Gọi API từ Backend của bạn
    fetch("http://192.168.5.1:5000/create-vnpay-qr", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 50000 }) 
    })
    .then(res => res.json())
    .then(data => setPayUrl(data.paymentUrl));
  }, []);

  // SỬA LỖI TẠI ĐÂY: Thêm kiểu dữ liệu WebViewNavigation cho navState
  const handleResponse = (navState: any) => { 
  // Kiểm tra nếu URL chuyển hướng về trang kết quả mà bạn đã đặt ở Backend
  if (navState.url.includes("payment-result")) {
    
    // Kiểm tra mã phản hồi từ VNPAY trong URL
    if (navState.url.includes("vnp_ResponseCode=00")) {
      alert("🎉 Thanh toán QR thành công!");
    } else {
      alert("❌ Thanh toán thất bại hoặc đã bị hủy.");
    }

    // Sau khi thông báo xong, quay về trang chủ hoặc trang đơn hàng
    router.replace('/explore'); 
  }
};

  return payUrl ? (
    <WebView 
      source={{ uri: payUrl }} 
      onNavigationStateChange={handleResponse} 
    />
  ) : null;
}