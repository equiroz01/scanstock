import { TextInput, View, Text } from 'react-native';
import { forwardRef } from 'react';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad' | 'email-address';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoFocus?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      value,
      onChangeText,
      placeholder,
      label,
      error,
      keyboardType = 'default',
      autoCapitalize = 'sentences',
      autoFocus,
      multiline,
      numberOfLines = 1,
      editable = true,
    },
    ref
  ) => {
    return (
      <View className="w-full">
        {label && (
          <Text className="text-dark-700 text-sm font-medium mb-1.5">{label}</Text>
        )}
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoFocus={autoFocus}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          className={`bg-dark-100 border rounded-xl px-4 py-3 text-dark-900 text-base ${
            error ? 'border-red-500' : 'border-dark-200'
          } ${!editable ? 'opacity-60' : ''} ${multiline ? 'min-h-[100px] text-top' : ''}`}
        />
        {error && (
          <Text className="text-red-500 text-sm mt-1">{error}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';
