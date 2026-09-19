import React from 'react';
import { Image, StyleProp, ImageStyle } from 'react-native';

interface BrandMarkProps {
  size?: number;
  style?: StyleProp<ImageStyle>;
}

// The Orbit Mark app icon, rounded like the iOS icon mask.
export default function BrandMark({ size = 30, style }: BrandMarkProps) {
  return (
    <Image
      source={require('../assets/icon.png')}
      accessibilityLabel="Whyrl"
      style={[{ width: size, height: size, borderRadius: size * 0.225 }, style]}
    />
  );
}
