import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View, Switch, Alert, TouchableOpacity, Dimensions, Modal, Animated, ScrollView } from 'react-native';
import { useAuth } from '@/contexts/auth-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import * as Battery from 'expo-battery';
import * as Network from 'expo-network';
import * as ScreenOrientation from 'expo-screen-orientation';
import { getLocales } from 'expo-localization';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface DeviceInfo {
  deviceName?: string;
  deviceBrand?: string;
  deviceModel?: string;
  osVersion?: string;
  totalMemory?: number;
  isDevice?: boolean;
  deviceYearClass?: number;
  batteryLevel?: number;
  batteryState?: Battery.BatteryState;
  networkState?: Network.NetworkState;
  screenWidth: number;
  screenHeight: number;
  orientation?: ScreenOrientation.Orientation;
  appVersion?: string;
  buildVersion?: string;
  locale?: string;
  timezone?: string;
}

export default function Settings() {
  const {
    isBiometricEnabled,
    isBiometricAvailable,
    biometricType,
    enableBiometric,
    disableBiometric,
    authenticateWithBiometric
  } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    screenWidth: Dimensions.get('window').width,
    screenHeight: Dimensions.get('window').height,
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [bubbleAnimations, setBubbleAnimations] = useState<Animated.Value[]>([]);
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadDeviceInfo();
  }, []);

  const loadDeviceInfo = async () => {
    try {
      const info: DeviceInfo = {
        screenWidth: Dimensions.get('window').width,
        screenHeight: Dimensions.get('window').height,
      };

      // Basic device info
      if (Device.deviceName) info.deviceName = Device.deviceName;
      console.log
      if (Device.brand) info.deviceBrand = Device.brand;
      if (Device.modelName) info.deviceModel = Device.modelName;
      if (Device.osVersion) info.osVersion = Device.osVersion;
      if (Device.totalMemory) info.totalMemory = Device.totalMemory;
      if (Device.isDevice !== undefined) info.isDevice = Device.isDevice;
      if (Device.deviceYearClass) info.deviceYearClass = Device.deviceYearClass;

      // App info
      try {
        const appVersion = Application.nativeApplicationVersion;
        const buildVersion = Application.nativeBuildVersion;
        if (appVersion) info.appVersion = appVersion;
        if (buildVersion) info.buildVersion = buildVersion;
      } catch (error) {
        console.log('Could not get app version info');
      }

      // Battery info
      try {
        const batteryLevel = await Battery.getBatteryLevelAsync();
        const batteryState = await Battery.getBatteryStateAsync();
        info.batteryLevel = batteryLevel;
        info.batteryState = batteryState;
      } catch (error) {
        console.log('Could not get battery info');
      }

      // Network info
      try {
        const networkState = await Network.getNetworkStateAsync();
        info.networkState = networkState;
      } catch (error) {
        console.log('Could not get network info');
      }

      // Screen orientation
      try {
        const orientation = await ScreenOrientation.getOrientationAsync();
        info.orientation = orientation;
      } catch (error) {
        console.log('Could not get orientation info');
      }

      // Locale and timezone
      try {
        const locales = getLocales();
        if (locales && locales.length > 0) {
          info.locale = locales[0].languageTag;
          info.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        }
      } catch (error) {
        console.log('Could not get locale info');
      }

      setDeviceInfo(info);
    } catch (error) {
      console.error('Error loading device info:', error);
    }
  };

  const getDeviceInfoItems = () => {
    const items = [
      { icon: 'cellphone', label: 'Platform', value: `${Platform.OS} ${Platform.Version}` },
      { icon: 'chip', label: 'Device', value: deviceInfo.deviceName || 'Unknown' },
      { icon: 'factory', label: 'Brand', value: deviceInfo.deviceBrand || 'Unknown' },
      { icon: 'cellphone-information', label: 'Model', value: deviceInfo.deviceModel || 'Unknown' },
      { icon: 'android', label: 'OS Version', value: deviceInfo.osVersion || 'Unknown' },
      { icon: 'desktop-tower', label: 'Device Type', value: deviceInfo.isDevice ? 'Physical Device' : 'Emulator' },
      { icon: 'calendar', label: 'Year Class', value: deviceInfo.deviceYearClass?.toString() || 'Unknown' },
      { icon: 'memory', label: 'Total Memory', value: formatBytes(deviceInfo.totalMemory) },
      { icon: 'monitor-screenshot', label: 'Screen', value: `${deviceInfo.screenWidth} x ${deviceInfo.screenHeight}` },
      { icon: 'screen-rotation', label: 'Orientation', value: getOrientationText(deviceInfo.orientation) },
      { icon: 'battery', label: 'Battery', value: deviceInfo.batteryLevel !== undefined ? `${Math.round(deviceInfo.batteryLevel * 100)}%` : 'Unknown' },
      { icon: 'power-plug', label: 'Battery Status', value: getBatteryStateText(deviceInfo.batteryState) },
      { icon: 'wifi', label: 'Network', value: getNetworkTypeText(deviceInfo.networkState) },
      { icon: 'application', label: 'App Version', value: deviceInfo.appVersion || 'Unknown' },
      { icon: 'wrench', label: 'Build', value: deviceInfo.buildVersion || 'Unknown' },
      { icon: 'translate', label: 'Language', value: deviceInfo.locale || 'Unknown' },
      { icon: 'earth', label: 'Timezone', value: deviceInfo.timezone || 'Unknown' },
      { icon: 'clock', label: 'Current Time', value: currentTime.toLocaleString() },
      { icon: 'fingerprint', label: 'Biometric Available', value: isBiometricAvailable ? 'Yes' : 'No' },
      { icon: 'security', label: 'Biometric Type', value: biometricType || 'None' },
    ].filter(item => item.value !== 'Unknown' && item.value !== 'None');

    return items;
  };

  const openDeviceModal = () => {
    setShowDeviceModal(true);
    // Initialize animations for each bubble
    const items = getDeviceInfoItems();
    const animations = items.map(() => new Animated.Value(0));
    setBubbleAnimations(animations);

    // Animate bubbles in sequence
    const animationDelay = 100;
    animations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: index * animationDelay,
        useNativeDriver: true,
      }).start();
    });
  };

  const closeDeviceModal = () => {
    setShowDeviceModal(false);
    setBubbleAnimations([]);
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (value) {
        await enableBiometric();
        Alert.alert(
          'App Lock Enabled',
          `Your app is now secured with ${biometricType || 'biometric'} authentication.`,
          [{ text: 'OK' }]
        );
      } else {
        await disableBiometric();
        Alert.alert(
          'App Lock Disabled',
          'Your app is no longer protected by biometric authentication.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to update biometric setting',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const testBiometric = async () => {
    if (!isBiometricAvailable) {
      Alert.alert(
        'Not Available',
        'Biometric authentication is not available on this device.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);
    try {
      const success = await authenticateWithBiometric();

      Alert.alert(
        success ? 'Success' : 'Failed',
        success ? 'Biometric authentication successful!' : 'Authentication failed or cancelled.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to test biometric authentication', [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getBatteryStateText = (state?: Battery.BatteryState) => {
    if (state === undefined) return 'Unknown';
    switch (state) {
      case Battery.BatteryState.CHARGING: return 'Charging ⚡';
      case Battery.BatteryState.FULL: return 'Full 🔋';
      case Battery.BatteryState.UNPLUGGED: return 'Unplugged 🔋';
      case Battery.BatteryState.UNKNOWN: return 'Unknown';
      default: return 'Unknown';
    }
  };

  const getNetworkTypeText = (networkState?: Network.NetworkState) => {
    if (!networkState) return 'Unknown';
    if (!networkState.isConnected) return 'Disconnected 🔴';

    switch (networkState.type) {
      case Network.NetworkStateType.WIFI: return 'WiFi 📶';
      case Network.NetworkStateType.CELLULAR: return 'Mobile Data 📱';
      case Network.NetworkStateType.ETHERNET: return 'Ethernet 🌐';
      case Network.NetworkStateType.BLUETOOTH: return 'Bluetooth 🔵';
      case Network.NetworkStateType.VPN: return 'VPN 🔒';
      default: return 'Connected ✅';
    }
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  const getOrientationText = (orientation?: ScreenOrientation.Orientation) => {
    if (orientation === undefined) return 'Unknown';
    switch (orientation) {
      case ScreenOrientation.Orientation.PORTRAIT_UP: return 'Portrait';
      case ScreenOrientation.Orientation.PORTRAIT_DOWN: return 'Portrait (Upside Down)';
      case ScreenOrientation.Orientation.LANDSCAPE_LEFT: return 'Landscape (Left)';
      case ScreenOrientation.Orientation.LANDSCAPE_RIGHT: return 'Landscape (Right)';
      default: return 'Unknown';
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#15466eff' }}
      headerImage={
        <MaterialCommunityIcons
          size={210}
          color="#808080"
          name="application-braces-outline"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Settings</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Security</ThemedText>

        <ThemedView style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <ThemedText type="defaultSemiBold">App Lock</ThemedText>
            <ThemedText type="default" style={styles.settingDescription}>
              {isBiometricAvailable
                ? `Secure your app with ${biometricType || 'biometric'} authentication`
                : 'Biometric authentication is not available on this device'
              }
            </ThemedText>
          </View>
          <Switch
            value={isBiometricEnabled}
            onValueChange={handleBiometricToggle}
            disabled={!isBiometricAvailable || isLoading}
            style={styles.switch}
          />
        </ThemedView>

        {isBiometricAvailable && (
          <TouchableOpacity
            style={styles.testButton}
            onPress={testBiometric}
            disabled={isLoading}
          >
            <ThemedText type="link">Test {biometricType} Authentication</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Device Information</ThemedText>

        <TouchableOpacity style={styles.deviceInfoButton} onPress={openDeviceModal}>
          <MaterialCommunityIcons name="information" size={24} color="#007AFF" />
          <ThemedText type="defaultSemiBold" style={styles.deviceInfoButtonText}>
            View Device Information
          </ThemedText>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#007AFF" />
        </TouchableOpacity>

        <ThemedView style={styles.quickInfo}>
          <ThemedText type="default">Platform: {Platform.OS}</ThemedText>
          <ThemedText type="default">
            Biometric: {isBiometricAvailable ? 'Available' : 'Not Available'}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <TouchableOpacity style={styles.refreshButton} onPress={loadDeviceInfo}>
        <MaterialCommunityIcons name="refresh" size={20} color="#007AFF" />
        <ThemedText type="link" style={styles.refreshText}>Refresh Device Info</ThemedText>
      </TouchableOpacity>

      {/* Device Info Modal */}
      <Modal
        visible={showDeviceModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeDeviceModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff' }]}>
          <View style={styles.modalHeader}>
            <ThemedText type="title" style={styles.modalTitle}>Device Information</ThemedText>
            <TouchableOpacity style={styles.closeButton} onPress={closeDeviceModal}>
              <MaterialCommunityIcons name="close" size={28} color={colorScheme === 'dark' ? '#ffffff' : '#000000'} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContainer}
          >
            <View style={styles.bubblesContainer}>
              {getDeviceInfoItems().map((item, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.infoBubble,
                    {
                      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f8f9fa',
                      borderColor: colorScheme === 'dark' ? '#333' : '#e0e0e0',
                      width: '48%', // Two columns with some gap
                      transform: [
                        {
                          translateX: bubbleAnimations[index] ? bubbleAnimations[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [-50, 0],
                          }) : 0,
                        },
                        {
                          scale: bubbleAnimations[index] ? bubbleAnimations[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1],
                          }) : 1,
                        },
                      ],
                      opacity: bubbleAnimations[index] || 1,
                    }
                  ]}
                >
                  <View style={styles.bubbleIcon}>
                    <MaterialCommunityIcons
                      name={item.icon as any}
                      size={20}
                      color="#007AFF"
                    />
                  </View>
                  <View style={styles.bubbleContent}>
                    <ThemedText type="defaultSemiBold" style={styles.bubbleLabel}>
                      {item.label}
                    </ThemedText>
                    <ThemedText type="default" style={styles.bubbleValue}>
                      {item.value}
                    </ThemedText>
                  </View>
                </Animated.View>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    top: 35,
    left: '50%',
    transform: [{ translateX: -105 }],
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingDescription: {
    marginTop: 4,
    opacity: 0.7,
    fontSize: 14,
  },
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
  testButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  deviceInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#007AFF20',
    backgroundColor: '#007AFF10',
  },
  deviceInfoButtonText: {
    flex: 1,
    marginLeft: 12,
    color: '#007AFF',
  },
  quickInfo: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    opacity: 0.7,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 20,
    gap: 8,
  },
  refreshText: {
    marginLeft: 0,
  },
  modalContainer: {
    flex: 1,
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  modalContent: {
    flex: 1,
  },
  modalScrollContainer: {
    padding: 16,
    paddingBottom: 50,
  },
  bubblesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 8,
  },
  bubbleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bubbleContent: {
    flex: 1,
  },
  bubbleLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
    opacity: 0.8,
  },
  bubbleValue: {
    fontSize: 14,
    fontWeight: '500',
    flexWrap: 'wrap',
  },
});