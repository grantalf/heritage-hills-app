import { TabList, Tabs, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { CalendarDays, House, Leaf, Menu, Users, type LucideIcon } from 'lucide-react-native';
import { Pressable, Text, View, type PressableProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUI } from '@/components/ui';
import { useT } from '@/lib/i18n';

export default function TabsLayout() {
  const { c } = useUI();
  const { t } = useT();
  const insets = useSafeAreaInsets();
  return (
    <Tabs style={{ flex: 1, backgroundColor: c.background }}>
      <TabSlot style={{ flex: 1 }} />
      <TabList
        // Screen readers then say "tab 2 of 5" (block 5 review, A-07).
        accessibilityRole="tablist"
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          backgroundColor: c.surface,
          borderTopWidth: 1,
          borderTopColor: c.surfaceStrong,
          paddingBottom: insets.bottom,
          paddingHorizontal: 4,
        }}>
        <TabTrigger name="home" href="/" asChild>
          <TabButton icon={House} label={t('tabs.home')} />
        </TabTrigger>
        <TabTrigger name="events" href="/events" asChild>
          <TabButton icon={CalendarDays} label={t('tabs.events')} />
        </TabTrigger>
        <TabTrigger name="neighbors" href="/neighbors" asChild>
          <TabButton icon={Users} label={t('tabs.neighbors')} />
        </TabTrigger>
        <TabTrigger name="nature" href="/nature" asChild>
          <TabButton icon={Leaf} label={t('tabs.nature')} />
        </TabTrigger>
        <TabTrigger name="more" href="/more" asChild>
          <TabButton icon={Menu} label={t('tabs.more')} />
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

function TabButton({ icon: Icon, label, isFocused, ...props }: TabTriggerSlotProps & { icon: LucideIcon; label: string }) {
  const { c, fs } = useUI();
  const color = isFocused ? c.primary : c.textSecondary;
  return (
    <Pressable
      {...(props as PressableProps)}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!isFocused }}
      aria-selected={!!isFocused}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 60,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        paddingVertical: 8,
        opacity: pressed ? 0.6 : 1,
      })}>
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 3,
          borderRadius: 999,
          backgroundColor: isFocused ? c.primarySoft : 'transparent',
        }}>
        <Icon color={color} size={24} strokeWidth={isFocused ? 2.5 : 2} />
      </View>
      {/* Follows the text size setting and wraps to two lines instead of being cut off (block 5 review, A-06, A-24). */}
      <Text
        numberOfLines={2}
        maxFontSizeMultiplier={1.6}
        style={{ color, fontSize: fs('small') - 1, lineHeight: (fs('small') - 1) * 1.2, fontWeight: isFocused ? '700' : '600', textAlign: 'center' }}>
        {label}
      </Text>
    </Pressable>
  );
}
