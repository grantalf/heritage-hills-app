/** The family fills in their pet's character card (block 4). Only the pet's own family can open it. */
import { router, useLocalSearchParams } from 'expo-router';
import { Check, Lock } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Parchment } from '@/components/arcade/menu';
import { CardFrame, PortraitPic, StatStepper } from '@/components/pet-card';
import { Btn, CheckRow, Choices, EmptyState, Field, Notice, Screen, SectionTitle, Txt } from '@/components/ui';
import { useLoad } from '@/lib/data/provider';
import { useT } from '@/lib/i18n';
import type { Pet } from '@/lib/data/game-types';
import { CLASS_IDS, FAVORITE_IDS, LIMITS, MAX_FAVORITES, STAT_IDS, checkText, toggleFavorite, type ClassId, type FavoriteId, type PetCard, type Stats, type TextProblem } from '@/lib/petcards';
import { useSession } from '@/lib/session';
import { space } from '@/lib/theme';

export default function EditCardScreen() {
  const { id, fresh } = useLocalSearchParams<{ id: string; fresh?: string }>();
  const { t } = useT();
  const { repo, isNeighbor } = useSession();
  const result = useLoad(async (r) => ({ pet: await r.getPet(id) }), id);
  const pet = result?.pet;
  const card = pet ? repo.cards.getCard(pet.id) : undefined;

  if (!pet || !card) return <Screen title={t('cards.editCard')}>{result ? <EmptyState icon={Lock} title={t('critters.missing')} /> : null}</Screen>;
  if (!pet.mine || !isNeighbor) return <Screen title={t('cards.editCard')}><EmptyState icon={Lock} title={t('cards.notYours')} /></Screen>;
  return <CardForm pet={pet} card={card} fresh={fresh === '1'} />;
}

/** Mounted once the card has loaded, so the form starts from what the card already says. */
function CardForm({ pet, card, fresh }: { pet: Pet; card: PetCard; fresh: boolean }) {
  const { t, tl } = useT();
  const { repo } = useSession();
  const [classId, setClassId] = useState<ClassId>(card.classId);
  const [stats, setStats] = useState<Stats>(card.stats);
  const [favorites, setFavorites] = useState<FavoriteId[]>(card.favorites);
  const [habits, setHabits] = useState(tl(card.mannerisms));
  const [move, setMove] = useState(tl(card.specialMove));

  const habitProblems = checkText(habits, LIMITS.mannerisms);
  const moveProblems = checkText(move, LIMITS.specialMove);
  const problems: TextProblem[] = [...new Set([...habitProblems, ...moveProblems])];

  return (
    <Screen
      title={t('cards.editTitle', { name: pet.name })}
      subtitle={t('cards.editSubtitle')}
      footer={
        <Btn
          icon={Check}
          label={t('cards.editSave')}
          disabled={problems.length > 0}
          onPress={() => {
            void repo.cards.saveCard({ petId: pet.id, classId, stats, favorites, mannerisms: habits, specialMove: move, photoAudience: card.photoAudience }).then(() => {
              // A brand-new pet's family lands on the finished card. Otherwise go back to where they were.
              if (fresh || !router.canGoBack()) router.replace({ pathname: '/critters/pet/[id]', params: { id: pet.id } });
              else router.back();
            });
          }}
        />
      }>
      <CardFrame
        name={pet.name}
        label={t('cards.cardOf', { name: pet.name })}
        picture={<PortraitPic id={pet.id} art={pet.art} emoji={pet.emoji} portrait={repo.cards.getPortrait(pet.id)} name={pet.name} size={120} />}
      />
      <Notice tone="primary" icon={Lock} title={t('critters.addPetRuleTitle')} body={t('cards.editNoAddress')} />

      <SectionTitle>{t('cards.editClass')}</SectionTitle>
      <Choices label={t('cards.editClass')} value={classId} onChange={setClassId} options={CLASS_IDS.map((c) => ({ value: c, label: t(`cards.class.${c}`) }))} />

      <SectionTitle>{t('cards.editStats')}</SectionTitle>
      <Parchment>
        <View style={{ gap: space.md }}>
          {STAT_IDS.map((s) => (
            <StatStepper key={s} id={s} value={stats[s]} onChange={(v) => setStats({ ...stats, [s]: v })} />
          ))}
        </View>
      </Parchment>

      <SectionTitle>{t('cards.editFavorites')}</SectionTitle>
      <Txt variant="small" tone="secondary">
        {favorites.length} / {MAX_FAVORITES}
      </Txt>
      <View style={{ gap: space.sm }}>
        {FAVORITE_IDS.map((f) => (
          <CheckRow key={f} label={t(`cards.fav.${f}`)} checked={favorites.includes(f)} onChange={() => setFavorites(toggleFavorite(favorites, f))} />
        ))}
      </View>

      <Field label={t('cards.editMannerisms')} hint={t('cards.editMannerismsHint')} value={habits} onChangeText={setHabits} maxLength={LIMITS.mannerisms} multiline style={{ minHeight: 80, textAlignVertical: 'top' }} />
      <Field label={t('cards.editSpecial')} hint={t('cards.editSpecialHint')} value={move} onChangeText={setMove} maxLength={LIMITS.specialMove} />
      {problems.map((p) => (
        <Txt key={p} tone="urgent">
          {t(`cards.problem.${p}`)}
        </Txt>
      ))}
    </Screen>
  );
}
