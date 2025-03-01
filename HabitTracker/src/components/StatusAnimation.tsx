import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

interface StatusAnimationProps {
  status: 'done' | 'failed';
  onAnimationComplete: () => void;
}

const { width, height } = Dimensions.get('window');

const StatusAnimation: React.FC<StatusAnimationProps> = ({ status, onAnimationComplete }) => {
  const { theme } = useTheme();
  
  // Animation values
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const particleOpacity = useSharedValue(0);
  
  // Setup animations
  useEffect(() => {
    // Start the animation sequence
    opacity.value = withSequence(
      withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) }),
      withDelay(
        1000,
        withTiming(0, { duration: 300, easing: Easing.in(Easing.ease) }, (finished) => {
          if (finished) {
            runOnJS(onAnimationComplete)();
          }
        })
      )
    );
    
    scale.value = withSequence(
      withTiming(1.2, { duration: 300, easing: Easing.out(Easing.back(2)) }),
      withTiming(1, { duration: 200 }),
      withDelay(800, withTiming(0.8, { duration: 300 }))
    );
    
    particleOpacity.value = withSequence(
      withDelay(100, withTiming(1, { duration: 200 })),
      withDelay(600, withTiming(0, { duration: 400 }))
    );
  }, []);
  
  // Animated styles
  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });
  
  const particlesStyle = useAnimatedStyle(() => {
    return {
      opacity: particleOpacity.value,
    };
  });
  
  // Render particles for success animation
  const renderSuccessParticles = () => {
    const particles = [];
    const particleCount = 12;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i * 2 * Math.PI) / particleCount;
      const x = Math.cos(angle) * 50;
      const y = Math.sin(angle) * 50;
      
      particles.push(
        <Animated.View
          key={i}
          style={[
            styles.particle,
            particlesStyle,
            {
              backgroundColor: theme.colors.success,
              transform: [
                { translateX: x },
                { translateY: y },
                { scale: 1 - i * 0.02 },
              ],
            },
          ]}
        />
      );
    }
    
    return particles;
  };
  
  // Render particles for failure animation
  const renderFailureParticles = () => {
    const particles = [];
    const particleCount = 8;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i * 2 * Math.PI) / particleCount;
      const x = Math.cos(angle) * 40;
      const y = Math.sin(angle) * 40;
      
      particles.push(
        <Animated.View
          key={i}
          style={[
            styles.failParticle,
            particlesStyle,
            {
              backgroundColor: theme.colors.error,
              transform: [
                { translateX: x },
                { translateY: y },
                { rotate: `${angle}rad` },
              ],
            },
          ]}
        />
      );
    }
    
    return particles;
  };
  
  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.container, containerStyle]}>
        {status === 'done' ? (
          <>
            <Icon name="check-circle" size={80} color={theme.colors.success} />
            <Text style={[styles.text, { color: theme.colors.success }]}>Great job!</Text>
            <View style={styles.particlesContainer}>{renderSuccessParticles()}</View>
          </>
        ) : (
          <>
            <Icon name="emoticon-sad-outline" size={80} color={theme.colors.error} />
            <Text style={[styles.text, { color: theme.colors.error }]}>Don't worry, try again tomorrow!</Text>
            <View style={styles.particlesContainer}>{renderFailureParticles()}</View>
          </>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.8,
    maxWidth: 300,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  particlesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  failParticle: {
    position: 'absolute',
    width: 12,
    height: 4,
    borderRadius: 2,
  },
});

export default StatusAnimation; 