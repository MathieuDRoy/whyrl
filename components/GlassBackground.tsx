import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { theme } from '../constants/theme';

// Deep Teal ground with soft light blooms; glass panels sit on top of this.
export default function GlassBackground() {
  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.bg, overflow: 'hidden' }]}
    >
      <Image
        source={require('../assets/bg-bloom.jpg')}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
});
