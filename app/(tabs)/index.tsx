import { useCallback, useState, useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Pressable,
  Animated,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProductStore } from '@/stores/useProductStore';
import { ProductCard } from '@/components/ProductCard';
import { SearchBar } from '@/components/SearchBar';
import { EmptyState } from '@/components/EmptyState';
import { InventoryLoadingSkeleton } from '@/components/SkeletonLoader';
import { SwipeableRow } from '@/components/SwipeableRow';
import { InventoryStats } from '@/components/InventoryStats';
import { AnimatedListItem } from '@/components/AnimatedListItem';
import { DeletableRow } from '@/components/AnimatedProductRow';
import { useToast } from '@/hooks/useToast';
import { useDebouncedSearch } from '@/hooks/useDebounce';
import { useI18n } from '@/i18n';

type SortOption = 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'stock_asc' | 'stock_desc' | 'recent';

type SortOptionConfig = { value: SortOption; labelKey: keyof typeof import('@/i18n/en').en.sort; icon: keyof typeof Ionicons.glyphMap };

const sortOptionsConfig: SortOptionConfig[] = [
  { value: 'recent', labelKey: 'recent', icon: 'time-outline' },
  { value: 'name_asc', labelKey: 'nameAZ', icon: 'text-outline' },
  { value: 'name_desc', labelKey: 'nameZA', icon: 'text-outline' },
  { value: 'price_asc', labelKey: 'priceLow', icon: 'trending-down-outline' },
  { value: 'price_desc', labelKey: 'priceHigh', icon: 'trending-up-outline' },
  { value: 'stock_asc', labelKey: 'stockLow', icon: 'alert-circle-outline' },
  { value: 'stock_desc', labelKey: 'stockHigh', icon: 'layers-outline' },
];

