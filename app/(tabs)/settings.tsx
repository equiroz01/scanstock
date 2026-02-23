import { View, Text, ScrollView, Pressable, Alert, Animated, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlanStore } from '@/stores/usePlanStore';
import { useProductStore } from '@/stores/useProductStore';
import { PLANS } from '@/constants/plans';
import { ProBadge } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils/currency';
import { useI18n, type Language } from '@/i18n';

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBg?: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
  rightContent?: React.ReactNode;
  disabled?: boolean;
  destructive?: boolean;
}

function SettingsItem({
  icon,
  iconColor = '#30638e',
  iconBg = 'bg-primary-100',
  title,
  subtitle,
  onPress,
  showChevron = true,
  rightContent,
  disabled = false,
  destructive = false,
}: SettingsItemProps) {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        className={`flex-row items-center py-4 px-4 ${disabled ? 'opacity-50' : ''}`}
        style={({ pressed }) => [pressed && { backgroundColor: '#f7f8f8' }]}
      >
        <View className={`w-11 h-11 rounded-xl ${iconBg} items-center justify-center mr-4`}>
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
        <View className="flex-1">
          <Text className={`text-base font-semibold ${destructive ? 'text-error-600' : 'text-dark-900'}`}>
            {title}
          </Text>
          {subtitle && (
            <Text className="text-dark-400 text-sm mt-0.5">{subtitle}</Text>
          )}
        </View>
        {rightContent}
        {showChevron && (
          <Ionicons name="chevron-forward" size={20} color="#9299a3" />
        )}
      </Pressable>
    </Animated.View>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-6">
      <Text className="text-dark-400 text-xs font-bold uppercase tracking-wider px-4 mb-3">
        {title}
      </Text>
      <View
        className="bg-white mx-4 rounded-2xl overflow-hidden"
        style={{ borderWidth: 1, borderColor: '#edf0f2' }}
      >
        {children}
      </View>
    </View>
  );
}

