import { router, useLocalSearchParams } from 'expo-router';
import { BookOpen, Lightbulb, PartyPopper, Search, Sprout } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Emoji } from '@/components/game';
import { Btn, Card, EmptyState, Notice, SampleTag, Screen, SectionTitle, Txt, useUI } from '@/components/ui';
import { useLoad } from '@/lib/data/provider';
import { mysteryPoints } from '@/lib/game';
import { useT } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { radius, space } from '@/lib/theme';

export default function MysteryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, tl } = useT();
  const { c, round } = useUI();
  const { repo } = useSession();
  const result = useLoad(async (r) => ({ mystery: (await r.listMysteries()).find((m) => m.id === id) }), id);
  const mystery = result?.mystery;
  const [shown, setShown] = useState(1);

  if (!mystery) {
    return <Screen title={t('critters.mysteries')}>{result ? <EmptyState icon={Search} title={t('critters.missing')} /> : null}</Screen>;
  }
  const done = repo.getGame().mysteries[mystery.id];
  const clues = done ? 3 : shown;
  const answer = mystery.options.find((o) => o.id === mystery.answerId);

  return (
    <Screen title={tl(mystery.title)} subtitle={tl(mystery.intro)}>
      {mystery.sample ? <SampleTag /> : null}

      <SectionTitle>{t('critters.clues')}</SectionTitle>
      {mystery.clues.slice(0, clues).map((clue, i) => (
        <Card key={i}>
          <Txt variant="label" tone="primary">
            {t('critters.clueNumber', { n: i + 1 })}
          </Txt>
          <Txt variant="lead">{tl(clue)}</Txt>
        </Card>
      ))}
      {!done && shown < 3 ? <Btn kind="secondary" icon={Lightbulb} label={t('critters.moreClue')} hint={t('critters.moreClueHint')} onPress={() => setShown(shown + 1)} /> : null}

      {done ? (
        <>
          <Notice
            tone={done.solved ? 'good' : 'primary'}
            icon={done.solved ? PartyPopper : BookOpen}
            title={done.solved ? t('critters.caseClosed') : t('critters.caseNotQuite')}
            body={done.solved ? t('critters.earned', { points: mysteryPoints(done) }) : undefined}
          />
          <Card>
            <View style={{ alignItems: 'center' }}>
              <Emoji size={72}>{answer?.emoji ?? '❓'}</Emoji>
            </View>
            <Txt variant="lead">{tl(mystery.reveal)}</Txt>
          </Card>
          <Notice tone="good" icon={Sprout} title={t('nature.oneThing')} body={tl(mystery.action)} />
          <Btn
            kind="secondary"
            label={mystery.kind === 'pet' ? t('critters.seePet') : t('critters.seeInGuide')}
            onPress={() =>
              mystery.kind === 'pet'
                ? router.push({ pathname: '/critters/pet/[id]', params: { id: mystery.answerId } })
                : router.push({ pathname: '/critters/[id]', params: { id: mystery.answerId } })
            }
          />
        </>
      ) : (
        <>
          <SectionTitle>{t('critters.whoWasIt')}</SectionTitle>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {mystery.options.map((option) => (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                accessibilityLabel={tl(option.label)}
                onPress={() => void repo.answerMystery(mystery.id, option.id, shown)}
                style={({ pressed }) => ({
                  flexBasis: '45%',
                  flexGrow: 1,
                  minHeight: 112,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  padding: space.md,
                  borderRadius: round(radius.lg),
                  borderWidth: 2,
                  borderColor: c.primary,
                  backgroundColor: pressed ? c.primarySoft : c.background,
                })}>
                <Emoji size={40}>{option.emoji}</Emoji>
                <Txt variant="lead" style={{ textAlign: 'center' }}>
                  {tl(option.label)}
                </Txt>
              </Pressable>
            ))}
          </View>
          <Txt variant="small" tone="secondary">
            {t('critters.guessNote')}
          </Txt>
        </>
      )}
    </Screen>
  );
}