export default function InventoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { t } = useI18n();

  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'low' | 'out'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const fabScale = useRef(new Animated.Value(1)).current;
  const fabRotate = useRef(new Animated.Value(0)).current;
  const sortMenuAnim = useRef(new Animated.Value(0)).current;
  const refreshRotation = useRef(new Animated.Value(0)).current;
  const refreshScale = useRef(new Animated.Value(1)).current;
  const headerPulse = useRef(new Animated.Value(1)).current;
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Debounced search
  const {
    value: localSearchQuery,
    debouncedValue: debouncedSearchQuery,
    setValue: setLocalSearchQuery,
    clear: clearSearch,
    isSearching,
  } = useDebouncedSearch('', 300);

  const {
    products,
    searchQuery,
    isLoading,
    loadProducts,
    searchProducts,
    setSearchQuery,
    deleteProduct,
  } = useProductStore();

  // Execute search when debounced value changes
  useEffect(() => {
    if (debouncedSearchQuery) {
      setSearchQuery(debouncedSearchQuery);
      searchProducts(debouncedSearchQuery);
    } else if (debouncedSearchQuery === '' && searchQuery !== '') {
      setSearchQuery('');
      loadProducts();
    }
  }, [debouncedSearchQuery, setSearchQuery, searchProducts, loadProducts, searchQuery]);

  // Compute stats
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    return { totalProducts, totalStock, totalValue, lowStock, outOfStock };
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    switch (activeFilter) {
      case 'low':
        filtered = products.filter(p => p.stock > 0 && p.stock <= 5);
        break;
      case 'out':
        filtered = products.filter(p => p.stock === 0);
        break;
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'stock_asc':
          return a.stock - b.stock;
        case 'stock_desc':
          return b.stock - a.stock;
        case 'recent':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return sorted;
  }, [products, activeFilter, sortBy]);

  const handleFilterChange = (filter: 'all' | 'low' | 'out') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveFilter(prev => prev === filter ? 'all' : filter);
  };

  const toggleSortMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const toValue = showSortMenu ? 0 : 1;
    setShowSortMenu(!showSortMenu);
    Animated.spring(sortMenuAnim, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  const handleSortChange = (option: SortOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSortBy(option);
    setShowSortMenu(false);
    Animated.timing(sortMenuAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const currentSort = sortOptionsConfig.find(o => o.value === sortBy);

  // Animated refresh
  useEffect(() => {
    if (refreshing) {
      Animated.loop(
        Animated.timing(refreshRotation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        })
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(refreshScale, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: false,
          }),
          Animated.timing(refreshScale, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      refreshRotation.stopAnimation();
      refreshScale.stopAnimation();
      refreshRotation.setValue(0);
      refreshScale.setValue(1);
    }
  }, [refreshing, refreshRotation, refreshScale]);

  const handleRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRefreshing(true);

    try {
      if (searchQuery) {
        await searchProducts(searchQuery);
      } else {
        await loadProducts();
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Animated.sequence([
        Animated.timing(headerPulse, {
          toValue: 1.02,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(headerPulse, {
          toValue: 1,
          useNativeDriver: true,
          friction: 3,
        }),
      ]).start();

      toast.success(t.inventory.updated);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.error(t.inventory.failedRefresh);
    } finally {
      setRefreshing(false);
    }
  }, [searchQuery, searchProducts, loadProducts, toast, headerPulse, t]);

  const handleSearch = useCallback(
    (query: string) => {
      setLocalSearchQuery(query);
    },
    [setLocalSearchQuery]
  );

  const handleClearSearch = useCallback(() => {
    clearSearch();
    loadProducts();
  }, [clearSearch, loadProducts]);

  const handleProductPress = useCallback(
    (productId: string) => {
      router.push(`/product/${productId}`);
    },
    [router]
  );

  const handleDeleteProduct = useCallback(
    (productId: string, productName: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert(
        t.products.deleteProduct,
        `${t.products.deleteConfirm.replace('this product', `"${productName}"`)}`,
        [
          {
            text: t.common.cancel,
            style: 'cancel',
          },
          {
            text: t.common.delete,
            style: 'destructive',
            onPress: () => {
              setDeletingProductId(productId);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            },
          },
        ]
      );
    },
    [t]
  );

  const executeDelete = useCallback(
    async (productId: string, productName: string) => {
      try {
        await deleteProduct(productId);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        toast.success(`"${productName}" ${t.products.deleted}`);
      } catch {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        toast.error(t.errors.failedDelete);
      } finally {
        setDeletingProductId(null);
      }
    },
    [deleteProduct, toast, t]
  );

  const handleEditProduct = useCallback(
    (productId: string) => {
      router.push(`/product/${productId}`);
    },
    [router]
  );

  const handleFabPressIn = () => {
    Animated.parallel([
      Animated.spring(fabScale, {
        toValue: 0.9,
        useNativeDriver: true,
        speed: 50,
      }),
      Animated.timing(fabRotate, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleFabPressOut = () => {
    Animated.parallel([
      Animated.spring(fabScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 8,
      }),
      Animated.timing(fabRotate, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const fabRotation = fabRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '15deg'],
  });

  const renderHeader = () => (
    <View className="mb-2">
      {/* Stats Dashboard - always visible (except when searching) */}
      {!localSearchQuery && (
        <InventoryStats
          totalProducts={stats.totalProducts}
          totalStock={stats.totalStock}
          totalValue={stats.totalValue}
          lowStock={stats.lowStock}
          outOfStock={stats.outOfStock}
          onFilterPress={handleFilterChange}
        />
      )}

      {/* Results count when searching */}
      {localSearchQuery && (
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-dark-500 text-sm">
            {isSearching ? t.common.loading : `${products.length} ${products.length === 1 ? t.common.result : t.common.results}`} {t.common.for} "{localSearchQuery}"
          </Text>
          <Pressable onPress={handleClearSearch}>
            <Text className="text-primary-600 text-sm font-medium">{t.common.clear}</Text>
          </Pressable>
        </View>
      )}

      {/* Section header + Sort */}
      {!localSearchQuery && (
        <View className="mb-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold text-dark-900">
              {t.inventory.recentProducts}
            </Text>
            <View className="flex-row items-center">
              {/* Sort Button */}
              <Pressable
                onPress={toggleSortMenu}
                className={`px-3 py-1.5 border flex-row items-center ${
                  showSortMenu ? 'bg-dark-100 border-dark-300' : 'bg-white border-dark-200'
                }`}
                style={{ borderRadius: 9999 }}
              >
                <Ionicons
                  name={currentSort?.icon || 'swap-vertical'}
                  size={14}
                  color="#475569"
                />
                <Text className="text-dark-600 text-xs font-medium ml-1">
                  {t.sort[currentSort?.labelKey || 'recent']}
                </Text>
                <Ionicons
                  name={showSortMenu ? 'chevron-up' : 'chevron-down'}
                  size={12}
                  color="#94a3b8"
                  style={{ marginLeft: 2 }}
                />
              </Pressable>
            </View>
          </View>

          {/* Sort Dropdown Menu */}
          {showSortMenu && (
            <Animated.View
              style={{
                opacity: sortMenuAnim,
                transform: [{
                  translateY: sortMenuAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0],
                  }),
                }],
              }}
              className="bg-white rounded-2xl border border-dark-200 overflow-hidden mt-2"
            >
              {sortOptionsConfig.map((option, index) => (
                <Pressable
                  key={option.value}
                  onPress={() => handleSortChange(option.value)}
                  className={`flex-row items-center px-4 py-3 ${
                    index < sortOptionsConfig.length - 1 ? 'border-b border-dark-100' : ''
                  } ${sortBy === option.value ? 'bg-primary-50' : ''}`}
                >
                  <Ionicons
                    name={option.icon}
                    size={18}
                    color={sortBy === option.value ? '#30638e' : '#64748b'}
                  />
                  <Text
                    className={`flex-1 ml-3 font-medium ${
                      sortBy === option.value ? 'text-primary-700' : 'text-dark-700'
                    }`}
                  >
                    {t.sort[option.labelKey]}
                  </Text>
                  {sortBy === option.value && (
                    <Ionicons name="checkmark" size={18} color="#30638e" />
                  )}
                </Pressable>
              ))}
            </Animated.View>
          )}
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: '#f5f6fa' }}>
      {/* Header with App Icon + Search */}
      <View
        className="bg-white"
        style={{ paddingTop: insets.top, overflow: 'visible' }}
      >
        <Animated.View
          className="px-4 py-3"
          style={{ transform: [{ scale: headerPulse }], overflow: 'visible' }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: '#eff6ff' }}
              >
                <Ionicons name="cube" size={22} color="#2563eb" />
              </View>
              <Text className="text-2xl font-bold text-dark-900">ScanStock</Text>
            </View>
            <Pressable
              onPress={() => router.push('/product/new')}
              className="items-center justify-center"
              accessibilityLabel="Add new product"
              accessibilityRole="button"
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: '#ffffff',
                borderWidth: 1.5,
                borderColor: '#e2e8f0',
              }}
            >
              <Ionicons name="add" size={24} color="#1e293b" />
            </Pressable>
          </View>
          <SearchBar
            value={localSearchQuery}
            onChangeText={handleSearch}
            placeholder={t.products.searchProducts}
            onClear={handleClearSearch}
            isSearching={isSearching}
            onFilterPress={toggleSortMenu}
          />
        </Animated.View>
      </View>

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        renderItem={({ item, index }) => (
          <AnimatedListItem index={index} delay={40} duration={250}>
            <DeletableRow
              isDeleting={deletingProductId === item.id}
              onAnimationComplete={() => executeDelete(item.id, item.name)}
            >
              <SwipeableRow
                leftActions={[
                  {
                    icon: 'create-outline',
                    color: '#ffffff',
                    backgroundColor: '#30638e',
                    onPress: () => handleEditProduct(item.id),
                  },
                ]}
                rightActions={[
                  {
                    icon: 'trash-outline',
                    color: '#ffffff',
                    backgroundColor: '#dc2626',
                    onPress: () => handleDeleteProduct(item.id, item.name),
                  },
                ]}
              >
                <ProductCard
                  product={item}
                  onPress={() => handleProductPress(item.id)}
                  searchQuery={localSearchQuery}
                />
              </SwipeableRow>
            </DeletableRow>
          </AnimatedListItem>
        )}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 100,
          flexGrow: 1,
        }}
        ListEmptyComponent={
          isLoading ? (
            <InventoryLoadingSkeleton />
          ) : (
            <EmptyState
              icon={activeFilter === 'out' ? 'checkmark-circle-outline' : activeFilter === 'low' ? 'thumbs-up-outline' : 'cube-outline'}
              title={
                searchQuery
                  ? t.products.noResults
                  : activeFilter === 'low'
                  ? t.products.noLowStock
                  : activeFilter === 'out'
                  ? t.products.noOutOfStock
                  : t.products.noProducts
              }
              description={
                searchQuery
                  ? t.products.tryDifferentSearch
                  : activeFilter !== 'all'
                  ? t.products.inventoryGoodShape
                  : t.products.noProductsDescription
              }
              actionLabel={!searchQuery && activeFilter === 'all' ? t.common.add : undefined}
              onAction={!searchQuery && activeFilter === 'all' ? () => router.push('/product/new') : undefined}
            />
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#30638e"
            colors={['#30638e', '#5fad41', '#4a90b8']}
            progressBackgroundColor="#ffffff"
            title={refreshing ? t.inventory.updatingInventory : t.inventory.pullToRefresh}
            titleColor="#64748b"
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* FAB - Scanner shortcut */}
      <Animated.View
        style={{
          transform: [{ scale: fabScale }, { rotate: fabRotation }],
          position: 'absolute',
          bottom: 100,
          right: 20,
        }}
      >
        <Pressable
          onPress={() => router.push('/scanner')}
          onPressIn={handleFabPressIn}
          onPressOut={handleFabPressOut}
          className="items-center justify-center overflow-hidden"
          accessibilityLabel="Open barcode scanner"
          accessibilityRole="button"
          accessibilityHint="Scan a barcode to add or find a product"
          style={{
            width: 72,
            height: 72,
            borderRadius: 22,
            shadowColor: '#003d5b',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 12,
          }}
        >
          <LinearGradient
            colors={['#7bc45c', '#5fad41', '#4a9432', '#3d7a2a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-full h-full items-center justify-center"
            style={{ borderRadius: 22 }}
          >
            <View
              className="absolute inset-0 items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 22 }}
            />
            <Ionicons name="scan" size={32} color="white" />
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}
