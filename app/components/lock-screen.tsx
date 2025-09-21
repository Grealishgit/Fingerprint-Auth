import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Alert,
    TouchableOpacity,
    Animated,
    Dimensions,
    StatusBar,
} from 'react-native';
import { useAuth } from '@/contexts/auth-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width, height } = Dimensions.get('window');

export default function LockScreen() {
    const { authenticateWithBiometric, unlockApp, biometricType } = useAuth();
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [pulseAnim] = useState(new Animated.Value(1));
    const colorScheme = useColorScheme();

    useEffect(() => {
        // Auto-trigger authentication when lock screen appears
        handleAuthenticate();

        // Start pulse animation
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();

        return () => pulse.stop();
    }, []);

    const handleAuthenticate = async () => {
        if (isAuthenticating) return;

        setIsAuthenticating(true);
        try {
            const success = await authenticateWithBiometric();

            if (success) {
                unlockApp();
            } else {
                Alert.alert(
                    'Authentication Failed',
                    'Please try again or use your device passcode.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Try Again', onPress: handleAuthenticate },
                    ]
                );
            }
        } catch (error) {
            Alert.alert(
                'Error',
                'Authentication error occurred. Please try again.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Try Again', onPress: handleAuthenticate },
                ]
            );
        } finally {
            setIsAuthenticating(false);
        }
    };

    const isDark = colorScheme === 'dark';

    return (
        <ThemedView style={styles.container}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor="transparent"
                translucent
            />

            <View style={styles.content}>
                <View style={styles.header}>
                    <ThemedText type="title" style={styles.appTitle}>
                        Secure App
                    </ThemedText>
                    <ThemedText type="default" style={styles.subtitle}>
                        App is locked for your security
                    </ThemedText>
                </View>

                <View style={styles.authSection}>
                    <Animated.View
                        style={[
                            styles.fingerprintContainer,
                            { transform: [{ scale: pulseAnim }] }
                        ]}
                    >
                        <TouchableOpacity
                            style={[
                                styles.fingerprintButton,
                                isDark ? styles.fingerprintButtonDark : styles.fingerprintButtonLight
                            ]}
                            onPress={handleAuthenticate}
                            disabled={isAuthenticating}
                            activeOpacity={0.8}
                        >
                            <IconSymbol
                                name="faceid"
                                size={80}
                                color={isDark ? '#ffffff' : '#000000'}
                            />
                        </TouchableOpacity>
                    </Animated.View>

                    <ThemedText type="defaultSemiBold" style={styles.authText}>
                        {isAuthenticating ? 'Authenticating...' : `Touch ${biometricType || 'Biometric'} sensor`}
                    </ThemedText>

                    <ThemedText type="default" style={styles.instructionText}>
                        Use your {biometricType?.toLowerCase() || 'biometric'} to unlock the app
                    </ThemedText>
                </View>

                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={handleAuthenticate}
                    disabled={isAuthenticating}
                >
                    <ThemedText type="link" style={styles.retryText}>
                        Try Again
                    </ThemedText>
                </TouchableOpacity>
            </View>

        </ThemedView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 60 : 60,
        paddingBottom: 60,
    },
    header: {
        alignItems: 'center',
    },
    appTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        opacity: 0.7,
        textAlign: 'center',
    },
    authSection: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    fingerprintContainer: {
        marginBottom: 32,
    },
    fingerprintButton: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    fingerprintButtonLight: {
        backgroundColor: '#ffffff',
        shadowColor: '#000000',
    },
    fingerprintButtonDark: {
        backgroundColor: '#2d2d2d',
        shadowColor: '#ffffff',
    },
    authText: {
        fontSize: 18,
        marginBottom: 8,
        textAlign: 'center',
    },
    instructionText: {
        fontSize: 14,
        opacity: 0.7,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    retryButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    retryText: {
        fontSize: 16,
    },
});