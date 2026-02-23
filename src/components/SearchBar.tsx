import { View, TextInput, Pressable, Animated, ActivityIndicator, Text } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  isSearching?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  onClear,
  isSearching = false,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;
  const searchingAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Focus animation
  useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, borderAnim]);

  // Searching indicator animation
  useEffect(() => {
    if (isSearching) {
      // Fade in and start pulse
      Animated.timing(searchingAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();

      // Pulse animation
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      return () => pulse.stop();
    } else {
      // Fade out
      Animated.timing(searchingAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
      pulseAnim.setValue(1);
    }
  }, [isSearching, searchingAnim, pulseAnim]);

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChangeText('');
    onClear?.();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#edf0f2', '#30638e'],
  });

  const backgroundColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#f5f6fa', '#ffffff'],
  });

  return (
    <Animated.View
      style={{
        borderColor,
        backgroundColor,
        borderWidth: 1.5,
        borderRadius: 16,
      }}
    >
      <View className="flex-row items-center px-4 py-2.5">
        {/* Search/Loading Icon */}
        <View className="w-5 h-5 items-center justify-center">
          {isSearching ? (
            <Animated.View
              style={{
                opacity: searchingAnim,
                transform: [{ scale: pulseAnim }],
              }}
            >
              <ActivityIndicator size="small" color="#30638e" />
            </Animated.View>
          ) : (
            <Ionicons
              name="search"
              size={20}
              color={isFocused ? '#30638e' : '#9ca3af'}
            />
          )}
        </View>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          className="flex-1 ml-2 text-dark-900 text-base py-1"
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessibilityLabel="Search products"
          accessibilityHint="Type to search by product name or barcode"
        />

        {/* Clear button or searching indicator text */}
        {value.length > 0 && (
          <View className="flex-row items-center">
            {isSearching && (
              <Animated.View
                style={{ opacity: searchingAnim }}
                className="mr-2"
              >
                <View className="px-2 py-0.5 bg-primary-100" style={{ borderRadius: 9999 }}>
                  <Text className="text-primary-700 text-xs font-medium">
                    Searching...
                  </Text>
                </View>
              </Animated.View>
            )}
            <Pressable
              onPress={handleClear}
              className="p-1"
              accessibilityLabel="Clear search"
              accessibilityRole="button"
            >
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </Pressable>
          </View>
        )}
      </View>
    </Animated.View>
  );
}
