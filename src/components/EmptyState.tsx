import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
}

export function EmptyState({ icon = 'cube-outline', title, description }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="w-20 h-20 rounded-full bg-dark-100 items-center justify-center mb-4">
        <Ionicons name={icon} size={40} color="#94a3b8" />
      </View>
      <Text className="text-dark-900 text-xl font-semibold text-center mb-2">
        {title}
      </Text>
      {description && (
        <Text className="text-dark-500 text-base text-center">
          {description}
        </Text>
      )}
    </View>
  );
}
