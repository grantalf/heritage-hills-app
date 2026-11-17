/**
 * A pet's character card (block 4, D-064, D-065): framed portrait, class,
 * stats, favorites, habits, special move, how to say hello, stickers and paw
 * notes. The pet's family also sees its own tools here.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { Ban, Camera, Check, Flag, Hand, Heart, Pencil, Send, ThumbsDown, ThumbsUp, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Image, View } from 'react-native';

import { Ink, Parchment } from '@/components/arcade/menu';
import { CardFrame, NoteCard, PortraitPic, StatBars, StickerPicker, TopStickers } from '@/components/pet-card';
import { Btn, EmptyState, Field, Notice, RowLink, SampleTag, Screen, SectionTitle, Tag, Txt } from '@/components/ui';
import { shortDay } from '@/lib/dates';
import { useLoad } from '@/lib/data/provider';
import { POINTS } from '@/lib/game';
import { useT } from '@/lib/i18n';
import { LIMITS, NOTES_ON_CARD, type NoteProblem } from '@/lib/petcards';
import { useSession } from '@/lib/session';
import { space } from '@/lib/theme';

export default function PetCardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, tl, language } = useT();
  const { repo, isNeighbor, needNeighbor } = useSession();
  const result = useLoad(async (r) => ({ pet: await r.getPet(id) }), id);
  const pet = result?.pet;
  const [text, setText] = useState('');
  const [problems, setProblems] = useState<NoteProblem[]>([]);
  const [sent, setSent] = useState(false);
  const [reported, setReported] = useState(false);

  if (!pet) {
    // Two reports hide a card right away, so the reporter sees a thank-you instead of the card.
    if (reported) {
      return (
        <Screen title={t('critters.pets')}>
          <Notice tone="good" icon={Check} title={t('cards.reportedTitle')} body={t('cards.reportedBody')} />
          <Btn label={t('critters.pets')} onPress={() => router.replace('/critters/pets')} />
        </Screen>
      );
    }
    return <Screen title={t('critters.pets')}>{result ? <EmptyState icon={Heart} title={t('critters.missing')} /> : null}</Screen>;
  }
  const family = pet.mine && isNeighbor;
  const card = repo.cards.getCard(pet.id)!;
  const hasCard = repo.cards.hasCard(pet.id);
  const stickers = repo.cards.getStickers(pet.id);
  const notes = repo.cards.getNotes(pet.id);
  const shown = notes.shown.filter((n) => !repo.hasReported(n.id) && !repo.isHidden(n.id));
  const photo = repo.cards.getPhoto(pet.id);
  const portrait = repo.cards.getPortrait(pet.id);
  const met = repo.getGame().petsMet.includes(pet.id);
  const favorites = card.favorites.map((f) => t(`cards.fav.${f}`));
  const habits = tl(card.mannerisms);
  const move = tl(card.specialMove);
  const classLabel = t(`cards.class.${card.classId}`);

  const send = () =>
    needNeighbor(() => {
      void repo.cards.sendNote(pet.id, text).then((found) => {
        setProblems(found);
        if (found.length === 0) {
          setText('');
          setSent(true);
        }
      });
    });

  return (
    <Screen title={pet.name} subtitle={tl(pet.about)} hideTitle>
      <CardFrame
        name={pet.name}
        label={t('cards.cardOf', { name: pet.name })}
        picture={<PortraitPic id={pet.id} art={pet.art} emoji={pet.emoji} portrait={portrait} name={pet.name} size={168} />}
        tags={
          <>
            <Tag label={`${t('cards.class')}: ${classLabel}`} />
            <Tag label={t(`critters.petKind.${pet.kind}`)} />
            {portrait?.kind === 'sample' ? <Tag tone="draft" label={t('cards.portraitSample')} /> : null}
            {met ? <Tag tone="good" label={'🐾 ' + t('critters.met')} /> : null}
            {pet.mine ? <Tag tone="notice" label={t('share.yours')} /> : null}
            {pet.sample ? <SampleTag /> : null}
          </>
        }
      />
      <Txt style={{ textAlign: 'center' }}>{tl(pet.about)}</Txt>
      {!portrait && pet.art ? (
        <Txt variant="small" tone="secondary" style={{ textAlign: 'center' }}>
          {t('cards.cartoonNote', { name: pet.name })}
        </Txt>
      ) : null}

      {photo ? (
        <Parchment title={t('cards.realPhoto')}>
          <Image source={{ uri: photo }} accessibilityLabel={t('cards.photoAlt', { name: pet.name })} style={{ width: '100%', height: 220, borderRadius: 4 }} resizeMode="cover" />
        </Parchment>
      ) : null}

      <Notice tone="primary" icon={Hand} title={t('critters.helloTitle')} body={tl(pet.hello)} />

      <Parchment title={t('cards.stats')}>
        <StatBars stats={card.stats} />
      </Parchment>

      {favorites.length || habits || move || tl(pet.loves) ? (
        <Parchment>
          {favorites.length ? (
            <>
              <Ink variant="label">{t('cards.favorites')}</Ink>
              <Ink>{favorites.join(' · ')}</Ink>
            </>
          ) : null}
          {tl(pet.loves) ? (
            <>
              <Ink variant="label">{t('critters.loves')}</Ink>
              <Ink>{tl(pet.loves)}</Ink>
            </>
          ) : null}
          {habits ? (
            <>
              <Ink variant="label">{t('cards.mannerisms')}</Ink>
              <Ink>{habits}</Ink>
            </>
          ) : null}
          {move ? (
            <>
              <Ink variant="label">{t('cards.specialMove')}</Ink>
              <Ink variant="lead">★ {move}</Ink>
            </>
          ) : null}
        </Parchment>
      ) : null}
      {tl(pet.where) ? (
        <Txt variant="small" tone="secondary">
          {t('critters.whereHint')}: {tl(pet.where)}
        </Txt>
      ) : null}

      {family ? null : met ? (
        <Notice tone="good" icon={Check} title={t('critters.metTitle', { name: pet.name })} body={t('critters.earned', { points: POINTS.petMet })} />
      ) : (
        <Btn icon={Heart} label={t('critters.meetButton', { name: pet.name })} onPress={() => void repo.meetPet(pet.id)} />
      )}

      <SectionTitle>{t('cards.stickersTitle')}</SectionTitle>
      <TopStickers counts={stickers.counts} />
      {family ? (
        <Txt variant="small" tone="secondary">
          {t('cards.stickersOwn')}
        </Txt>
      ) : (
        <>
          <Txt variant="small" tone="secondary">
            {t('cards.stickersHint')}
          </Txt>
          <StickerPicker mine={stickers.mine} onToggle={(s) => needNeighbor(() => void repo.cards.toggleSticker(pet.id, s))} />
        </>
      )}

      <SectionTitle>{t('cards.notesTitle')}</SectionTitle>
      <Txt variant="small" tone="secondary">
        {t('cards.notesRule')}
      </Txt>
      {shown.length === 0 ? <Txt tone="secondary">{t('cards.notesNone')}</Txt> : null}
      {shown.slice(0, NOTES_ON_CARD).map((n) => (
        <NoteCard key={n.id} note={n} date={shortDay(n.at, language)} onReport={family ? undefined : () => needNeighbor(() => void repo.reportItem(n.id))} onRemove={family ? () => void repo.cards.removeNote(n.id) : undefined} />
      ))}
      {shown.length > NOTES_ON_CARD ? (
        <RowLink title={t('cards.notesSeeAll', { count: shown.length })} href={{ pathname: '/critters/pet/notes', params: { id: pet.id } }} />
      ) : null}

      {family ? null : (
        <>
          <Field
            label={t('cards.noteLabel', { name: pet.name })}
            hint={t('cards.noteHint')}
            value={text}
            onChangeText={(v) => {
              setText(v);
              setSent(false);
              setProblems([]);
            }}
            multiline
            maxLength={LIMITS.note}
            style={{ minHeight: 96, textAlignVertical: 'top' }}
          />
          <Txt variant="small" tone="secondary">
            {t('cards.noteLeft', { count: LIMITS.note - text.length })}
          </Txt>
          {problems.map((p) => (
            <Txt key={p} tone="urgent">
              {t(`cards.problem.${p}`)}
            </Txt>
          ))}
          <Btn kind="secondary" icon={Send} label={t('cards.noteSend')} disabled={text.trim().length < LIMITS.noteMin} onPress={send} />
          {sent || notes.mineWaiting > 0 ? <Notice tone="good" icon={Check} title={t('cards.noteSentTitle')} body={t('cards.noteSentBody')} /> : null}
        </>
      )}

      {family ? (
        <>
          <SectionTitle>{t('cards.familyTitle', { name: pet.name })}</SectionTitle>
          <Btn icon={Pencil} label={hasCard ? t('cards.editCard') : t('cards.makeCard', { name: pet.name })} onPress={() => router.push({ pathname: '/critters/pet/edit', params: { id: pet.id } })} />
          <Btn kind="secondary" icon={Camera} label={t('cards.portraitButton')} onPress={() => router.push({ pathname: '/critters/pet/portrait', params: { id: pet.id } })} />
          {notes.waiting.length > 0 ? (
            <Parchment title={t('cards.waitingTitle', { count: notes.waiting.length })}>
              <Ink soft variant="small">
                {t('cards.waitingHint')}
              </Ink>
              {notes.waiting.map((n) => (
                <View key={n.id} style={{ gap: space.sm, borderTopWidth: 2, borderTopColor: '#e3cc98', paddingTop: space.sm }}>
                  <Ink>“{n.text}”</Ink>
                  {n.sample ? <SampleTag /> : null}
                  <Btn icon={ThumbsUp} label={t('cards.noteShow')} onPress={() => void repo.cards.decideNote(n.id, true)} />
                  <Btn kind="secondary" icon={ThumbsDown} label={t('cards.noteHide')} onPress={() => void repo.cards.decideNote(n.id, false)} />
                  <Btn kind="danger" icon={Ban} label={t('cards.noteBlock')} hint={t('cards.noteBlockHint')} onPress={() => void repo.cards.blockSender(n.id)} />
                </View>
              ))}
              <Ink soft variant="small">
                {t('cards.noteBlockHint')}
              </Ink>
            </Parchment>
          ) : null}
          <Btn
            kind="danger"
            icon={Trash2}
            label={t('critters.removePet')}
            onPress={() => {
              void repo.removePet(pet.id);
              router.back();
            }}
          />
        </>
      ) : (
        <>
          {reported || repo.hasReported(pet.id) ? (
            <Notice tone="good" icon={Check} title={t('cards.reportedTitle')} body={t('cards.reportedBody')} />
          ) : (
            <Btn
              kind="quiet"
              icon={Flag}
              label={t('cards.reportCard')}
              onPress={() =>
                needNeighbor(() => {
                  void repo.reportItem(pet.id);
                  setReported(true);
                })
              }
            />
          )}
        </>
      )}
    </Screen>
  );
}
