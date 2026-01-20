import { WebView } from 'react-native-webview';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { ActivityIndicator, View, Alert } from 'react-native';

export default function PaymentScreen() {
  const [payUrl, setPayUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const { total } = useLocalSearchParams(); // Nhận total từ checkout.tsx

  useEffect(() => {
    // Kiểm tra nếu không có tiền thì không gọi API
    const finalAmount = total ? Number(total) : 0;

    console.log("Frontend đang gửi lên Server số tiền:", finalAmount);

    if (finalAmount <= 0) {
      Alert.alert("Lỗi", "Không nhận được số tiền từ giỏ hàng!");
      return;
    }

    fetch("http://192.168.100.220:5000/create-vnpay-qr", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: finalAmount }) // GỬI BIẾN FINALAMOUNT
    })
      .then(res => res.json())
      .then(data => {
        if (data.paymentUrl) {
          setPayUrl(data.paymentUrl);
        } else {
          Alert.alert("Lỗi", "Server không tạo được link thanh toán");
        }
      })
      .catch(err => {
        Alert.alert("Lỗi kết nối", "Không thể kết nối tới Server");
      })
      .finally(() => setLoading(false));
  }, [total]);

  const handleResponse = (navState: any) => {
    // Kiểm tra returnUrl từ Server gửi về (phải trùng với vnp_ReturnUrl)
    if (navState.url.includes("payment-result")) {

      // Kiểm tra ResponseCode 00 là thành công
      if (navState.url.includes("vnp_ResponseCode=00")) {
        Alert.alert("🎉 Thành công", "Đã nhận được thanh toán!");
      } else {
        Alert.alert("❌ Thất bại", "Giao dịch không thành công hoặc đã bị hủy.");
      }

      // Sau khi thông báo, quay về màn hình chính
      router.replace('/explore');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#F8B400" />
      </View>
    );
  }

  return payUrl ? (
    <WebView
      source={{ uri: payUrl }}
      onNavigationStateChange={handleResponse}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={true}
      scalesPageToFit={true} // Giúp giao diện VNPAY vừa vặn màn hình điện thoại
    />
  ) : null;
}