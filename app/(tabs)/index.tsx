import { useCallback, useState } from 'react';
import { View, FlatList, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProductStore } from '@/stores/useProductStore';
import { ProductCard } from '@/components/ProductCard';
import { SearchBar } from '@/components/SearchBar';
import { EmptyState } from '@/components/EmptyState';

export default function InventoryScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const {
    products,
    searchQuery,
    isLoading,
    loadProducts,
    searchProducts,
    setSearchQuery,
    updateStock,
  } = useProductStore();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    if (searchQuery) {
      await searchProducts(searchQuery);
    } else {
      await loadProducts();
    }
    setRefreshing(false);
  }, [searchQuery, searchProducts, loadProducts]);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      searchProducts(query);
    },
    [setSearchQuery, searchProducts]
  );

  const handleProductPress = useCallback(
    (productId: string) => {
      router.push(`/product/${productId}`);
    },
    [router]
  );

  const handleAddProduct = useCallback(() => {
    router.push('/product/new');
  }, [router]);

  return (
    <View className="flex-1 bg-dark-50">
      {/* Search Bar */}
      <View className="px-4 py-3 bg-white border-b border-dark-100">
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search products..."
          onClear={() => loadProducts()}
        />
      </View>

      {/* Product List */}
      <FlatList
        data={products}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => handleProductPress(item.id)}
            onIncrement={() => updateStock(item.id, 1)}
            onDecrement={() => updateStock(item.id, -1)}
          />
        )}
        contentContainerStyle={{
          padding: 16,
          flexGrow: 1,
        }}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="cube-outline"
              title="No products yet"
              description="Add your first product by tapping the + button"
            />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#4f46e5"
          />
        }
      />

      {/* FAB Add Product */}
      <Pressable
        onPress={handleAddProduct}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary-600 items-center justify-center shadow-lg active:bg-primary-700"
        style={{
          shadowColor: '#4f46e5',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Ionicons name="add" size={28} color="white" />
      </Pressable>
    </View>
  );
}
