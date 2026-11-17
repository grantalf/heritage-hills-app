import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import { Camera, Check, Eye, ImagePlus, Lock, PartyPopper, TriangleAlert } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Platform, View } from 'react-native';

import { CritterPic } from '@/components/game';
import { RealPhotoCard } from '@/components/real-photo';
import { Btn, Card, Choices, EmptyState, Notice, Screen, SectionTitle, Tag, Txt, useUI } from '@/components/ui';
import { realPhotosUrl, scientificNames } from '@/lib/data/game-art';
import type { Zone } from '@/lib/data/game-types';
import { useLoad } from '@/lib/data/provider';
import { POINTS } from '@/lib/game';
import { useT } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { stripPhoto } from '@/lib/strip-photo';
import { radius, space } from '@/lib/theme';

const ZONES: Zone[] = ['yard', 'garden', 'street', 'park', 'creek', 'sky'];

export default function CritterScreen() {
  const { id, zone: zoneParam } = useLocalSearchParams<{ id: string; zone?: string }>();
  const { t, tl } = useT();
  const { c, round } = useUI();
  const { repo } = useSession();
  const result = useLoad(async (r) => ({ critter: await r.getCritter(id) }), id);
  const critter = result?.critter;
  // The map's "Look around" opens this page with the place's kind of place already picked.
  const [zone, setZone] = useState<Zone>(ZONES.includes(zoneParam as Zone) ? (zoneParam as Zone) : 'yard');
  const [photo, setPhoto] = useState<string | undefined>();
  const [photoProblem, setPhotoProblem] = useState(false);
  const [earned, setEarned] = useState<number | undefined>();

  if (!critter) {
    return <Screen title={t('critters.guide')}>{result ? <EmptyState icon={Eye} title={t('critters.missing')} /> : null}</Screen>;
  }
  const mine = repo.getGame().sightings.filter((s) => s.critterId === critter.id);
  const photos = mine.map((s) => repo.getSightingPhoto(s.id)).filter((uri): uri is string => !!uri);

  const pick = async (fromCamera: boolean) => {
    setPhotoProblem(false);
    try {
      if (fromCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) return setPhotoProblem(true);
      }
      const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.8, exif: false };
      const picked = fromCamera ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
      // exif: false does not clean the file. Drawing it again removes hidden details like where it was taken (block 4 finding).
      if (!picked.canceled && picked.assets[0]) setPhoto(await stripPhoto(picked.assets[0].uri));
    } catch {
      setPhotoProblem(true);
    }
  };

  const spot = () => {
    const first = mine.length === 0;
    void repo.addSighting(critter.id, zone, photo);
    setEarned(POINTS.sighting + (first ? POINTS.firstFind[critter.rarity] : 0));
    setPhoto(undefined);
  };

  return (
    <Screen title={tl(critter.name)} subtitle={t(`critters.group.${critter.group}`)}>
      <View style={{ alignItems: 'center' }}>
        <CritterPic id={critter.id} emoji={critter.emoji} size={170} />
        {scientificNames[critter.id] ? (
          <Txt variant="small" tone="secondary" style={{ fontStyle: 'italic' }}>
            {scientificNames[critter.id]}
          </Txt>
        ) : null}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        <Tag label={t(`critters.rarity.${critter.rarity}`)} />
        {mine.length > 0 ? <Tag tone="good" label={t('critters.foundTimes', { count: mine.length })} /> : null}
        <Tag tone="draft" label={t('common.draft')} />
      </View>

      <Card>
        <Txt variant="label">{t('critters.didYouKnow')}</Txt>
        <Txt variant="lead">{tl(critter.fact)}</Txt>
        <Txt variant="label">{t('critters.whereToLook')}</Txt>
        <Txt>{tl(critter.look)}</Txt>
      </Card>

      <RealPhotoCard name={tl(critter.name)} scientificName={scientificNames[critter.id]} moreUrl={realPhotosUrl(critter.id)} />

      {critter.caution ? <Notice tone="urgent" icon={TriangleAlert} title={t('critters.cautionTitle')} body={tl(critter.caution)} /> : null}

      <SectionTitle>{t('critters.spotTitle')}</SectionTitle>
      {earned !== undefined ? (
        <Notice tone="good" icon={PartyPopper} title={mine.length === 1 ? t('critters.newFind') : t('critters.spottedAgain')} body={t('critters.earned', { points: earned })} />
      ) : null}
      <Txt variant="label">{t('critters.zoneLabel')}</Txt>
      <Choices label={t('critters.zoneLabel')} value={zone} onChange={setZone} options={ZONES.map((z) => ({ value: z, label: t(`critters.zone.${z}`) }))} />

      <Txt variant="label">{t('critters.photoLabel')}</Txt>
      {photo ? (
        <Image source={{ uri: photo }} accessibilityLabel={t('critters.photoAlt', { name: tl(critter.name) })} style={{ width: '100%', height: 220, borderRadius: round(radius.lg), backgroundColor: c.surfaceStrong }} resizeMode="cover" />
      ) : null}
      {Platform.OS !== 'web' ? <Btn kind="secondary" icon={Camera} label={t('critters.takePhoto')} onPress={() => void pick(true)} /> : null}
      <Btn kind="secondary" icon={ImagePlus} label={photo ? t('critters.changePhoto') : t('critters.choosePhoto')} onPress={() => void pick(false)} />
      {photoProblem ? <Txt tone="urgent">{t('critters.photoProblem')}</Txt> : null}
      <Txt variant="small" tone="secondary">
        {t('critters.photoRules')}
      </Txt>

      <Btn icon={Check} label={t('critters.spotButton')} onPress={spot} />
      <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' }}>
        <Lock color={c.textSecondary} size={18} />
        <Txt variant="small" tone="secondary" style={{ flex: 1 }}>
          {t('critters.spotPrivacy')}
        </Txt>
      </View>

      {photos.length > 0 ? (
        <>
          <SectionTitle>{t('critters.myPhotos')}</SectionTitle>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {photos.map((uri, i) => (
              <Image key={i} source={{ uri }} accessibilityLabel={t('critters.photoAlt', { name: tl(critter.name) })} style={{ width: 104, height: 104, borderRadius: round(radius.md), backgroundColor: c.surfaceStrong }} />
            ))}
          </View>
          <Txt variant="small" tone="secondary">
            {t('critters.photosStay')}
          </Txt>
        </>
      ) : null}
    </Screen>
  );
}
