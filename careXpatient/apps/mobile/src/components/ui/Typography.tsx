import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

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
  h1: { fontSize: 28, fontWeight: 'bold', color: '#0F172A' },
  h2: { fontSize: 24, fontWeight: 'bold', color: '#0F172A' },
  h3: { fontSize: 20, fontWeight: '600', color: '#0F172A' },
  body: { fontSize: 16, color: '#64748B' },
  small: { fontSize: 14, color: '#94A3B8' },
});