function Divider() {
  return <View className="h-px bg-dark-100 ml-[72px]" />;
}

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, language, setLanguage } = useI18n();
  const plan = usePlanStore(state => state.plan);
  const products = useProductStore(state => state.products);
  const planInfo = PLANS[plan];
  const cardScale = useRef(new Animated.Value(1)).current;
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const isProLocal = plan === 'pro_local' || plan === 'pro_cloud';

  // Calculate stats
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  const handleCardPressIn = () => {
    Animated.spring(cardScale, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handleCardPressOut = () => {
    Animated.spring(cardScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handleBackup = () => {
    router.push('/settings/backup');
  };

  const handleExportCSV = async () => {
    if (!isProLocal) {
      Alert.alert(
        t.settings.proFeature,
        t.settings.upgradeToExport,
        [
          { text: t.common.cancel, style: 'cancel' },
          { text: t.settings.upgrade, onPress: () => router.push('/settings/backup') },
        ]
      );
      return;
    }
    const { exportToCSV } = await import('@/services/backup/exportCSV');
    try {
      await exportToCSV();
    } catch (error) {
      Alert.alert(t.common.error, t.settings.failedExportCSV);
    }
  };

  const handleExportPDF = async () => {
    if (!isProLocal) {
      Alert.alert(
        t.settings.proFeature,
        t.settings.upgradeToExport,
        [
          { text: t.common.cancel, style: 'cancel' },
          { text: t.settings.upgrade, onPress: () => router.push('/settings/backup') },
        ]
      );
      return;
    }
    const { exportToPDF } = await import('@/services/backup/exportPDF');
    try {
      await exportToPDF();
    } catch (error) {
      Alert.alert(t.common.error, t.settings.failedExportPDF);
    }
  };

  const getLanguageDisplayName = (lang: Language): string => {
    return lang === 'en' ? t.settings.english : t.settings.spanish;
  };

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setShowLanguageModal(false);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: '#f5f6fa' }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          className="bg-white"
          style={{ paddingTop: insets.top + 8 }}
        >
          <View className="px-4 pb-6">
            <Text className="text-2xl font-bold text-dark-900">{t.settings.title}</Text>
          </View>
        </View>

        {/* Plan Card */}
        <View className="px-4 py-2">
          <Animated.View style={{ transform: [{ scale: cardScale }] }}>
            <Pressable
              onPress={() => router.push('/settings/backup')}
              onPressIn={handleCardPressIn}
              onPressOut={handleCardPressOut}
            >
              <View
                className="rounded-3xl overflow-hidden"
                style={{
                  shadowColor: '#1a2433',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  elevation: 4,
                }}
              >
                <LinearGradient
                  colors={plan === 'free' ? ['#4a90b8', '#30638e', '#003d5b'] : ['#5fad41', '#2d936c', '#1f6249']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="p-6"
                >

                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-3">
                        <View
                          className="px-4 py-2"
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            borderWidth: 1.5,
                            borderColor: 'rgba(255,255,255,0.3)',
                            borderRadius: 9999,
                          }}
                        >
                          <Text className="text-white text-xs font-bold uppercase tracking-wider">
                            {plan === 'free' ? t.settings.freePlan : t.settings.proPlan}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-white text-3xl font-bold mb-2">
                        {planInfo.name}
                      </Text>
                      <Text style={{ color: 'rgba(255,255,255,0.8)' }} className="text-sm leading-5">
                        {plan === 'free'
                          ? t.settings.unlockFeatures
                          : t.settings.allFeaturesUnlocked}
                      </Text>
                    </View>
                    <View
                      className="w-16 h-16 rounded-2xl items-center justify-center"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        borderWidth: 1.5,
                        borderColor: 'rgba(255,255,255,0.25)',
                      }}
                    >
                      <Ionicons
                        name={plan === 'free' ? 'rocket' : 'shield-checkmark'}
                        size={32}
                        color="white"
                      />
                    </View>
                  </View>

                  {plan === 'free' && (
                    <View
                      className="mt-5 rounded-2xl px-6 py-4 flex-row items-center justify-center"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderWidth: 1.5,
                        borderColor: 'rgba(255,255,255,0.35)',
                      }}
                    >
                      <Ionicons name="sparkles" size={22} color="white" />
                      <Text className="text-white font-bold ml-3 text-base">{t.settings.upgradeToPro}</Text>
                      <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 10 }} />
                    </View>
                  )}
                </LinearGradient>
              </View>
            </Pressable>
          </Animated.View>
        </View>

        {/* Quick Stats */}
        <View className="flex-row px-4 py-4 gap-3">
          <View
            className="flex-1 bg-white rounded-2xl items-center py-4 px-2"
            style={{ borderWidth: 1, borderColor: '#edf0f2' }}
          >
            <View
              className="w-11 h-11 rounded-xl items-center justify-center mb-2.5"
              style={{ backgroundColor: '#f0f4f8' }}
            >
              <Ionicons name="cube-outline" size={22} color="#4a90b8" />
            </View>
            <Text className="text-2xl font-bold text-dark-900 mb-0.5">{products.length}</Text>
            <Text className="text-xs text-dark-400">{t.products.title}</Text>
          </View>

          <View
            className="flex-1 bg-white rounded-2xl items-center py-4 px-2"
            style={{ borderWidth: 1, borderColor: '#edf0f2' }}
          >
            <View
              className="w-11 h-11 rounded-xl items-center justify-center mb-2.5"
              style={{ backgroundColor: '#f0f4f8' }}
            >
              <Ionicons name="wallet-outline" size={22} color="#4a90b8" />
            </View>
            <Text className="text-2xl font-bold text-dark-900 mb-0.5">{formatCurrency(totalValue)}</Text>
            <Text className="text-xs text-dark-400">{t.settings.totalValue}</Text>
          </View>
        </View>

        {/* Alerts */}
        {(lowStockCount > 0 || outOfStockCount > 0) && (
          <View className="px-4 mb-4">
            <Pressable
              className="bg-warning-50 rounded-2xl p-4 border border-warning-200 flex-row items-center"
            >
              <View className="w-12 h-12 rounded-xl bg-warning-100 items-center justify-center">
                <Ionicons name="alert-circle" size={24} color="#d97706" />
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-warning-800 font-bold text-base">{t.settings.stockAlerts}</Text>
                <Text className="text-warning-700 text-sm mt-0.5">
                  {outOfStockCount > 0 && `${outOfStockCount} ${t.settings.outOfStockCount}`}
                  {outOfStockCount > 0 && lowStockCount > 0 && ' • '}
                  {lowStockCount > 0 && `${lowStockCount} ${t.settings.lowStockCount}`}
                </Text>
              </View>
              <View className="w-8 h-8 rounded-lg bg-warning-100 items-center justify-center">
                <Ionicons name="chevron-forward" size={18} color="#d97706" />
              </View>
            </Pressable>
          </View>
        )}

        {/* Data Management */}
        <SettingsSection title={t.settings.dataManagement}>
          <SettingsItem
            icon="cloud-upload"
            iconColor="#30638e"
            iconBg="bg-primary-100"
            title={t.settings.backupRestore}
            subtitle={t.settings.saveDataSecurely}
            onPress={handleBackup}
            rightContent={!isProLocal ? <ProBadge /> : undefined}
          />
          <Divider />
          <SettingsItem
            icon="document-text"
            iconColor="#5fad41"
            iconBg="bg-accent-100"
            title={t.settings.exportCSV}
            subtitle={t.settings.spreadsheetFormat}
            onPress={handleExportCSV}
            rightContent={!isProLocal ? <ProBadge /> : undefined}
          />
          <Divider />
          <SettingsItem
            icon="document"
            iconColor="#dc2626"
            iconBg="bg-error-100"
            title={t.settings.exportPDF}
            subtitle={t.settings.printableReport}
            onPress={handleExportPDF}
            rightContent={!isProLocal ? <ProBadge /> : undefined}
          />
        </SettingsSection>

        {/* Preferences */}
        <SettingsSection title={t.settings.preferences}>
          <SettingsItem
            icon="language"
            iconColor="#30638e"
            iconBg="bg-primary-100"
            title={t.settings.language}
            subtitle={getLanguageDisplayName(language)}
            onPress={() => setShowLanguageModal(true)}
          />
          <Divider />
          <SettingsItem
            icon="notifications"
            iconColor="#9299a3"
            iconBg="bg-dark-100"
            title={t.settings.notifications}
            subtitle={t.settings.comingSoon}
            onPress={() => {}}
            disabled
          />
          <Divider />
          <SettingsItem
            icon="moon"
            iconColor="#9299a3"
            iconBg="bg-dark-100"
            title={t.settings.appearance}
            subtitle={t.settings.comingSoon}
            onPress={() => {}}
            disabled
          />
        </SettingsSection>

        {/* About */}
        <SettingsSection title={t.settings.about}>
          <SettingsItem
            icon="information-circle"
            iconColor="#6e7785"
            iconBg="bg-dark-100"
            title={t.settings.appVersion}
            subtitle="1.0.0"
            onPress={() => {}}
            showChevron={false}
          />
          <Divider />
          <SettingsItem
            icon="help-circle"
            iconColor="#6e7785"
            iconBg="bg-dark-100"
            title={t.settings.helpSupport}
            subtitle={t.settings.faqsContact}
            onPress={() => Alert.alert(t.settings.help, t.settings.visitWebsite)}
          />
          <Divider />
          <SettingsItem
            icon="star"
            iconColor="#f59e0b"
            iconBg="bg-warning-100"
            title={t.settings.rateApp}
            subtitle={t.settings.rateAppSubtitle}
            onPress={() => Alert.alert(t.settings.thankYou, t.settings.thanksForSupport)}
          />
        </SettingsSection>

        {/* Backup Warning for Free users */}
        {plan === 'free' && (
          <View className="px-4 mb-6">
            <View
              className="bg-warning-50 rounded-2xl p-5 border border-warning-200"
            >
              <View className="flex-row items-start">
                <View className="w-12 h-12 rounded-xl bg-warning-100 items-center justify-center">
                  <Ionicons name="shield-outline" size={24} color="#b45309" />
                </View>
                <View className="flex-1 ml-4">
                  <Text className="text-warning-800 font-bold text-base">{t.settings.dataNotBackedUp}</Text>
                  <Text className="text-warning-700 text-sm mt-1 leading-5">
                    {t.settings.dataNotBackedUpDescription}
                  </Text>
                  <Pressable
                    onPress={() => router.push('/settings/backup')}
                    className="mt-4 overflow-hidden rounded-xl self-start"
                  >
                    <LinearGradient
                      colors={['#f59e0b', '#d97706']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="px-5 py-2.5"
                    >
                      <Text className="text-white font-semibold">{t.settings.backupNow}</Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setShowLanguageModal(false)}
        >
          <Pressable
            className="bg-white rounded-t-3xl"
            style={{ paddingBottom: insets.bottom + 16 }}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View className="flex-row items-center justify-between px-6 py-5 border-b border-dark-100">
              <Text className="text-lg font-bold text-dark-900">{t.settings.language}</Text>
              <Pressable
                onPress={() => setShowLanguageModal(false)}
                className="w-8 h-8 rounded-full bg-dark-100 items-center justify-center"
              >
                <Ionicons name="close" size={20} color="#475569" />
              </Pressable>
            </View>

            {/* Language Options */}
            <View className="px-4 py-3">
              {/* English */}
              <Pressable
                onPress={() => handleLanguageSelect('en')}
                className="flex-row items-center py-4 px-4 rounded-xl mb-2"
                style={({ pressed }) => [
                  {
                    backgroundColor: language === 'en' ? '#e8f4fc' : pressed ? '#f7f8f8' : 'transparent',
                    borderWidth: language === 'en' ? 1.5 : 0,
                    borderColor: '#30638e',
                  },
                ]}
              >
                <View className="w-12 h-12 rounded-xl bg-dark-100 items-center justify-center mr-4">
                  <Text className="text-2xl">🇺🇸</Text>
                </View>
                <View className="flex-1">
                  <Text className={`text-base font-semibold ${language === 'en' ? 'text-primary-700' : 'text-dark-900'}`}>
                    English
                  </Text>
                  <Text className="text-dark-400 text-sm">United States</Text>
                </View>
                {language === 'en' && (
                  <View className="w-6 h-6 rounded-full bg-primary-600 items-center justify-center">
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                )}
              </Pressable>

              {/* Spanish */}
              <Pressable
                onPress={() => handleLanguageSelect('es')}
                className="flex-row items-center py-4 px-4 rounded-xl"
                style={({ pressed }) => [
                  {
                    backgroundColor: language === 'es' ? '#e8f4fc' : pressed ? '#f7f8f8' : 'transparent',
                    borderWidth: language === 'es' ? 1.5 : 0,
                    borderColor: '#30638e',
                  },
                ]}
              >
                <View className="w-12 h-12 rounded-xl bg-dark-100 items-center justify-center mr-4">
                  <Text className="text-2xl">🇪🇸</Text>
                </View>
                <View className="flex-1">
                  <Text className={`text-base font-semibold ${language === 'es' ? 'text-primary-700' : 'text-dark-900'}`}>
                    Español
                  </Text>
                  <Text className="text-dark-400 text-sm">España / Latinoamérica</Text>
                </View>
                {language === 'es' && (
                  <View className="w-6 h-6 rounded-full bg-primary-600 items-center justify-center">
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
