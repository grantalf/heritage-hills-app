import { Lock } from 'lucide-react-native';
import { View } from 'react-native';

import { CritterPic, ProgressBar } from '@/components/game';
import { Card, Notice, SampleTag, Screen, SectionTitle, Txt } from '@/components/ui';
import { useLoad } from '@/lib/data/provider';
import { tally } from '@/lib/game';
import { useT } from '@/lib/i18n';
import { space } from '@/lib/theme';

export default function TallyScreen() {
  const { t, tl } = useT();
  const data = useLoad(async (r) => ({ critters: await r.listCritters(), ...(await r.getTally()) }));
  if (!data) return <Screen title={t('critters.tally')}>{null}</Screen>;
  const result = tally(data.counts, data.critters);
  const byId = new Map(data.critters.map((c) => [c.id, c]));

  return (
    <Screen title={t('critters.tally')} subtitle={t('critters.tallySubtitle')}>
      <Card tone="soft">
        <SampleTag />
        <Txt variant="display" tone="primary">
          {String(result.total)}
        </Txt>
        <Txt>{t('critters.tallyTotal', { goal: data.goal })}</Txt>
        <ProgressBar value={result.total} max={data.goal} label={t('critters.tallyTotal', { goal: data.goal })} />
        <Txt variant="small" tone="secondary">
          {t('critters.tallyGoal')}
        </Txt>
      </Card>

      <Card>
        <Txt variant="lead">{t('critters.tallySpecies', { seen: result.speciesSeen, total: result.speciesTotal })}</Txt>
        {result.byGroup.map((g) => (
          <View key={g.group} style={{ gap: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Txt>{t(`critters.group.${g.group}`)}</Txt>
              <Txt variant="label">
                {g.seen} / {g.total}
              </Txt>
            </View>
            <ProgressBar value={g.seen} max={g.total} label={`${t(`critters.group.${g.group}`)}: ${g.seen} / ${g.total}`} />
          </View>
        ))}
      </Card>

      <SectionTitle>{t('critters.tallyTop')}</SectionTitle>
      <Card>
        {result.top.map((row) => {
          const critter = byId.get(row.critterId);
          return critter ? (
            <View key={row.critterId} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
              <CritterPic id={critter.id} emoji={critter.emoji} size={40} />
              <Txt style={{ flex: 1 }}>{tl(critter.name)}</Txt>
              <Txt variant="label">{String(row.count)}</Txt>
            </View>
          ) : null;
        })}
      </Card>

      <Notice tone="primary" icon={Lock} title={t('critters.tallyPrivacyTitle')} body={t('critters.tallyPrivacyBody')} />
      <Txt variant="small" tone="secondary">
        {t('critters.tallyScience')}
      </Txt>
    </Screen>
  );
}
