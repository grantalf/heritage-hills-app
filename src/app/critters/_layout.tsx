/**
 * The Critter Club game zone (block 3, D-066). Every screen under /critters
 * wears the zone's wood-and-parchment colors, shows animals as pixel critters,
 * and has the zone's own menu bar. The title screen has no menu bar.
 */
import { Stack, usePathname } from 'expo-router';
import { View } from 'react-native';

import { PixelMode } from '@/components/game';
import { ZoneColors, ZoneMenu } from '@/components/quest/zone';
import { ZONE } from '@/lib/quest/palette';

export default function CritterZoneLayout() {
  const path = usePathname();
  const title = path === '/critters' || path === '/critters/';
  return (
    <ZoneColors>
      <PixelMode.Provider value>
        <View style={{ flex: 1, backgroundColor: ZONE.background }}>
          <View style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: ZONE.background } }} />
          </View>
          {title ? null : <ZoneMenu />}
        </View>
      </PixelMode.Provider>
    </ZoneColors>
  );
}
