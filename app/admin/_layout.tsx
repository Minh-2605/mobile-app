import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: 'Quản lý sản phẩm' }} />
      <Stack.Screen name="add-product" options={{ title: 'Thêm món mới' }} />
      <Stack.Screen name="edit/[id]" options={{ title: 'Chỉnh sửa' }} />
    </Stack>
  );
}