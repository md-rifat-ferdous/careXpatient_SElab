import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

import { theme } from '../../lib/theme';

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'small';
  style?: TextStyle;
  color?: string;
}

export const Typography = ({ children, variant = 'body', style, color }: TypographyProps) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'h1': return styles.h1;
      case 'h2': return styles.h2;
      case 'h3': return styles.h3;
      case 'body': return styles.body;
      case 'small': return styles.small;
      default: return styles.body;
    }
  };

  return (
    <Text style={[getVariantStyle(), color ? { color } : null, style]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  h1: { fontSize: 32, fontWeight: '900', color: theme.colors.text, letterSpacing: -1 },
  h2: { fontSize: 24, fontWeight: '800', color: theme.colors.text, letterSpacing: -0.5 },
  h3: { fontSize: 20, fontWeight: '700', color: theme.colors.text },
  body: { fontSize: 16, color: theme.colors.textMuted, lineHeight: 24 },
  small: { fontSize: 14, color: theme.colors.textMuted, fontWeight: '500' },
});
