import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RepoProvider } from '@/lib/data/provider';
import { PrefsProvider, usePrefs } from '@/lib/prefs';
import { LOOKS } from '@/lib/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PrefsProvider>
        <RepoProvider>
          <Navigator />
        </RepoProvider>
      </PrefsProvider>
    </SafeAreaProvider>
  );
}

function Navigator() {
  const scheme = useColorScheme();
  const { look } = usePrefs();
  const c = scheme === 'dark' ? LOOKS[look].dark : LOOKS[look].light;
  return (
    <>
      {/* The draft banner at the top is dark in light mode and light in dark mode. */}
      <StatusBar style={scheme === 'dark' ? 'dark' : 'light'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.background } }} />
    </>
  );
}
