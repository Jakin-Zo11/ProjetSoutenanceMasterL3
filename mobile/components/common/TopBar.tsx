import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TopBarProps {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  showNotification?: boolean;
  onNotificationPress?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  showNotification = true,
  onNotificationPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        {showBackButton && (
          <Pressable onPress={onBackPress} style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.8 }]}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
        )}
        <Image
          source={require('../../assets/images/Logo-emit.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        {title && <Text style={styles.title}>{title}</Text>}
      </View>
      {showNotification && (
        <Pressable onPress={onNotificationPress} style={({ pressed }) => [styles.notificationButton, pressed && { opacity: 0.8 }]}>
          <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
          <View style={styles.notificationBadge} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0D1F4E',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 36,
    height: 36,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  backButton: {
    padding: 8,
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    backgroundColor: '#FF4444',
    borderRadius: 4,
  },
});

export default TopBar;
