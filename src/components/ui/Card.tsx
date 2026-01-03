import { View, Pressable } from 'react-native';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  className?: string;
}

export function Card({ children, onPress, className = '' }: CardProps) {
  const baseStyles = 'bg-white rounded-2xl p-4 shadow-sm border border-dark-100';

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={`${baseStyles} active:bg-dark-50 ${className}`}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View className={`${baseStyles} ${className}`}>
      {children}
    </View>
  );
}
