export const colors = {
  primary: '#0A1628',
  primaryLight: '#1A2A45',
  accent: '#2563EB',
  accentLight: '#3B82F6',
  accentDark: '#1D4ED8',
  white: '#FFFFFF',
  background: '#F5F7FA',
  card: '#FFFFFF',
  border: '#E5E7EB',
  borderLight: '#F0F0F0',
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  skeleton: '#E5E7EB',
  skeletonHighlight: '#F0F0F0',
  overlay: 'rgba(0,0,0,0.5)',
  messageSent: '#2563EB',
  messageReceived: '#F3F4F6',
  fuelBenzin: '#EF4444',
  fuelDizel: '#3B82F6',
  fuelPlin: '#10B981',
  fuelHibrid: '#8B5CF6',
  fuelElektricni: '#06B6D4',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
};

export function getFuelColor(fuel: string): string {
  switch (fuel) {
    case 'benzin': return colors.fuelBenzin;
    case 'dizel': return colors.fuelDizel;
    case 'plin': case 'benzin+plin': return colors.fuelPlin;
    case 'hibrid': return colors.fuelHibrid;
    case 'elektricni': return colors.fuelElektricni;
    default: return colors.textSecondary;
  }
}
