import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { Colors, Typography } from '../constants';

interface WelcomeData {
  message: string;
  backgroundImage?: string;
  backgroundColor?: string;
  delayMs: number;
}

export default function WelcomeScreen() {
  const router = useRouter();
  const [welcomeData, setWelcomeData] = useState<WelcomeData>({
    message: 'Welcome!',
    backgroundColor: Colors.primary,
    delayMs: 3000, // 3 seconds default
  });

  // Future API integration point
  const loadWelcomeData = async (): Promise<WelcomeData> => {
    // TODO: Replace with actual API call
    // const response = await fetch('/api/welcome');
    // return response.json();
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      message: 'Hello, user!',
      backgroundColor: Colors.primary,
      delayMs: 3000,
    };
  };

  useEffect(() => {
    const initializeWelcomeScreen = async () => {
      try {
        const data = await loadWelcomeData();
        setWelcomeData(data);

        // Navigate to login after the specified delay
        const timer = setTimeout(() => {
          router.replace('/auth/login');
        }, data.delayMs);

        return () => clearTimeout(timer);
      } catch (error) {
        console.error('Error loading welcome data:', error);
        // Fallback to default behavior
        
        const timer = setTimeout(() => {
          router.replace('/auth/login');
        }, welcomeData.delayMs);

        return () => clearTimeout(timer);
      }
    };

    initializeWelcomeScreen();
  }, [router, welcomeData.delayMs]);

  const backgroundStyle = welcomeData.backgroundImage
    ? {}
    : { backgroundColor: welcomeData.backgroundColor };

  const content = (
    <View style={[styles.container, backgroundStyle]}>
      <View style={styles.content}>
        <Text style={styles.welcomeText}>{welcomeData.message}</Text>
        <ActivityIndicator 
          size="large" 
          color={Colors.white} 
          style={styles.loader}
        />
      </View>
    </View>
  );

  if (welcomeData.backgroundImage) {
    return (
      <ImageBackground
        source={{ uri: welcomeData.backgroundImage }}
        style={styles.container}
        resizeMode="cover"
      >
        {content}
      </ImageBackground>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  welcomeText: {
    ...Typography.h1,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  loader: {
    marginTop: 16,
  },
});