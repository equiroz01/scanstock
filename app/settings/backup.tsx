import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlanStore } from '@/stores/usePlanStore';
import { useProductStore } from '@/stores/useProductStore';
import { useIAP } from '@/hooks/useIAP';
import { PLANS } from '@/constants/plans';
import { IAP_PRODUCTS } from '@/constants/iap';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { createBackupZip, restoreBackupZip } from '@/services/backup/backupZip';
import { exportToCSV } from '@/services/backup/exportCSV';
import { exportToPDF } from '@/services/backup/exportPDF';
import { useI18n } from '@/i18n';
import type { PlanType } from '@/types/settings';

export default function BackupScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { plan } = usePlanStore();
  const { products, loadProducts } = useProductStore();
  const {
    products: iapProducts,
    subscriptions,
    isLoading: isLoadingIAP,
    isPurchasing,
    isRestoring,
    error: iapError,
    purchase,
    restorePurchases,
    getProductById,
  } = useIAP();

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const isProLocal = plan === 'pro_local' || plan === 'pro_cloud';

  const handleUpgrade = async (targetPlan: PlanType) => {
    if (isPurchasing) return;

    // Get product ID
    const productId =
      targetPlan === 'pro_local'
        ? IAP_PRODUCTS.PRO_LOCAL
        : IAP_PRODUCTS.PRO_CLOUD_MONTHLY;

    // Get product info
    const product = getProductById(productId);

    if (!product) {
      Alert.alert(t.common.error, t.backup.productNotAvailable);
      return;
    }

    // Show confirmation
    const price = product.displayPrice || PLANS[targetPlan].price;

    Alert.alert(
      `${t.backup.upgradeTo} ${PLANS[targetPlan].name}`,
      `${t.products.price}: ${price}\n\n${t.backup.upgradeProceed}`,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.backup.buyNow,
          onPress: async () => {
            try {
              await purchase(productId);
              // Success handled by useIAP hook
            } catch (error) {
              Alert.alert(
                t.backup.purchaseFailed,
                error instanceof Error ? error.message : t.common.retry
              );
            }
          },
        },
      ]
    );
  };

  const handleRestorePurchases = async () => {
    if (isRestoring) return;

    try {
      await restorePurchases();
      Alert.alert(t.backup.restoreComplete, t.backup.purchasesRestored);
    } catch (error) {
      Alert.alert(
        t.backup.restoreFailed,
        error instanceof Error ? error.message : t.common.retry
      );
    }
  };

  const handleExportBackup = async () => {
    if (!isProLocal) {
      handleUpgrade('pro_local');
      return;
    }

    if (products.length === 0) {
      Alert.alert(t.backup.noProducts, t.backup.noProductsToBackup);
      return;
    }

    setIsExporting(true);
    try {
      await createBackupZip();
      Alert.alert(t.common.success, t.backup.backupCreated);
    } catch (error) {
      Alert.alert(t.common.error, error instanceof Error ? error.message : t.backup.backupError);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportBackup = async () => {
    if (!isProLocal) {
      handleUpgrade('pro_local');
      return;
    }

    Alert.alert(
      t.backup.restoreBackupConfirm,
      `${products.length} ${t.common.products}.\n\n` +
      `${t.backup.restoreBackupWarning}\n\n` +
      `${t.backup.areYouSure}`,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.backup.restore,
          style: 'destructive',
          onPress: async () => {
            setIsImporting(true);
            try {
              const manifest = await restoreBackupZip();
              await loadProducts(); // Reload products after restore
              Alert.alert(
                t.common.success,
                `${t.backup.backupRestored}\n\n${manifest.productCount} ${t.backup.productsImported}\n${manifest.photoCount} ${t.backup.photosRestored}`
              );
            } catch (error) {
              Alert.alert(t.common.error, error instanceof Error ? error.message : t.backup.restoreError);
            } finally {
              setIsImporting(false);
            }
          },
        },
      ]
    );
  };

  const handleExportCSV = async () => {
    if (!isProLocal) {
      handleUpgrade('pro_local');
      return;
    }

    if (products.length === 0) {
      Alert.alert(t.backup.noProducts, t.backup.noProductsToExport);
      return;
    }

    setIsExportingCSV(true);
    try {
      await exportToCSV();
      Alert.alert(t.common.success, t.backup.csvExported);
    } catch (error) {
      Alert.alert(t.common.error, error instanceof Error ? error.message : t.settings.failedExportCSV);
    } finally {
      setIsExportingCSV(false);
    }
  };

  const handleExportPDF = async () => {
    if (!isProLocal) {
      handleUpgrade('pro_local');
      return;
    }

    if (products.length === 0) {
      Alert.alert(t.backup.noProducts, t.backup.noProductsToExport);
      return;
    }

    setIsExportingPDF(true);
    try {
      await exportToPDF();
      Alert.alert(t.common.success, t.backup.pdfExported);
    } catch (error) {
      Alert.alert(t.common.error, error instanceof Error ? error.message : t.settings.failedExportPDF);
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-50" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-dark-100">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#475569" />
        </Pressable>
        <Text className="text-lg font-semibold text-dark-900 ml-2">
          {t.backup.title}
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* IAP Loading */}
        {isLoadingIAP && (
          <Card className="mb-4 bg-blue-50 border border-blue-200">
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text className="text-blue-900 ml-3">{t.backup.loadingProducts}</Text>
            </View>
          </Card>
        )}

        {/* IAP Error */}
        {iapError && (
          <Card className="mb-4 bg-red-50 border border-red-200">
            <View className="flex-row items-start">
              <Ionicons name="warning" size={24} color="#dc2626" />
              <View className="flex-1 ml-3">
                <Text className="text-red-900 font-semibold">{t.backup.storeError}</Text>
                <Text className="text-red-700 text-sm">{iapError}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Current Plan */}
        <Card className="mb-6 bg-gradient-to-r from-primary-600 to-primary-700">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center mr-4">
              <Ionicons
                name={plan === 'free' ? 'lock-closed' : 'shield-checkmark'}
                size={24}
                color="white"
              />
            </View>
            <View className="flex-1">
              <Text className="text-primary-100 text-sm">{t.backup.currentPlan}</Text>
              <Text className="text-white text-xl font-bold">
                {PLANS[plan].name}
              </Text>
            </View>
          </View>

          {/* Restore Purchases Button */}
          {plan === 'free' && (
            <Pressable
              onPress={handleRestorePurchases}
              disabled={isRestoring}
              className="mt-4 pt-4 border-t border-white/20"
            >
              <View className="flex-row items-center justify-center">
                {isRestoring ? (
                  <>
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white text-sm ml-2">{t.backup.restoring}</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="refresh" size={16} color="white" />
                    <Text className="text-white text-sm ml-2">{t.backup.restorePurchases}</Text>
                  </>
                )}
              </View>
            </Pressable>
          )}
        </Card>

        {/* Backup Info */}
        {isProLocal && (
          <Card className="mb-4 bg-blue-50 border border-blue-200">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={24} color="#3b82f6" />
              <View className="flex-1 ml-3">
                <Text className="text-blue-900 font-semibold mb-1">
                  {t.backup.completeBackup}
                </Text>
                <Text className="text-blue-700 text-sm leading-5">
                  {t.backup.completeBackupDescription}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Backup Actions (Pro) */}
        {isProLocal && (
          <View className="mb-6">
            <Text className="text-dark-500 text-sm font-medium uppercase tracking-wide mb-3">
              {t.backup.backupRestore}
            </Text>
            <Card>
              <Pressable
                onPress={handleExportBackup}
                disabled={isExporting}
                className="flex-row items-center py-2"
              >
                <View className="w-10 h-10 rounded-xl bg-primary-100 items-center justify-center mr-3">
                  <Ionicons name="cloud-upload-outline" size={22} color="#30638e" />
                </View>
                <View className="flex-1">
                  <Text className="text-dark-900 text-base font-medium">
                    {t.backup.createBackup}
                  </Text>
                  <Text className="text-dark-500 text-sm">
                    {t.backup.exportDataToFile}
                  </Text>
                </View>
                {isExporting ? (
                  <Text className="text-primary-600">{t.backup.exporting}</Text>
                ) : (
                  <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                )}
              </Pressable>

              <View className="h-px bg-dark-100 my-2" />

              <Pressable
                onPress={handleImportBackup}
                disabled={isImporting}
                className="flex-row items-center py-2"
              >
                <View className="w-10 h-10 rounded-xl bg-green-100 items-center justify-center mr-3">
                  <Ionicons name="cloud-download-outline" size={22} color="#16a34a" />
                </View>
                <View className="flex-1">
                  <Text className="text-dark-900 text-base font-medium">
                    {t.backup.restoreBackup}
                  </Text>
                  <Text className="text-dark-500 text-sm">
                    {t.backup.importFromBackupFile}
                  </Text>
                </View>
                {isImporting ? (
                  <Text className="text-green-600">{t.backup.importing}</Text>
                ) : (
                  <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                )}
              </Pressable>

              <View className="h-px bg-dark-100 my-2" />

              <Pressable
                onPress={handleExportCSV}
                disabled={isExportingCSV}
                className="flex-row items-center py-2"
              >
                <View className="w-10 h-10 rounded-xl bg-amber-100 items-center justify-center mr-3">
                  <Ionicons name="document-text-outline" size={22} color="#d97706" />
                </View>
                <View className="flex-1">
                  <Text className="text-dark-900 text-base font-medium">
                    {t.backup.exportCSV}
                  </Text>
                  <Text className="text-dark-500 text-sm">
                    {t.backup.spreadsheetExcel}
                  </Text>
                </View>
                {isExportingCSV ? (
                  <Text className="text-amber-600">{t.backup.exporting}</Text>
                ) : (
                  <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                )}
              </Pressable>

              <View className="h-px bg-dark-100 my-2" />

              <Pressable
                onPress={handleExportPDF}
                disabled={isExportingPDF}
                className="flex-row items-center py-2"
              >
                <View className="w-10 h-10 rounded-xl bg-red-100 items-center justify-center mr-3">
                  <Ionicons name="document-outline" size={22} color="#dc2626" />
                </View>
                <View className="flex-1">
                  <Text className="text-dark-900 text-base font-medium">
                    {t.backup.exportPDF}
                  </Text>
                  <Text className="text-dark-500 text-sm">
                    {t.backup.professionalReport}
                  </Text>
                </View>
                {isExportingPDF ? (
                  <Text className="text-red-600">{t.backup.generating}</Text>
                ) : (
                  <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                )}
              </Pressable>
            </Card>
          </View>
        )}

        {/* Upgrade Options (Free) */}
        {plan === 'free' && (
          <View>
            <Text className="text-dark-500 text-sm font-medium uppercase tracking-wide mb-3">
              {t.backup.upgradeOptions}
            </Text>

            {/* Pro Local */}
            <Card className="mb-4">
              <View className="flex-row items-start mb-4">
                <View className="w-12 h-12 rounded-xl bg-primary-100 items-center justify-center mr-3">
                  <Ionicons name="download-outline" size={24} color="#30638e" />
                </View>
                <View className="flex-1">
                  <Text className="text-dark-900 text-lg font-bold">
                    {t.backup.proLocal}
                  </Text>
                  <Text className="text-primary-600 font-semibold">
                    {PLANS.pro_local.price} {t.backup.oneTime}
                  </Text>
                </View>
              </View>

              <View className="mb-4">
                {PLANS.pro_local.features.map((feature, index) => (
                  <View key={index} className="flex-row items-center mb-2">
                    <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
                    <Text className="text-dark-700 ml-2">{feature}</Text>
                  </View>
                ))}
              </View>

              <Button
                title={isPurchasing ? t.backup.processing : `${t.backup.upgradeTo} ${t.backup.proLocal}`}
                onPress={() => handleUpgrade('pro_local')}
                loading={isPurchasing}
                disabled={isPurchasing || isLoadingIAP}
                fullWidth
              />
            </Card>

            {/* Pro Cloud */}
            <Card className="border-2 border-primary-200">
              <View className="absolute -top-3 left-4 bg-primary-600 px-3 py-1" style={{ borderRadius: 9999 }}>
                <Text className="text-white text-xs font-semibold">{t.backup.recommended}</Text>
              </View>

              <View className="flex-row items-start mb-4 mt-2">
                <View className="w-12 h-12 rounded-xl bg-primary-100 items-center justify-center mr-3">
                  <Ionicons name="cloud-outline" size={24} color="#30638e" />
                </View>
                <View className="flex-1">
                  <Text className="text-dark-900 text-lg font-bold">
                    {t.backup.proCloud}
                  </Text>
                  <Text className="text-primary-600 font-semibold">
                    {PLANS.pro_cloud.price}
                  </Text>
                </View>
              </View>

              <View className="mb-4">
                {PLANS.pro_cloud.features.map((feature, index) => (
                  <View key={index} className="flex-row items-center mb-2">
                    <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
                    <Text className="text-dark-700 ml-2">{feature}</Text>
                  </View>
                ))}
              </View>

              <Button
                title={isPurchasing ? t.backup.processing : `${t.backup.upgradeTo} ${t.backup.proCloud}`}
                onPress={() => handleUpgrade('pro_cloud')}
                loading={isPurchasing}
                disabled={isPurchasing || isLoadingIAP}
                fullWidth
              />
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
