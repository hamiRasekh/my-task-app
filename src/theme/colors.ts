// Galaxy/Space theme colors with glassmorphism
export const colors = {
  // Primary colors - Cosmic Purple/Blue
  primary: '#8b5cf6', // Purple
  primaryDark: '#7c3aed', // Deep Purple
  primaryLight: '#a78bfa', // Light Purple
  
  // Background colors - Deep Space
  background: '#0a0a0f', // Almost black with slight blue tint
  backgroundGradient: ['#0a0a0f', '#1a1a2e', '#16213e'], // Galaxy gradient
  surface: 'rgba(30, 30, 50, 0.7)', // Glass surface with blur
  surfaceVariant: 'rgba(50, 50, 80, 0.6)', // Lighter glass
  card: 'rgba(40, 40, 70, 0.8)', // Glass card
  
  // Glassmorphism backgrounds
  glass: 'rgba(255, 255, 255, 0.05)',
  glassLight: 'rgba(255, 255, 255, 0.1)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  
  // Text colors - Starlight
  text: '#ffffff', // Pure white
  textSecondary: '#b8b8d4', // Light purple-gray
  textDisabled: '#6b6b8f', // Muted purple-gray
  
  // Accent colors - Nebula colors
  accent: '#06b6d4', // Cyan (nebula)
  error: '#ef4444', // Red (supernova)
  warning: '#fbbf24', // Gold (star)
  info: '#3b82f6', // Blue (cosmic)
  
  // Status colors
  success: '#10b981', // Green (planet)
  danger: '#ef4444',
  
  // Border colors - Subtle glow
  border: 'rgba(139, 92, 246, 0.3)', // Purple glow
  borderLight: 'rgba(139, 92, 246, 0.15)',
  
  // Overlay - Deep space
  overlay: 'rgba(10, 10, 15, 0.9)',
  
  // Category colors - Galaxy palette
  categoryColors: [
    '#8b5cf6', // Purple
    '#6366f1', // Indigo
    '#3b82f6', // Blue
    '#06b6d4', // Cyan
    '#10b981', // Green
    '#fbbf24', // Gold
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#ec4899', // Pink
    '#a855f7', // Violet
  ],
};

export type ColorScheme = typeof colors;

