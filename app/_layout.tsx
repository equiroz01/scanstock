import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useProductStore } from '@/stores/useProductStore';
import { initializePhotoStorage } from '@/services/photos/photoStorage';
import { Toast } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import { I18nProvider } from '@/providers/I18nProvider';
import '../global.css';

function RootLayoutContent() {
  const loadProducts = useProductStore(state => state.loadProducts);
  const { visible, message, type, action, hide } = useToast();

  useEffect(() => {
    // Initialize app
    const initialize = async () => {
      await initializePhotoStorage();
      await loadProducts();
    };

    initialize();
  }, [loadProducts]);

  return (
    <View className="flex-1 bg-dark-50">
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#f8fafc' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="product/[id]"
          options={{
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="product/new"
          options={{
            presentation: 'modal',
          }}
        />
      </Stack>
      <Toast
        visible={visible}
        message={message}
        type={type}
        action={action}
        onHide={hide}
      />
    </View>
  );
}

export default function RootLayout() {
  return (
    <I18nProvider>
      <RootLayoutContent />
    </I18nProvider>
  );
}
