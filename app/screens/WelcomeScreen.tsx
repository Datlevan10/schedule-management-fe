import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { WelcomeScreensAPI } from '../api/welcome-screens.api';
import { API_CONFIG } from '../config/api';
import { Colors, Typography } from '../constants';

interface WelcomeData {
  title: string;
  subtitle: string;
  backgroundImage?: string;
  backgroundColor?: string;
  delayMs: number;
}

export default function WelcomeScreen() {
  const router = useRouter();
  const [welcomeData, setWelcomeData] = useState<WelcomeData>({
    title: 'Welcome!',
    subtitle: 'Loading...',
    backgroundColor: Colors.primary,
    delayMs: 3000,
  });
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const getImageUrl = (backgroundValue: string) => {
    return API_CONFIG.getImageUrl(backgroundValue);
  };

  const loadWelcomeData = useCallback(async (): Promise<WelcomeData> => {
    try {
      const response = await WelcomeScreensAPI.get();

      if (response.data) {
        const welcomeScreen = response.data;

        const processedImageUrl = welcomeScreen.background_type === 'image'
          ? getImageUrl(welcomeScreen.background_value)
          : undefined;

        const processedData = {
          title: welcomeScreen.title,
          subtitle: welcomeScreen.subtitle,
          backgroundImage: processedImageUrl,
          backgroundColor: welcomeScreen.background_type === 'color'
            ? welcomeScreen.background_value
            : Colors.primary,
          delayMs: welcomeScreen.duration * 1000,
        };

        console.log('📱 Final Welcome Data for UI:', processedData);

        return processedData;
      }

      // Fallback if no data
      const fallbackData = {
        title: 'Welcome to Timetable Management',
        subtitle: 'Start your journey effectively with us',
        backgroundColor: Colors.primary,
        delayMs: 5000,
      };
      return fallbackData;
    } catch (error: any) {
      console.error('Error loading welcome data from API:', error);

      // Check if it's an authentication error
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        console.log('🔐 Welcome screen API requires authentication, using fallback data');
      }

      // Fallback data when API fails (using data from your API example)
      const errorFallbackData = {
        title: 'Welcome to the Timetable Management app',
        subtitle: 'Start your journey effectively with us',
        backgroundImage: getImageUrl('welcome-screens/h2A3z3UgmCm7tpCNkoVFC37H7KHOQKXr507j5b0W.jpg'),
        delayMs: 5000,
      };
      return errorFallbackData;
    }
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const initializeWelcomeScreen = async () => {
      try {
        setLoading(true);

        const data = await loadWelcomeData();
        setWelcomeData(data);
        setLoading(false);

        // Navigate to login after the specified delay
        timeoutId = setTimeout(() => {
          router.replace('/auth/login');
        }, data.delayMs);
      } catch (error: any) {
        console.error('Error in initializeWelcomeScreen:', error);
        setLoading(false);
        // Fallback to default behavior
        timeoutId = setTimeout(() => {
          router.replace('/auth/login');
        }, 3000);
      }
    };

    initializeWelcomeScreen();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [loadWelcomeData, router]);

  const backgroundStyle = welcomeData.backgroundImage
    ? { backgroundColor: 'transparent' }
    : { backgroundColor: welcomeData.backgroundColor };

  const content = (
    <View style={[styles.container, backgroundStyle]}>
      <View style={styles.content}>
        <Text style={styles.titleText}>{welcomeData.title}</Text>
        <Text style={styles.subtitleText}>{welcomeData.subtitle}</Text>
        {loading && (
          <ActivityIndicator
            size="large"
            color={Colors.white}
            style={styles.loader}
          />
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: 'white' }]}>
      <View style={styles.content}>
        <Text style={styles.titleText}>{welcomeData.title}</Text>
        <Text style={styles.subtitleText}>{welcomeData.subtitle}</Text>
        {welcomeData.backgroundImage && !imageError && (
          <Image
            source={{ uri: welcomeData.backgroundImage }}
            style={styles.welcomeImage}
            resizeMode="contain"
          />
        )}
        {loading && (
          <ActivityIndicator
            size="large"
            color={Colors.primary}
            style={styles.loader}
          />
        )}
      </View>
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 120,
  },
  imageBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  content: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  titleText: {
    ...Typography.h1,
    color: 'black',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  subtitleText: {
    ...Typography.body1,
    color: 'black',
    textAlign: 'center',
    marginBottom: 32,
  },
  welcomeImage: {
    width: 400,
    height: 400,
    marginBottom: 24,
  },
  loader: {
    marginTop: 16,
  },
});