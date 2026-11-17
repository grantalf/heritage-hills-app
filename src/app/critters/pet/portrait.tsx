/**
 * Real photo and portrait request, for the pet's family (block 4, D-059).
 * The agreement screen says who will see the photo and names the image
 * service before anything is sent (Apple guideline 5.1.2(i)). In the draft
 * nothing leaves the phone.
 */
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import { Camera, Check, ImagePlus, Lock, Send, ShieldCheck, Trash2, TriangleAlert, Undo2 } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Platform, View } from 'react-native';

import { Ink, Parchment } from '@/components/arcade/menu';
import { Bullets, Btn, CheckRow, Choices, EmptyState, Notice, Screen, SectionTitle, Txt } from '@/components/ui';
import { useLoad } from '@/lib/data/provider';
import { useT } from '@/lib/i18n';
import { canChangePhoto, PORTRAIT_SERVICE, type PhotoAudience, type PortraitRequest } from '@/lib/petcards';
import { stripPhoto } from '@/lib/strip-photo';
import { useSession } from '@/lib/session';
import { space } from '@/lib/theme';

const AUDIENCES: PhotoAudience[] = ['maker', 'neighbors'];

export default function PortraitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useT();
  const { repo, isNeighbor } = useSession();
  const result = useLoad(async (r) => ({ pet: await r.getPet(id) }), id);
  const pet = result?.pet;
  const [agreed, setAgreed] = useState(false);
  const [problem, setProblem] = useState(false);

  if (!pet) return <Screen title={t('cards.portraitTitle')}>{result ? <EmptyState icon={Lock} title={t('critters.missing')} /> : null}</Screen>;
  if (!pet.mine || !isNeighbor) return <Screen title={t('cards.portraitTitle')}><EmptyState icon={Lock} title={t('cards.notYours')} /></Screen>;

  const card = repo.cards.getCard(pet.id)!;
  const photo = repo.cards.getPhoto(pet.id);
  const request = repo.cards.getRequest(pet.id);
  const open = request && (request.status === 'waiting' || request.status === 'photoOk' || request.status === 'sentBack');
  // The photo the portrait maker checks is the photo that goes out (block 5 review).
  const photoLocked = !canChangePhoto(request);
  const problems = repo.cards.requestProblems(pet.id, agreed).filter((p) => p !== 'notAgreed' && p !== 'noPhoto');
  const service = PORTRAIT_SERVICE.name ?? t('cards.serviceNone');

  const pick = async (fromCamera: boolean) => {
    setProblem(false);
    try {
      if (fromCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) return setProblem(true);
      }
      const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.8, exif: false };
      const picked = fromCamera ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
      // Drawn again as a new picture, so hidden details like where it was taken are gone. If that fails, the photo is not kept.
      if (!picked.canceled && picked.assets[0]) repo.cards.setPhoto(pet.id, await stripPhoto(picked.assets[0].uri));
    } catch {
      setProblem(true);
    }
  };

  const setAudience = (photoAudience: PhotoAudience) =>
    void repo.cards.saveCard({ petId: pet.id, classId: card.classId, stats: card.stats, favorites: card.favorites, mannerisms: card.mannerisms.en, specialMove: card.specialMove.en, photoAudience });

  return (
    <Screen title={t('cards.portraitTitle')} subtitle={t('cards.portraitSubtitle', { name: pet.name })}>
      <SectionTitle>{t('cards.realPhoto')}</SectionTitle>
      {photo ? <Image source={{ uri: photo }} accessibilityLabel={t('cards.photoAlt', { name: pet.name })} style={{ width: '100%', height: 240, borderRadius: 6 }} resizeMode="cover" /> : null}
      <Txt>{t('cards.photoRules')}</Txt>
      {photoLocked ? <Txt variant="small" tone="secondary">{t('cards.photoLocked')}</Txt> : null}
      {Platform.OS !== 'web' && !photoLocked ? <Btn kind="secondary" icon={Camera} label={t('cards.photoTake')} onPress={() => void pick(true)} /> : null}
      {!photoLocked ? <Btn kind="secondary" icon={ImagePlus} label={photo ? t('cards.photoChange') : t('cards.photoAdd')} onPress={() => void pick(false)} /> : null}
      {photo && !open ? <Btn kind="danger" icon={Trash2} label={t('cards.photoRemove')} onPress={() => repo.cards.setPhoto(pet.id, undefined)} /> : null}
      {problem ? <Txt tone="urgent">{t('cards.photoProblem')}</Txt> : null}
      <Txt variant="small" tone="secondary">
        {t('cards.photoDraftNote')}
      </Txt>

      <Txt variant="label">{t('cards.photoWho')}</Txt>
      <Choices label={t('cards.photoWho')} value={card.photoAudience} onChange={setAudience} options={AUDIENCES.map((a) => ({ value: a, label: t(`cards.photoWho.${a}`) }))} />
      <Txt variant="small" tone="secondary">
        {t('cards.photoWhoHint')}
      </Txt>

      <SectionTitle>{t('cards.requestSend')}</SectionTitle>
      {request ? <RequestStatus request={request} /> : null}
      {open ? (
        <>
          {request.status === 'sentBack' ? <Btn icon={Send} label={t('cards.requestResend')} disabled={!photo} onPress={() => repo.cards.resendPhoto(request.id)} /> : null}
          <Btn kind="secondary" icon={Undo2} label={t('cards.requestCancel')} onPress={() => repo.cards.cancelRequest(request.id)} />
        </>
      ) : (
        <>
          <Parchment title={t('cards.agreeTitle')}>
            <Bullets items={[t('cards.agree1'), t('cards.agree2', { service }), t('cards.agree3'), t('cards.agree4'), t('cards.agree5'), t('cards.agree6')]} />
          </Parchment>
          <CheckRow label={t('cards.agreeCheck')} checked={agreed} onChange={setAgreed} />
          {!photo ? <Txt tone="secondary">{t('cards.requestNeedsPhoto')}</Txt> : null}
          {problems.map((p) => (
            <Txt key={p} tone="urgent">
              {t(`cards.requestProblem.${p}`)}
            </Txt>
          ))}
          <Btn
            icon={ShieldCheck}
            label={request?.status === 'made' ? t('cards.requestAgain') : t('cards.requestSend')}
            disabled={!agreed || !photo || problems.length > 0}
            onPress={() => {
              if (repo.cards.requestPortrait(pet.id, agreed).length === 0) setAgreed(false);
            }}
          />
          <Notice tone="notice" icon={TriangleAlert} title={t('common.draft')} body={t('cards.requestDemo')} />
        </>
      )}

      {repo.cards.getPortrait(pet.id) ? <Btn kind="danger" icon={Trash2} label={t('cards.removePortrait')} onPress={() => void repo.cards.removePortrait(pet.id)} /> : null}
    </Screen>
  );
}

function RequestStatus({ request }: { request: PortraitRequest }) {
  const { t } = useT();
  const good = request.status === 'made' || request.status === 'waiting' || request.status === 'photoOk';
  return (
    <Notice tone={request.status === 'sentBack' ? 'urgent' : good ? 'good' : 'notice'} icon={request.status === 'sentBack' ? TriangleAlert : Check} title={t(`cards.request.${request.status}`)}>
      {request.status === 'sentBack' && request.sentBackReason ? (
        <View style={{ gap: space.xs }}>
          <Ink>{t(`cards.sendBack.${request.sentBackReason}`)}</Ink>
          <Ink soft variant="small">
            {t('cards.photoRules')}
          </Ink>
        </View>
      ) : null}
    </Notice>
  );
}
