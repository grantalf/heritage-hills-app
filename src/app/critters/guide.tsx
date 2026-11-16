import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Emoji } from '@/components/game';
import { Choices, Screen, Txt, useUI } from '@/components/ui';
import type { CritterGroup } from '@/lib/data/game-types';
import { useLoad } from '@/lib/data/provider';
import { GROUPS, spottedIds } from '@/lib/game';
import { useT } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { radius, space } from '@/lib/theme';

type Filter = 'all' | CritterGroup;

export default function GuideScreen() {
  const { t, tl } = useT();
  const { c, round } = useUI();
  const { repo } = useSession();
  const [filter, setFilter] = useState<Filter>('all');
  const critters = useLoad((r) => r.listCritters());
  const spotted = spottedIds(repo.getGame());
  const shown = critters?.filter((x) => filter === 'all' || x.group === filter) ?? [];

  return (
    <Screen title={t('critters.guide')} subtitle={t('critters.guideCount', { found: spotted.size, total: critters?.length ?? 0 })}>
      <Choices
        label={t('critters.guideFilter')}
        value={filter}
        onChange={setFilter}
        options={[{ value: 'all' as Filter, label: t('common.all') }, ...GROUPS.map((g) => ({ value: g as Filter, label: t(`critters.group.${g}`) }))]}
      />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {shown.map((critter) => {
          const has = spotted.has(critter.id);
          return (
            <Pressable
              key={critter.id}
              accessibilityRole="button"
              accessibilityLabel={`${tl(critter.name)}. ${has ? t('critters.found') : t('critters.notFound')}`}
              onPress={() => router.push({ pathname: '/critters/[id]', params: { id: critter.id } })}
              style={({ pressed }) => ({
                flexBasis: '30%',
                flexGrow: 1,
                minHeight: 124,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                padding: space.sm,
                borderRadius: round(radius.lg),
                borderWidth: 2,
                borderColor: has ? c.primary : 'transparent',
                backgroundColor: pressed ? c.surfaceStrong : has ? c.primarySoft : c.surface,
              })}>
              <Emoji size={40} dim={!has}>
                {critter.emoji}
              </Emoji>
              <Txt variant="label" style={{ textAlign: 'center' }}>
                {tl(critter.name)}
              </Txt>
              <Txt variant="small" tone={has ? 'primary' : 'secondary'} style={{ textAlign: 'center' }}>
                {has ? '✓ ' + t('critters.found') : t(`critters.rarity.${critter.rarity}`)}
              </Txt>
            </Pressable>
          );
        })}
      </View>
      <Txt variant="small" tone="secondary">
        {t('critters.placeholderNote')}
      </Txt>
    </Screen>
  );
}
