import React, { use, useEffect, useState } from 'react';
import { Platform, StyleSheet, View, Switch, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '@/contexts/auth-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Settings() {
  const {
    isBiometricEnabled,
    isBiometricAvailable,
    biometricType,
    enableBiometric,
    disableBiometric,
    authenticateWithBiometric
  } = useAuth();
  const currentTime = new Date();



  const [isLoading, setIsLoading] = useState(false);

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

        <ThemedView style={styles.infoRow}>
          <ThemedText type="default">Platform: {Platform.OS}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.infoRow}>
          <ThemedText type="default">Current Time: {currentTime.toLocaleTimeString()}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.infoRow}>
          <ThemedText type="default">
            Biometric Available: {isBiometricAvailable ? 'Yes' : 'No'}
          </ThemedText>
        </ThemedView>

        {biometricType && (
          <ThemedView style={styles.infoRow}>
            <ThemedText type="default">Biometric Type: {biometricType}</ThemedText>
          </ThemedView>
        )}
      </ThemedView>
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
  infoRow: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});
