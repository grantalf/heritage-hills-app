import { Check, CircleCheck, CircleDashed, CircleDot, Info, Lock } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Btn, Bullets, Card, CheckRow, LinkBtn, Notice, Screen, SectionTitle, Tag, Txt, useUI } from '@/components/ui';
import { useLoad } from '@/lib/data/provider';
import type { GardenInterest, GardenStepState } from '@/lib/data/types';
import { useT } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { space } from '@/lib/theme';

const EMPTY: GardenInterest = { plot: false, build: false, lead: false, flowers: false, materials: false };
const STEP_ICON: Record<GardenStepState, typeof Check> = { done: CircleCheck, now: CircleDot, next: CircleDashed };

export default function GardenScreen() {
  const { t, tl } = useT();
  const { c } = useUI();
  const { repo, needNeighbor } = useSession();
  const garden = useLoad((r) => r.getGarden());
  const saved = repo.getGardenInterest();
  const [form, setForm] = useState<GardenInterest>(saved ?? EMPTY);
  const anyTicked = Object.values(form).some(Boolean);
  const set = (key: keyof GardenInterest) => (value: boolean) => setForm({ ...form, [key]: value });

  return (
    <Screen title={t('garden.title')} subtitle={t('garden.subtitle')}>
      <Notice tone="notice" icon={Info} title={t('garden.proposalTitle')} body={t('garden.proposalBody')} />

      <SectionTitle>{t('garden.planTitle')}</SectionTitle>
      <Bullets items={(garden?.facts ?? []).map((f) => tl(f.text))} />

      <SectionTitle>{t('garden.stepsTitle')}</SectionTitle>
      <View style={{ gap: space.sm }}>
        {garden?.steps.map((step, i) => {
          const Icon = STEP_ICON[step.state];
          return (
            <Card key={step.id} tone={step.state === 'now' ? 'soft' : 'plain'}>
              <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'flex-start' }}>
                <Icon color={step.state === 'next' ? c.textSecondary : c.primary} size={26} />
                <View style={{ flex: 1, gap: 4 }}>
                  <Txt variant="lead">
                    {i + 1}. {tl(step.title)}
                  </Txt>
                  <Txt variant="small" tone="secondary">
                    {tl(step.note)}
                  </Txt>
                  <Tag tone={step.state === 'next' ? 'neutral' : 'good'} label={t(`garden.state.${step.state}`)} />
                </View>
              </View>
            </Card>
          );
        })}
      </View>

      <SectionTitle>{t('garden.interestTitle')}</SectionTitle>
      {garden ? (
        <Txt tone="secondary">
          {t('garden.interestCount', { count: garden.interestCount })} ({t('common.sample').toLowerCase()})
        </Txt>
      ) : null}
      {saved ? <Notice announce tone="good" icon={Check} title={t('garden.onList')} /> : null}
      <View style={{ gap: space.sm }}>
        <CheckRow label={t('garden.want.plot')} checked={form.plot} onChange={set('plot')} />
        <CheckRow label={t('garden.want.build')} checked={form.build} onChange={set('build')} />
        <CheckRow label={t('garden.want.lead')} hint={t('garden.want.leadHint')} checked={form.lead} onChange={set('lead')} />
        <CheckRow label={t('garden.want.flowers')} checked={form.flowers} onChange={set('flowers')} />
        <CheckRow label={t('garden.want.materials')} hint={t('garden.want.materialsHint')} checked={form.materials} onChange={set('materials')} />
      </View>
      <Btn
        icon={Check}
        label={saved ? t('garden.update') : t('garden.join')}
        disabled={!anyTicked}
        onPress={() => needNeighbor(() => void repo.setGardenInterest(form))}
      />
      {saved ? (
        <Btn
          kind="quiet"
          label={t('garden.leave')}
          onPress={() => {
            setForm(EMPTY);
            void repo.setGardenInterest(undefined);
          }}
        />
      ) : null}
      <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' }}>
        <Lock color={c.textSecondary} size={18} />
        <Txt variant="small" tone="secondary" style={{ flex: 1 }}>
          {t('garden.privacy')}
        </Txt>
      </View>

      <LinkBtn label={t('garden.cityLink')} url="https://www.austintexas.gov/parks-and-recreation/apply-start-community-garden-guide" />
    </Screen>
  );
}
