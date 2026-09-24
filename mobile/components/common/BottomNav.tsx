import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

interface NavItem {
  id: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
}

interface BottomNavProps {
  items: NavItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  /** Pastilles rouges (#EF4444) optionnelles : { idOnglet: nombre } */
  badges?: Record<string, number>;
  /** Ligne d'accent colorée (ex: rouge) sous l'onglet actif */
  accentColor?: string;
}

const ACCENT_RED = '#EF4444';

const BottomNav: React.FC<BottomNavProps> = ({
  items,
  activeTab,
  onTabChange,
  badges,
  accentColor,
}) => {
  return (
    <View style={styles.container}>
      {items.map((item) => {
        const isActive = activeTab === item.id;
        const badgeCount = badges?.[item.id];
        return (
          <Pressable
            key={item.id}
            onPress={() => onTabChange(item.id)}
            style={({ pressed }) => [styles.navItem, isActive && styles.navItemActive, pressed && { opacity: 0.8 }]}
          >
            {isActive && accentColor ? (
              <View style={[styles.activeAccent, { backgroundColor: accentColor }]} />
            ) : null}
            {/* Trait rouge discret en haut de l'onglet actif (borderTopWidth: 2). */}
            <View style={styles.iconContainer}>
              <Ionicons
                name={item.icon}
                size={24}
                color={isActive ? '#FFFFFF' : '#6B7280'}
                accessibilityLabel={item.label}
              />
              {typeof badgeCount === 'number' && badgeCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badgeCount > 99 ? '99+' : badgeCount}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#DDEAF7',
    boxShadow: '0px -3px 8px rgba(13,31,78,0.08)',
    elevation: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    paddingBottom: 16,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: '#0D1F4E',
    borderTopColor: ACCENT_RED,
    borderTopWidth: 2,
  },
  activeAccent: {
    position: 'absolute',
    top: 0,
    left: 14,
    right: 14,
    height: 3,
    borderRadius: 2,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -12,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: ACCENT_RED,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  labelActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default BottomNav;