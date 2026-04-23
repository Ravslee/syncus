import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Animated, Easing, TouchableOpacity } from 'react-native';
import Svg, { Path, G, Text as SvgText } from 'react-native-svg';
import { Category } from '../types';
import { CATEGORIES } from '../constants';
import { Colors, Typography, Spacing, Shadows } from '../constants/theme';
import { GradientButton } from './GradientButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = {
  visible: boolean;
  onClose: () => void;
  onCategorySelected: (category: Category) => void;
};

export const SpinWheelModal: React.FC<Props> = ({ visible, onClose, onCategorySelected }) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const [spinning, setSpinning] = useState(false);
  const [selected, setSelected] = useState<Category | null>(null);

  const WHEEL_SIZE = 300;
  const RADIUS = WHEEL_SIZE / 2;
  const CENTER = RADIUS;

  // Reset when opened
  useEffect(() => {
    if (visible) {
      spinValue.setValue(0);
      setSpinning(false);
      setSelected(null);
    }
  }, [visible, spinValue]);

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);

    const sliceAngle = 360 / CATEGORIES.length;
    // Select a random category
    const randomIndex = Math.floor(Math.random() * CATEGORIES.length);
    
    // Calculate mid angle of the target slice (in degrees)
    const midAngle = randomIndex * sliceAngle + sliceAngle / 2;
    
    // We want this midAngle to land at the top (-90 degrees)
    // Rotation = 360 * spins - 90 - midAngle
    const spins = 5; // number of full rotations
    const finalAngle = (360 * spins) - 90 - midAngle;

    Animated.timing(spinValue, {
      toValue: finalAngle,
      duration: 3500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setSelected(CATEGORIES[randomIndex]);
    });
  };

  const handleContinue = () => {
    if (selected) {
      onCategorySelected(selected);
    }
  };

  const spinInterpolate = spinValue.interpolate({
    inputRange: [-3600, 3600],
    outputRange: ['-3600deg', '3600deg'],
  });

  const renderSlices = () => {
    const numSlices = CATEGORIES.length;
    const angleStep = (2 * Math.PI) / numSlices;

    return CATEGORIES.map((cat, index) => {
      const startAngle = index * angleStep;
      const endAngle = (index + 1) * angleStep;

      const x1 = CENTER + RADIUS * Math.cos(startAngle);
      const y1 = CENTER + RADIUS * Math.sin(startAngle);
      const x2 = CENTER + RADIUS * Math.cos(endAngle);
      const y2 = CENTER + RADIUS * Math.sin(endAngle);

      // Path data for a wedge
      const d = `M ${CENTER} ${CENTER} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 0 1 ${x2} ${y2} Z`;

      // Position for the icon
      const midAngle = startAngle + angleStep / 2;
      const iconRadius = RADIUS * 0.65;
      const iconX = CENTER + iconRadius * Math.cos(midAngle);
      const iconY = CENTER + iconRadius * Math.sin(midAngle);

      return (
        <G key={cat.id}>
          <Path d={d} fill={cat.color} />
          <SvgText
            x={iconX}
            y={iconY}
            fill="#FFF"
            fontSize="28"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {cat.icon}
          </SvgText>
        </G>
      );
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} disabled={spinning}>
            <Icon name="close" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>

          <Text style={styles.title}>
            {selected ? "It's decided!" : "Spin the Wheel"}
          </Text>
          <Text style={styles.subtitle}>
            {selected ? `You're playing ${selected.name}` : "Let fate choose your vibe"}
          </Text>

          <View style={styles.wheelContainer}>
            {/* Pointer */}
            <View style={styles.pointer}>
              <Icon name="menu-down" size={48} color={Colors.primary} />
            </View>

            {/* Wheel */}
            <Animated.View style={{ transform: [{ rotate: spinInterpolate }] }}>
              <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
                <G>{renderSlices()}</G>
                {/* Center dot */}
                <View style={styles.centerDot} />
              </Svg>
            </Animated.View>
            <View style={[styles.centerDot, { top: WHEEL_SIZE/2 - 15, left: WHEEL_SIZE/2 - 15 }]} />
          </View>

          {!selected ? (
            <GradientButton
              title={spinning ? "Spinning..." : "SPIN NOW"}
              onPress={handleSpin}
              disabled={spinning}
              size="lg"
              style={styles.actionButton}
            />
          ) : (
            <GradientButton
              title="Let's Go!"
              onPress={handleContinue}
              size="lg"
              style={styles.actionButton}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
    ...Shadows.glow,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    padding: Spacing.sm,
    zIndex: 10,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  wheelContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  pointer: {
    position: 'absolute',
    top: -24,
    zIndex: 10,
  },
  centerDot: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.surface,
    ...Shadows.glow,
  },
  actionButton: {
    width: '100%',
  },
});
