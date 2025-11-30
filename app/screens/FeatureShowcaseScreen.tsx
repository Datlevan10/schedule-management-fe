import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FeatureHighlightsAPI, type FeatureHighlight } from '../api/feature-highlights.api';
import { Button } from '../components/common';
import { API_CONFIG } from '../config/api';
import { Colors, Typography } from '../constants';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.85;
const CARD_MARGIN = 20;

interface FeatureCardProps {
  item: FeatureHighlight;
  index: number;
  scrollX: Animated.Value;
}

const FeatureCard = ({ item, index, scrollX }: FeatureCardProps) => {
  const inputRange = [
    (index - 1) * (CARD_WIDTH + CARD_MARGIN),
    index * (CARD_WIDTH + CARD_MARGIN),
    (index + 1) * (CARD_WIDTH + CARD_MARGIN),
  ];

  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.8, 1, 0.8],
    extrapolate: 'clamp',
  });

  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.6, 1, 0.6],
    extrapolate: 'clamp',
  });

  const getImageUrl = (iconUrl: string) => {
    return API_CONFIG.getImageUrl(iconUrl);
  };

  const renderIcon = () => {
    return (
      <Image
        source={{ uri: getImageUrl(item.icon_url) }}
        style={styles.imageIcon}
        resizeMode="cover"
      />
    );
  };

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }], opacity }]}>
      <View style={styles.iconContainer}>
        {renderIcon()}
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDescription}>{item.description}</Text>
    </Animated.View>
  );
};

export default function FeatureShowcaseScreen() {
  const router = useRouter();
  const [features, setFeatures] = useState<FeatureHighlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  const fallbackFeatures: FeatureHighlight[] = [
    {
      id: 1,
      title: 'AI Schedule Assistant',
      description: 'Let AI analyze your habits and optimize your time automatically',
      icon_url: 'feature-icons/ai-assistant.jpg',
      order: 1,
      is_active: true,
    },
    {
      id: 2,
      title: 'Smart Templates',
      description: 'Start quickly with pre-built templates designed for your goals',
      icon_url: 'feature-icons/smart-templates.jpg',
      order: 2,
      is_active: true,
    },
    {
      id: 3,
      title: 'Reports & Insights',
      description: 'Track your productivity and get insights to improve your workflow',
      icon_url: 'feature-icons/reports-insights.jpg',
      order: 3,
      is_active: true,
    },
  ];

  const loadFeatures = useCallback(async () => {
    try {
      setLoading(true);
      const response = await FeatureHighlightsAPI.getActive();

      if (response.data && response.data.length > 0) {
        const sortedFeatures = response.data.sort((a, b) => a.order - b.order);
        setFeatures(sortedFeatures);
      } else {
        setFeatures(fallbackFeatures);
      }
    } catch (error) {
      console.error('Error loading feature highlights:', error);
      setFeatures(fallbackFeatures);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(buttonAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [loading, fadeAnim, buttonAnim]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / (CARD_WIDTH + CARD_MARGIN));
        setCurrentIndex(index);
      },
    }
  );

  const handleGetStarted = () => {
    router.replace('/auth/login');
  };

  const handleSkip = () => {
    router.replace('/auth/login');
  };

  const renderFeatureCard = ({ item, index }: { item: FeatureHighlight; index: number }) => (
    <FeatureCard item={item} index={index} scrollX={scrollX} />
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {features.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            { opacity: index === currentIndex ? 1 : 0.3 }
          ]}
        />
      ))}
    </View>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.white} />
          <Text style={styles.loadingText}>Loading amazing features...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#4F46E5', '#7C3AED']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Lên kế hoạch thông minh, sống hiệu quả hơn!</Text>
            <Text style={styles.subtitle}>
              Khám phá cách AI giúp bạn quản lý thời gian và công việc dễ dàng hơn
            </Text>
          </View>

          <View style={styles.carouselContainer}>
            <FlatList
              data={features}
              renderItem={renderFeatureCard}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + CARD_MARGIN}
              decelerationRate="fast"
              // contentContainerStyle={styles.flatListContent}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            />
          </View>

          {renderDots()}

          <Animated.View style={[styles.ctaSection, {
            opacity: buttonAnim,
            transform: [{
              translateY: buttonAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              })
            }]
          }]}>
            <Button
              title="Bắt đầu"
              onPress={handleGetStarted}
              style={styles.getStartedButton}
              textStyle={styles.getStartedButtonText}
            />

            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Bỏ qua</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body1,
    color: Colors.white,
    marginTop: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    ...Typography.h2,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  subtitle: {
    ...Typography.body1,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  flatListContent: {
    paddingHorizontal: (screenWidth - CARD_WIDTH) / 2,
  },
  card: {
    width: CARD_WIDTH,
    height: 600,
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginHorizontal: CARD_MARGIN / 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    margin: 16,
  },
  imageIcon: {
    width: 200,
    height: 100,
    borderRadius: 8,
  },
  cardTitle: {
    ...Typography.h6,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  cardDescription: {
    ...Typography.body3,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
    marginHorizontal: 4,
  },
  ctaSection: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  getStartedButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  getStartedButtonText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipText: {
    ...Typography.body2,
    color: Colors.white,
    opacity: 0.8,
    textDecorationLine: 'underline',
  },
});