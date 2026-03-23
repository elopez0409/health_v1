import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';

import { APP_COLORS } from '@/lib/constants';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: APP_COLORS.primary,
        headerStyle: { backgroundColor: APP_COLORS.background },
        headerTintColor: APP_COLORS.text,
        tabBarStyle: { backgroundColor: APP_COLORS.surface },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'house.fill', android: 'home', web: 'home' }} size={20} tintColor={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'chart.line.uptrend.xyaxis', android: 'insights', web: 'insights' }} size={20} tintColor={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'target', android: 'track_changes', web: 'gps_fixed' }} size={20} tintColor={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'bubble.left.and.bubble.right', android: 'chat', web: 'chat' }} size={20} tintColor={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'person.crop.circle', android: 'person', web: 'person' }} size={20} tintColor={color} />
          ),
        }}
      />
    </Tabs>
  );
}
