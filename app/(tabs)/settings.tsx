import { View, Text, ScrollView, Pressable, Alert, Animated, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
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
  iconBgColor?: string;
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
  iconBgColor = '#dae6ef',
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
        style={{ opacity: disabled ? 0.5 : 1 }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 14,
            paddingHorizontal: 16,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: iconBgColor,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
            }}
          >
            <Ionicons name={icon} size={22} color={iconColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: destructive ? '#dc2626' : '#1a2433',
              }}
            >
              {title}
            </Text>
            {subtitle && (
              <Text style={{ color: '#9299a3', fontSize: 14, marginTop: 2 }}>
                {subtitle}
              </Text>
            )}
          </View>
          {rightContent && <View style={{ marginRight: 8 }}>{rightContent}</View>}
          {showChevron && (
            <Ionicons name="chevron-forward" size={20} color="#9299a3" />
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          color: '#9299a3',
          fontSize: 12,
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: 1,
          paddingHorizontal: 16,
          marginBottom: 12,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          backgroundColor: '#ffffff',
          marginHorizontal: 16,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: '#edf0f2',
          overflow: 'hidden',
          shadowColor: '#1a2433',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        {children}
      </View>
    </View>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: '#edf0f2', marginLeft: 74 }} />;
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
      toValue: 0.97,
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
    <View style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ backgroundColor: '#ffffff', paddingTop: insets.top + 8 }}>
          <View style={{ paddingHorizontal: 16, paddingBottom: 20 }}>
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#1a2433' }}>
              {t.settings.title}
            </Text>
          </View>
        </View>

        {/* Plan Card */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
          <Animated.View style={{ transform: [{ scale: cardScale }] }}>
            <Pressable
              onPress={() => router.push('/settings/backup')}
              onPressIn={handleCardPressIn}
              onPressOut={handleCardPressOut}
              style={{
                borderRadius: 24,
                backgroundColor: '#1a2433',
                padding: 24,
                shadowColor: '#1a2433',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.15,
                shadowRadius: 14,
                elevation: 6,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  {/* Plan Badge */}
                  <View
                    style={{
                      alignSelf: 'flex-start',
                      paddingHorizontal: 12,
                      paddingVertical: 5,
                      backgroundColor: 'rgba(255,255,255,0.12)',
                      borderRadius: 9999,
                      marginBottom: 14,
                    }}
                  >
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>
                      {plan === 'free' ? t.settings.freePlan : t.settings.proPlan}
                    </Text>
                  </View>
                  {/* Plan Name */}
                  <Text style={{ color: '#ffffff', fontSize: 28, fontWeight: '800', marginBottom: 6 }}>
                    {planInfo.name}
                  </Text>
                  {/* Description */}
                  <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 20 }}>
                    {plan === 'free'
                      ? t.settings.unlockFeatures
                      : t.settings.allFeaturesUnlocked}
                  </Text>
                </View>
                {/* Icon */}
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 12,
                  }}
                >
                  <Ionicons
                    name={plan === 'free' ? 'rocket' : 'shield-checkmark'}
                    size={26}
                    color="rgba(255,255,255,0.8)"
                  />
                </View>
              </View>

              {/* Upgrade Button */}
              {plan === 'free' && (
                <View
                  style={{
                    marginTop: 20,
                    borderRadius: 14,
                    paddingHorizontal: 20,
                    paddingVertical: 13,
                    backgroundColor: '#ffffff',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="sparkles" size={18} color="#1a2433" />
                  <Text style={{ color: '#1a2433', fontWeight: '700', marginLeft: 8, fontSize: 15 }}>
                    {t.settings.upgradeToPro}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#1a2433" style={{ marginLeft: 6 }} />
                </View>
              )}
            </Pressable>
          </Animated.View>
        </View>

        {/* Quick Stats */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, gap: 12 }}>
          {/* Products Count */}
          <View
            style={{
              flex: 1,
              backgroundColor: '#ffffff',
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#edf0f2',
              paddingVertical: 20,
              paddingHorizontal: 12,
              alignItems: 'center',
              shadowColor: '#1a2433',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: '#eff6ff',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <Ionicons name="cube-outline" size={24} color="#2563eb" />
            </View>
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#1a2433', marginBottom: 2 }}>
              {products.length}
            </Text>
            <Text style={{ fontSize: 12, color: '#9299a3' }}>{t.products.title}</Text>
          </View>

          {/* Total Value */}
          <View
            style={{
              flex: 1,
              backgroundColor: '#ffffff',
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#edf0f2',
              paddingVertical: 20,
              paddingHorizontal: 12,
              alignItems: 'center',
              shadowColor: '#1a2433',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: '#eff6ff',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <Ionicons name="wallet-outline" size={24} color="#2563eb" />
            </View>
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#1a2433', marginBottom: 2 }}>
              {formatCurrency(totalValue)}
            </Text>
            <Text style={{ fontSize: 12, color: '#9299a3' }}>{t.settings.totalValue}</Text>
          </View>
        </View>

        {/* Alerts */}
        {(lowStockCount > 0 || outOfStockCount > 0) && (
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <Pressable
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#fffbeb',
                borderRadius: 20,
                padding: 16,
                borderWidth: 1,
                borderColor: '#fde68a',
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: '#fef3c7',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="alert-circle" size={24} color="#d97706" />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={{ color: '#92400e', fontWeight: '700', fontSize: 15 }}>
                  {t.settings.stockAlerts}
                </Text>
                <Text style={{ color: '#b45309', fontSize: 13, marginTop: 2 }}>
                  {outOfStockCount > 0 && `${outOfStockCount} ${t.settings.outOfStockCount}`}
                  {outOfStockCount > 0 && lowStockCount > 0 && ' · '}
                  {lowStockCount > 0 && `${lowStockCount} ${t.settings.lowStockCount}`}
                </Text>
              </View>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: '#fef3c7',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="chevron-forward" size={16} color="#d97706" />
              </View>
            </Pressable>
          </View>
        )}

        {/* Data Management */}
        <SettingsSection title={t.settings.dataManagement}>
          <SettingsItem
            icon="cloud-upload"
            iconColor="#2563eb"
            iconBgColor="#eff6ff"
            title={t.settings.backupRestore}
            subtitle={t.settings.saveDataSecurely}
            onPress={handleBackup}
            rightContent={!isProLocal ? <ProBadge /> : undefined}
          />
          <Divider />
          <SettingsItem
            icon="document-text"
            iconColor="#16a34a"
            iconBgColor="#f0fdf4"
            title={t.settings.exportCSV}
            subtitle={t.settings.spreadsheetFormat}
            onPress={handleExportCSV}
            rightContent={!isProLocal ? <ProBadge /> : undefined}
          />
          <Divider />
          <SettingsItem
            icon="document"
            iconColor="#dc2626"
            iconBgColor="#fef2f2"
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
            iconColor="#7c3aed"
            iconBgColor="#f5f3ff"
            title={t.settings.language}
            subtitle={getLanguageDisplayName(language)}
            onPress={() => setShowLanguageModal(true)}
          />
          <Divider />
          <SettingsItem
            icon="notifications"
            iconColor="#9299a3"
            iconBgColor="#f5f6fa"
            title={t.settings.notifications}
            subtitle={t.settings.comingSoon}
            onPress={() => {}}
            disabled
          />
          <Divider />
          <SettingsItem
            icon="moon"
            iconColor="#9299a3"
            iconBgColor="#f5f6fa"
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
            iconBgColor="#f5f6fa"
            title={t.settings.appVersion}
            subtitle="1.0.0"
            onPress={() => {}}
            showChevron={false}
          />
          <Divider />
          <SettingsItem
            icon="help-circle"
            iconColor="#6e7785"
            iconBgColor="#f5f6fa"
            title={t.settings.helpSupport}
            subtitle={t.settings.faqsContact}
            onPress={() => Alert.alert(t.settings.help, t.settings.visitWebsite)}
          />
          <Divider />
          <SettingsItem
            icon="star"
            iconColor="#f59e0b"
            iconBgColor="#fffbeb"
            title={t.settings.rateApp}
            subtitle={t.settings.rateAppSubtitle}
            onPress={() => Alert.alert(t.settings.thankYou, t.settings.thanksForSupport)}
          />
        </SettingsSection>

        {/* Backup Warning for Free users */}
        {plan === 'free' && (
          <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
            <View
              style={{
                backgroundColor: '#fffbeb',
                borderRadius: 20,
                padding: 20,
                borderWidth: 1,
                borderColor: '#fde68a',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: '#fef3c7',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="shield-outline" size={24} color="#b45309" />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={{ color: '#92400e', fontWeight: '700', fontSize: 15 }}>
                    {t.settings.dataNotBackedUp}
                  </Text>
                  <Text style={{ color: '#b45309', fontSize: 13, marginTop: 4, lineHeight: 20 }}>
                    {t.settings.dataNotBackedUpDescription}
                  </Text>
                  <Pressable
                    onPress={() => router.push('/settings/backup')}
                    style={{
                      alignSelf: 'flex-start',
                      marginTop: 14,
                      borderRadius: 12,
                      backgroundColor: '#92400e',
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                    }}
                  >
                    <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 14 }}>
                      {t.settings.backupNow}
                    </Text>
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
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
          onPress={() => setShowLanguageModal(false)}
        >
          <Pressable
            style={{
              backgroundColor: '#ffffff',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingBottom: insets.bottom + 16,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 24,
                paddingVertical: 20,
                borderBottomWidth: 1,
                borderBottomColor: '#edf0f2',
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#1a2433' }}>
                {t.settings.language}
              </Text>
              <Pressable
                onPress={() => setShowLanguageModal(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#f5f6fa',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="close" size={18} color="#475569" />
              </Pressable>
            </View>

            {/* Language Options */}
            <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
              {/* English */}
              <Pressable
                onPress={() => handleLanguageSelect('en')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: 16,
                  marginBottom: 8,
                  backgroundColor: language === 'en' ? '#eff6ff' : 'transparent',
                  borderWidth: language === 'en' ? 1.5 : 0,
                  borderColor: '#2563eb',
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: '#f5f6fa',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                  }}
                >
                  <Text style={{ fontSize: 24 }}>🇺🇸</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: language === 'en' ? '#1d4ed8' : '#1a2433' }}>
                    English
                  </Text>
                  <Text style={{ color: '#9299a3', fontSize: 13 }}>United States</Text>
                </View>
                {language === 'en' && (
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: '#2563eb',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="checkmark" size={14} color="white" />
                  </View>
                )}
              </Pressable>

              {/* Spanish */}
              <Pressable
                onPress={() => handleLanguageSelect('es')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: 16,
                  backgroundColor: language === 'es' ? '#eff6ff' : 'transparent',
                  borderWidth: language === 'es' ? 1.5 : 0,
                  borderColor: '#2563eb',
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: '#f5f6fa',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                  }}
                >
                  <Text style={{ fontSize: 24 }}>🇪🇸</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: language === 'es' ? '#1d4ed8' : '#1a2433' }}>
                    Español
                  </Text>
                  <Text style={{ color: '#9299a3', fontSize: 13 }}>España / Latinoamérica</Text>
                </View>
                {language === 'es' && (
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: '#2563eb',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="checkmark" size={14} color="white" />
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
