import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RepoProvider } from '@/lib/data/provider';
import { PrefsProvider } from '@/lib/prefs';
import { dark, light } from '@/lib/theme';

export default function RootLayout() {
  const scheme = useColorScheme();
  const c = scheme === 'dark' ? dark : light;
  return (
    <SafeAreaProvider>
      <PrefsProvider>
        <RepoProvider>
          {/* The draft banner at the top is dark in light mode and light in dark mode. */}
          <StatusBar style={scheme === 'dark' ? 'dark' : 'light'} />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.background } }} />
        </RepoProvider>
      </PrefsProvider>
    </SafeAreaProvider>
  );
}
