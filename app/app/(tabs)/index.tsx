import React, { useState, useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function HomeScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Set launch date to 5 days from now
  const launchDate = new Date();
  launchDate.setDate(launchDate.getDate() + 5);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      const timeDiff = launchDate.getTime() - now.getTime();

      if (timeDiff > 0) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        setTimeRemaining({ days, hours, minutes, seconds });
      } else {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    console.log("Current Hour:", hour);

    const minute = currentTime.getMinutes();
    console.log("Current Minute:", minute);

    const second = currentTime.getSeconds();
    console.log("Current Second:", second);


    if (hour >= 5 && hour < 12) {
      return 'Good Morning! ☀️';
    } else if (hour >= 12 && hour < 17) {
      return 'Good Afternoon! 🌤️';
    } else if (hour >= 17 && hour < 21) {
      return 'Good Evening! 🌅';
    } else {
      return 'Good Night! 🌙';
    }
  };

  const formatTime = (time: number) => {
    return time.toString().padStart(2, '0');
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#15466eff' }}
      headerImage={
        <MaterialCommunityIcons
          size={210}
          color="#808080"
          name="application-braces"
          style={styles.headerImage}
        />
      }>

      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome Back 🎉 Hunter</ThemedText>
      </ThemedView>

      <ThemedView style={styles.greetingContainer}>
        <ThemedText type="subtitle" style={styles.greetingText}>
          {getGreeting()}
        </ThemedText>
        <ThemedText type="default" style={styles.timeText}>
          {currentTime.toLocaleTimeString()}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.countdownContainer}>
        <ThemedText type="subtitle" style={styles.countdownTitle}>
          🚀 App Launch Countdown
        </ThemedText>

        <ThemedView style={styles.countdownGrid}>
          <ThemedView style={styles.countdownItem}>
            <ThemedText type="title" style={styles.countdownNumber}>
              {formatTime(timeRemaining.days)}
            </ThemedText>
            <ThemedText type="default" style={styles.countdownLabel}>
              Days
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.countdownItem}>
            <ThemedText type="title" style={styles.countdownNumber}>
              {formatTime(timeRemaining.hours)}
            </ThemedText>
            <ThemedText type="default" style={styles.countdownLabel}>
              Hours
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.countdownItem}>
            <ThemedText type="title" style={styles.countdownNumber}>
              {formatTime(timeRemaining.minutes)}
            </ThemedText>
            <ThemedText type="default" style={styles.countdownLabel}>
              Minutes
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.countdownItem}>
            <ThemedText type="title" style={styles.countdownNumber}>
              {formatTime(timeRemaining.seconds)}
            </ThemedText>
            <ThemedText type="default" style={styles.countdownLabel}>
              Seconds
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedText type="default" style={styles.launchText}>
          Get ready for something amazing! 🎉
        </ThemedText>
      </ThemedView>

      {/* <ThemedView style={styles.statsContainer}>
        <ThemedText type="defaultSemiBold" style={styles.statsTitle}>
          Today's Progress
        </ThemedText>

        <ThemedView style={styles.statItem}>
          <IconSymbol name="checkmark.circle.fill" size={24} color="#4CAF50" />
          <ThemedText type="default" style={styles.statText}>
            Biometric authentication setup complete
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.statItem}>
          <IconSymbol name="shield.checkered" size={24} color="#2196F3" />
          <ThemedText type="default" style={styles.statText}>
            App security enhanced
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.statItem}>
          <IconSymbol name="gear" size={24} color="#FF9800" />
          <ThemedText type="default" style={styles.statText}>
            Settings configured and ready
          </ThemedText>
        </ThemedView>
      </ThemedView> */}
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
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  greetingContainer: {
    marginBottom: 32,
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 16,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  timeText: {
    fontSize: 30,
    // opacity: 0.7,
    fontWeight: '600',
    color: '#2196F3'
  },
  countdownContainer: {
    marginBottom: 32,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  countdownTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  countdownGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  countdownItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 12,
    minHeight: 80,
    justifyContent: 'center',
  },
  countdownNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  countdownLabel: {
    fontSize: 12,
    opacity: 0.7,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  launchText: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.8,
  },
  statsContainer: {
    marginBottom: 32,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  statsTitle: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    gap: 12,
  },
  statText: {
    flex: 1,
    fontSize: 14,
  },
});
