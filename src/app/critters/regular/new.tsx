/**
 * Suggest a wild regular (block 4, D-064). Only wild field guide animals that
 * cannot hurt people, only at shared public places. A moderator approves.
 * Cats and dogs on their own are never added (D-048).
 */
import { router } from 'expo-router';
import { Check, Heart, Send, ShieldAlert } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { CritterPic } from '@/components/game';
import { StatStepper } from '@/components/pet-card';
import { Parchment } from '@/components/arcade/menu';
import { Btn, Choices, EmptyState, Field, Notice, Screen, SectionTitle, Txt, useUI } from '@/components/ui';
import { useLoad } from '@/lib/data/provider';
import { useT } from '@/lib/i18n';
import { CLASS_IDS, LIMITS, PUBLIC_ZONES, STAT_IDS, cleanStats, type ClassId, type PublicZone, type RegularProblem, type Stats } from '@/lib/petcards';
import { useSession } from '@/lib/session';
import { radius, space } from '@/lib/theme';

const TEXT_PROBLEMS = new Set(['tooShort', 'tooLong', 'link', 'email', 'phone', 'address']);

export default function SuggestRegularScreen() {
  const { t, tl } = useT();
  const { c, round } = useUI();
  const { repo, isNeighbor } = useSession();
  const critters = useLoad((r) => r.listCritters());
  const [critterId, setCritterId] = useState<string | undefined>();
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [zone, setZone] = useState<PublicZone>('creek');
  const [classId, setClassId] = useState<ClassId>('yardExplorer');
  const [stats, setStats] = useState<Stats>(cleanStats(undefined));
  const [problems, setProblems] = useState<RegularProblem[]>([]);
  const [done, setDone] = useState(false);

  if (!isNeighbor) return <Screen title={t('regular.newTitle')}><EmptyState icon={Heart} title={t('critters.missing')} /></Screen>;
  // Animals that can hurt people are left off the list, so no one goes looking for them.
  const choices = (critters ?? []).filter((x) => !x.caution);

  if (done) {
    return (
      <Screen title={t('regular.newTitle')}>
        <Notice tone="good" icon={Check} title={t('regular.sentTitle')} body={t('regular.sentBody')} />
        <Btn label={t('critters.pets')} onPress={() => router.replace('/critters/pets')} />
      </Screen>
    );
  }

  const send = () =>
    void repo.cards.suggestRegular({ critterId: critterId ?? '', name, about, zone, classId, stats }).then((found) => {
      setProblems(found);
      if (found.length === 0) setDone(true);
    });

  return (
    <Screen
      title={t('regular.newTitle')}
      subtitle={t('regular.newSubtitle')}
      footer={<Btn icon={Send} label={t('regular.send')} disabled={!critterId || name.trim().length < 2 || about.trim().length < 5} onPress={send} />}>
      <Notice tone="primary" icon={ShieldAlert} title={t('critters.rulesStrays')} body={t('regular.noStrays')} />

      <SectionTitle>{t('regular.pickAnimal')}</SectionTitle>
      <Txt variant="small" tone="secondary">
        {t('regular.pickHint')}
      </Txt>
      <View accessibilityRole="radiogroup" accessibilityLabel={t('regular.pickAnimal')} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {choices.map((x) => {
          const on = x.id === critterId;
          return (
            <Pressable
              key={x.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: on, checked: on }}
              aria-checked={on}
              accessibilityLabel={tl(x.name)}
              onPress={() => setCritterId(x.id)}
              style={({ pressed }) => ({ flexBasis: '30%', flexGrow: 1, minHeight: 110, alignItems: 'center', justifyContent: 'center', gap: 4, padding: space.sm, borderRadius: round(radius.lg), borderWidth: 3, borderColor: on ? c.primary : 'transparent', backgroundColor: pressed ? c.surfaceStrong : on ? c.primarySoft : c.surface })}>
              <CritterPic id={x.id} emoji={x.emoji} size={54} />
              <Txt variant="label" style={{ textAlign: 'center' }}>
                {tl(x.name)}
              </Txt>
            </Pressable>
          );
        })}
      </View>

      <Field label={t('regular.name')} value={name} onChangeText={setName} maxLength={LIMITS.regularName} />
      <Field label={t('regular.about')} hint={t('regular.aboutHint')} value={about} onChangeText={setAbout} maxLength={LIMITS.regularAbout} multiline style={{ minHeight: 80, textAlignVertical: 'top' }} />

      <Txt variant="label">{t('regular.place')}</Txt>
      <Txt variant="small" tone="secondary">
        {t('regular.placeHint')}
      </Txt>
      <Choices label={t('regular.place')} value={zone} onChange={setZone} options={PUBLIC_ZONES.map((z) => ({ value: z, label: t(`critters.zone.${z}`) }))} />

      <SectionTitle>{t('cards.editClass')}</SectionTitle>
      <Choices label={t('cards.editClass')} value={classId} onChange={setClassId} options={CLASS_IDS.map((x) => ({ value: x, label: t(`cards.class.${x}`) }))} />
      <SectionTitle>{t('cards.editStats')}</SectionTitle>
      <Parchment>
        <View style={{ gap: space.md }}>
          {STAT_IDS.map((s) => (
            <StatStepper key={s} id={s} value={stats[s]} onChange={(v) => setStats({ ...stats, [s]: v })} />
          ))}
        </View>
      </Parchment>

      {problems.map((p) => (
        <Txt key={p} tone="urgent">
          {TEXT_PROBLEMS.has(p) ? t(`cards.problem.${p as 'link'}`) : t(`regular.problem.${p as 'risky'}`)}
        </Txt>
      ))}
    </Screen>
  );
}
