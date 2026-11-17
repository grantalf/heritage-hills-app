/**
 * Critter Club's title screen (block 3, D-066): it should feel like starting a
 * game. A wooden sign, a parade of pixel critters, the story, how to play, the
 * sound switch, and one big button into the map. A plain list is one tap away
 * for anyone who does not want the map.
 */
import { router } from 'expo-router';
import { Gamepad2, HandHeart, Home, List } from 'lucide-react-native';
import { View } from 'react-native';

import { Ink, Parchment, WoodSign } from '@/components/arcade/menu';
import { PixelCritter } from '@/components/quest/pixel-critter';
import { Bullets, Btn, CheckRow, Notice, RowLink, Screen, Tag, Txt } from '@/components/ui';
import { useT } from '@/lib/i18n';
import { RESCUE_IN_APP } from '@/lib/quest/levels';
import { START_PLACE } from '@/lib/quest/places';
import { meetHost } from '@/lib/quest/state';
import { saveWorld, useWorld } from '@/lib/quest/store';
import { space } from '@/lib/theme';

const PARADE = ['armadillo', 'heron', 'bumblebee', 'mockingbird', 'owl', 'cottontail', 'treefrog', 'monarch'];

export default function CritterTitleScreen() {
  const { t } = useT();
  const { world, ready } = useWorld();
  const played = world.visited.length > 1 || world.met.length > 0;

  const start = () => {
    // The very first time, Dilly at the statue says hello and gives the first quest.
    if (!world.intro) {
      saveWorld(meetHost({ ...world, intro: true }, START_PLACE));
      router.push({ pathname: '/critters/world', params: { open: START_PLACE, hello: '1' } });
      return;
    }
    router.push('/critters/world');
  };

  return (
    <Screen title={t('critters.title')} hideTitle>
      <WoodSign title={t('critters.title')} caption={t('zone.tagline')} />
      <View accessible accessibilityLabel={t('zone.parade')} style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4 }}>
        {PARADE.map((id) => (
          <PixelCritter key={id} id={id} size={36} />
        ))}
      </View>

      <Btn icon={Gamepad2} label={played ? t('zone.continue') : t('zone.start')} onPress={start} disabled={!ready} />

      <Parchment title={t('zone.storyTitle')}>
        <Ink>{t('zone.story')}</Ink>
        {RESCUE_IN_APP ? <Ink>{t('zone.storyRescue')}</Ink> : null}
      </Parchment>

      <Parchment title={t('zone.howTitle')}>
        <Bullets items={[t('zone.how1'), t('zone.how2'), t('zone.how3'), ...(RESCUE_IN_APP ? [t('zone.how4')] : [])]} />
      </Parchment>

      <CheckRow label={t('zone.sound')} hint={t('zone.soundHint')} checked={world.sound} onChange={(sound) => saveWorld({ ...world, sound })} />

      <Notice tone="primary" icon={HandHeart} title={t('zone.familyTitle')} body={t('zone.familyBody')} />
      <RowLink icon={List} title={t('zone.listInstead')} onPress={() => router.push('/critters/more')} />
      <RowLink icon={Home} title={t('menu.leave')} onPress={() => router.replace('/')} />
      <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
        <Tag tone="draft" label={t('common.draft')} />
        <Txt variant="small" tone="secondary" style={{ flex: 1 }}>
          {t('critters.draftNote')}
        </Txt>
      </View>
    </Screen>
  );
}
