import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

interface AuthContextType {
    isLocked: boolean;
    isBiometricEnabled: boolean;
    isBiometricAvailable: boolean;
    biometricType: string | null;
    enableBiometric: () => Promise<void>;
    disableBiometric: () => Promise<void>;
    authenticateWithBiometric: () => Promise<boolean>;
    unlockApp: () => void;
    lockApp: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [isLocked, setIsLocked] = useState(false);
    const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
    const [biometricType, setBiometricType] = useState<string | null>(null);

    useEffect(() => {
        checkBiometricAvailability();
        loadBiometricSetting();
    }, []);

    useEffect(() => {
        // Lock the app when biometric is enabled and app starts
        if (isBiometricEnabled && isBiometricAvailable) {
            setIsLocked(true);
        }
    }, [isBiometricEnabled, isBiometricAvailable]);

    const checkBiometricAvailability = async () => {
        try {
            const isAvailable = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

            setIsBiometricAvailable(isAvailable && isEnrolled);

            // Determine biometric type for Android
            if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
                setBiometricType('Fingerprint');
            } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
                setBiometricType('Face Recognition');
            } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
                setBiometricType('Iris');
            } else {
                setBiometricType('Biometric');
            }
        } catch (error) {
            console.error('Error checking biometric availability:', error);
            setIsBiometricAvailable(false);
        }
    };

    const loadBiometricSetting = async () => {
        try {
            const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
            setIsBiometricEnabled(enabled === 'true');
        } catch (error) {
            console.error('Error loading biometric setting:', error);
        }
    };

    const enableBiometric = async () => {
        try {
            if (!isBiometricAvailable) {
                throw new Error('Biometric authentication is not available');
            }

            // Test authentication before enabling
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to enable app lock',
                fallbackLabel: 'Use passcode',
                disableDeviceFallback: false,
            });

            if (result.success) {
                await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
                setIsBiometricEnabled(true);
                setIsLocked(true);
                return;
            } else {
                throw new Error('Authentication failed');
            }
        } catch (error) {
            console.error('Error enabling biometric:', error);
            throw error;
        }
    };

    const disableBiometric = async () => {
        try {
            await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'false');
            setIsBiometricEnabled(false);
            setIsLocked(false);
        } catch (error) {
            console.error('Error disabling biometric:', error);
            throw error;
        }
    };

    const authenticateWithBiometric = async (): Promise<boolean> => {
        try {
            if (!isBiometricAvailable) {
                return false;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Unlock app with your fingerprint',
                fallbackLabel: 'Use passcode',
                disableDeviceFallback: false,
            });

            return result.success;
        } catch (error) {
            console.error('Error authenticating with biometric:', error);
            return false;
        }
    };

    const unlockApp = () => {
        setIsLocked(false);
    };

    const lockApp = () => {
        if (isBiometricEnabled) {
            setIsLocked(true);
        }
    };

    const value: AuthContextType = {
        isLocked,
        isBiometricEnabled,
        isBiometricAvailable,
        biometricType,
        enableBiometric,
        disableBiometric,
        authenticateWithBiometric,
        unlockApp,
        lockApp,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}