import { useRef, useCallback } from 'react';
import {
  View,
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 80;
const ACTION_WIDTH = 80;

interface SwipeAction {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  backgroundColor: string;
  onPress: () => void;
}

interface SwipeableRowProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}

export function SwipeableRow({
  children,
  leftActions = [],
  rightActions = [],
  onSwipeStart,
  onSwipeEnd,
}: SwipeableRowProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const actionScaleLeft = useRef(new Animated.Value(0.8)).current;
  const actionScaleRight = useRef(new Animated.Value(0.8)).current;
  const isSwipingRef = useRef(false);
  const lastOffsetX = useRef(0);

  const maxLeftSwipe = leftActions.length * ACTION_WIDTH;
  const maxRightSwipe = rightActions.length * ACTION_WIDTH;

  const resetPosition = useCallback(() => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: false, // Must be false since we use setValue() during pan gestures
      tension: 100,
      friction: 10,
    }).start();
    lastOffsetX.current = 0;
  }, [translateX]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal swipes
        const { dx, dy } = gestureState;
        return Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10;
      },
      onPanResponderGrant: () => {
        isSwipingRef.current = true;
        onSwipeStart?.();
        translateX.setOffset(lastOffsetX.current);
        translateX.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        const { dx } = gestureState;
        const newValue = Math.max(
          -maxRightSwipe,
          Math.min(maxLeftSwipe, dx)
        );
        translateX.setValue(newValue);

        // Scale animation for actions
        const progress = Math.min(Math.abs(newValue) / SWIPE_THRESHOLD, 1);
        if (newValue > 0 && leftActions.length > 0) {
          actionScaleLeft.setValue(0.8 + progress * 0.2);
        } else if (newValue < 0 && rightActions.length > 0) {
          actionScaleRight.setValue(0.8 + progress * 0.2);
        }

        // Haptic feedback at threshold
        if (Math.abs(newValue) >= SWIPE_THRESHOLD && Math.abs(lastOffsetX.current) < SWIPE_THRESHOLD) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        translateX.flattenOffset();
        isSwipingRef.current = false;
        onSwipeEnd?.();

        const { dx, vx } = gestureState;
        const currentValue = lastOffsetX.current + dx;

        // Determine if we should snap to open or closed
        let targetValue = 0;

        if (currentValue > SWIPE_THRESHOLD || (vx > 0.5 && leftActions.length > 0)) {
          targetValue = maxLeftSwipe;
        } else if (currentValue < -SWIPE_THRESHOLD || (vx < -0.5 && rightActions.length > 0)) {
          targetValue = -maxRightSwipe;
        }

        lastOffsetX.current = targetValue;

        Animated.spring(translateX, {
          toValue: targetValue,
          useNativeDriver: false, // Must be false since we use setValue() during pan gestures
          tension: 100,
          friction: 10,
        }).start();

        // Reset action scales
        Animated.spring(actionScaleLeft, {
          toValue: targetValue > 0 ? 1 : 0.8,
          useNativeDriver: false, // Must be false since we use setValue() during pan gestures
        }).start();
        Animated.spring(actionScaleRight, {
          toValue: targetValue < 0 ? 1 : 0.8,
          useNativeDriver: false, // Must be false since we use setValue() during pan gestures
        }).start();
      },
      onPanResponderTerminate: () => {
        isSwipingRef.current = false;
        onSwipeEnd?.();
        resetPosition();
      },
    })
  ).current;

  const handleActionPress = (action: SwipeAction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    resetPosition();
    // Small delay to let animation start
    setTimeout(() => {
      action.onPress();
    }, 100);
  };

  const renderLeftActions = () => {
    if (leftActions.length === 0) return null;

    return (
      <View style={[styles.actionsContainer, styles.leftActions]}>
        {leftActions.map((action, index) => (
          <Animated.View
            key={index}
            style={[
              styles.actionButton,
              { backgroundColor: action.backgroundColor, transform: [{ scale: actionScaleLeft }] },
            ]}
          >
            <Pressable
              onPress={() => handleActionPress(action)}
              style={styles.actionPressable}
            >
              <Ionicons name={action.icon} size={24} color={action.color} />
            </Pressable>
          </Animated.View>
        ))}
      </View>
    );
  };

  const renderRightActions = () => {
    if (rightActions.length === 0) return null;

    return (
      <View style={[styles.actionsContainer, styles.rightActions]}>
        {rightActions.map((action, index) => (
          <Animated.View
            key={index}
            style={[
              styles.actionButton,
              { backgroundColor: action.backgroundColor, transform: [{ scale: actionScaleRight }] },
            ]}
          >
            <Pressable
              onPress={() => handleActionPress(action)}
              style={styles.actionPressable}
            >
              <Ionicons name={action.icon} size={24} color={action.color} />
            </Pressable>
          </Animated.View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderLeftActions()}
      {renderRightActions()}
      <Animated.View
        style={[styles.content, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
  },
  content: {
    backgroundColor: 'transparent',
  },
  actionsContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftActions: {
    left: 0,
  },
  rightActions: {
    right: 0,
  },
  actionButton: {
    width: ACTION_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionPressable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
