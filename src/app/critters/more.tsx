/**
 * Everything in Critter Club as a plain list, with no map needed. Every map
 * action is reachable from here (STYLE_BRIEF.md): places, the field guide,
 * cases, bingo, the tally, patterns, pets, quests and the rules.
 */
import { router } from 'expo-router';
import { BookOpen, ChartColumn, FileSearch, Globe, Grid3x3, HandHeart, Home, MapPin, PawPrint, ScrollText, Swords } from 'lucide-react-native';
import { View } from 'react-native';

import { PixelCritter } from '@/components/quest/pixel-critter';
import { RowLink, Screen, SectionTitle } from '@/components/ui';
import { useT } from '@/lib/i18n';
import { levelLink } from '@/lib/quest/levels';
import { PLACES, type Place } from '@/lib/quest/places';
import { arrive, meetHost } from '@/lib/quest/state';
import { saveWorld, useWorld } from '@/lib/quest/store';
import { space } from '@/lib/theme';

export default function ZoneMoreScreen() {
  const { t } = useT();
  const { world } = useWorld();

  /** Go to a place without the map: the traveler is simply there, and its card opens on the map screen. */
  const visit = (place: Place) => {
    let next = arrive(world, place.id);
    if (place.host) next = meetHost(next, place.id);
    saveWorld(next);
    if (place.kind === 'rescue') {
      const link = levelLink(place.activities[0]?.kind === 'rescue' ? place.activities[0].level : '');
      if (link.ready) return router.push(link.href as never);
    }
    router.replace({ pathname: '/critters/world', params: { open: place.id } });
  };

  return (
    <Screen title={t('menu.moreTitle')}>
      <View style={{ gap: space.sm }}>
        <RowLink icon={BookOpen} title={t('critters.guide')} subtitle={t('act.guideHint')} href="/critters/guide" />
        <RowLink icon={ScrollText} title={t('quest.log')} subtitle={t('quest.logSubtitle')} href="/critters/quests" />
        <RowLink icon={FileSearch} title={t('critters.mysteries')} subtitle={t('act.casesHint')} href="/critters/cases" />
        <RowLink icon={Grid3x3} title={t('critters.bingo')} subtitle={t('critters.bingoHint')} href="/critters/bingo" />
        <RowLink icon={Globe} title={t('critters.tally')} subtitle={t('critters.tallyHint')} href="/critters/tally" />
        <RowLink icon={ChartColumn} title={t('critters.patterns')} subtitle={t('critters.patternsHint')} href="/critters/patterns" />
        <RowLink icon={PawPrint} title={t('critters.pets')} subtitle={t('critters.petsSubtitle')} href="/critters/pets" />
        <RowLink icon={HandHeart} title={t('critters.rules')} subtitle={t('critters.rulesHint')} href="/critters/rules" />
      </View>

      <SectionTitle>{t('world.showList')}</SectionTitle>
      <View style={{ gap: space.sm }}>
        {PLACES.map((p) => (
          <RowLink
            key={p.id}
            icon={p.kind === 'rescue' ? Swords : MapPin}
            tone={p.kind === 'rescue' ? 'notice' : 'primary'}
            title={t(`place.${p.id}.name`)}
            subtitle={`${t(`world.kind.${p.kind}`)}${p.id === world.at ? `. ${t('world.youAreHere')}` : ''}`}
            onPress={() => visit(p)}
            right={p.host ? <PixelCritter id={p.host} size={36} /> : undefined}
          />
        ))}
      </View>

      <View style={{ gap: space.sm }}>
        <RowLink icon={Home} title={t('menu.leave')} onPress={() => router.replace('/')} />
      </View>
    </Screen>
  );
}
