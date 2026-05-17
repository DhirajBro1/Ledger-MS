import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { CustomersVector, HomeVector, ProfileVector } from '@/components/ui/vector-images';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';

export default function TabLayout() {
  const { colorScheme } = useTheme();
  const { token, user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!token || !user) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <HomeVector size={27} color={color} secondaryColor={Colors[colorScheme ?? 'light'].icon} />,
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: 'Customers',
          tabBarIcon: ({ color }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <CustomersVector size={27} color={color} secondaryColor={Colors[colorScheme ?? 'light'].icon} />
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: color,
                }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <ProfileVector size={27} color={color} secondaryColor={Colors[colorScheme ?? 'light'].icon} />,
        }}
      />
    </Tabs>
  );
}
