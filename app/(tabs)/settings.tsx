import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePlanStore } from '@/stores/usePlanStore';
import { useProductStore } from '@/stores/useProductStore';
import { PLANS } from '@/constants/plans';
import { Card } from '@/components/ui/Card';

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
  rightContent?: React.ReactNode;
  disabled?: boolean;
}

function SettingsItem({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  rightContent,
  disabled = false,
}: SettingsItemProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center py-3 px-4 ${disabled ? 'opacity-50' : ''}`}
    >
      <View className="w-10 h-10 rounded-xl bg-dark-100 items-center justify-center mr-3">
        <Ionicons name={icon} size={22} color="#475569" />
      </View>
      <View className="flex-1">
        <Text className="text-dark-900 text-base font-medium">{title}</Text>
        {subtitle && (
          <Text className="text-dark-500 text-sm mt-0.5">{subtitle}</Text>
        )}
      </View>
      {rightContent}
      {showChevron && (
        <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
      )}
    </Pressable>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-6">
      <Text className="text-dark-500 text-sm font-medium uppercase tracking-wide px-4 mb-2">
        {title}
      </Text>
      <Card className="py-0 px-0 overflow-hidden">
        {children}
      </Card>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const plan = usePlanStore(state => state.plan);
  const products = useProductStore(state => state.products);
  const planInfo = PLANS[plan];

  const isProLocal = plan === 'pro_local' || plan === 'pro_cloud';

  const handleBackup = () => {
    if (!isProLocal) {
      Alert.alert(
        'Pro Feature',
        'Upgrade to Pro to backup your data',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/settings/backup') },
        ]
      );
      return;
    }
    router.push('/settings/backup');
  };

  const handleExportCSV = () => {
    if (!isProLocal) {
      Alert.alert(
        'Pro Feature',
        'Upgrade to Pro to export your data',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/settings/backup') },
        ]
      );
      return;
    }
    Alert.alert('Export CSV', 'Coming soon!');
  };

  return (
    <ScrollView className="flex-1 bg-dark-50" contentContainerStyle={{ paddingVertical: 16 }}>
      {/* Plan Status */}
      <View className="px-4 mb-6">
        <Card className="bg-primary-600">
          <View className="flex-row items-center">
            <View className="flex-1">
              <Text className="text-primary-100 text-sm font-medium">
                Current Plan
              </Text>
              <Text className="text-white text-xl font-bold mt-1">
                {planInfo.name}
              </Text>
            </View>
            {plan === 'free' && (
              <Pressable
                onPress={() => router.push('/settings/backup')}
                className="bg-white px-4 py-2 rounded-xl"
              >
                <Text className="text-primary-600 font-semibold">Upgrade</Text>
              </Pressable>
            )}
          </View>
        </Card>
      </View>

      {/* Stats */}
      <SettingsSection title="Statistics">
        <SettingsItem
          icon="cube-outline"
          title="Total Products"
          subtitle={`${products.length} items in inventory`}
          onPress={() => {}}
          showChevron={false}
        />
      </SettingsSection>

      {/* Data Management */}
      <SettingsSection title="Data">
        <SettingsItem
          icon="cloud-upload-outline"
          title="Backup"
          subtitle={isProLocal ? 'Backup your data' : 'Pro feature'}
          onPress={handleBackup}
          rightContent={
            !isProLocal ? (
              <View className="bg-primary-100 px-2 py-1 rounded-md mr-2">
                <Text className="text-primary-600 text-xs font-semibold">PRO</Text>
              </View>
            ) : undefined
          }
        />
        <View className="h-px bg-dark-100 mx-4" />
        <SettingsItem
          icon="download-outline"
          title="Export CSV"
          subtitle={isProLocal ? 'Export product list' : 'Pro feature'}
          onPress={handleExportCSV}
          rightContent={
            !isProLocal ? (
              <View className="bg-primary-100 px-2 py-1 rounded-md mr-2">
                <Text className="text-primary-600 text-xs font-semibold">PRO</Text>
              </View>
            ) : undefined
          }
        />
      </SettingsSection>

      {/* App Info */}
      <SettingsSection title="About">
        <SettingsItem
          icon="information-circle-outline"
          title="Version"
          subtitle="1.0.0"
          onPress={() => {}}
          showChevron={false}
        />
      </SettingsSection>

      {/* Warning */}
      {plan === 'free' && (
        <View className="px-4 mt-2">
          <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex-row">
            <Ionicons name="warning-outline" size={24} color="#d97706" />
            <View className="flex-1 ml-3">
              <Text className="text-amber-800 font-semibold">No backup</Text>
              <Text className="text-amber-700 text-sm mt-1">
                Your data is only stored on this device. Upgrade to Pro to backup and protect your data.
              </Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
