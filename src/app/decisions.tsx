import { BadgeCheck, ShieldCheck, TriangleAlert } from 'lucide-react-native';
import { useState } from 'react';
import { Text } from 'react-native';

import { Btn, Card, Notice, SampleTag, Screen, Tag, Txt, useUI } from '@/components/ui';
import type { VerifyResult } from '@/lib/audit';
import { useLoad, useRepo } from '@/lib/data/provider';
import { checkedDate } from '@/lib/dates';
import { useT } from '@/lib/i18n';

export default function DecisionsScreen() {
  const { t, tl, language } = useT();
  const { c, fs } = useUI();
  const repo = useRepo();
  const decisions = useLoad((r) => r.listDecisions());
  const [result, setResult] = useState<VerifyResult | undefined>();

  return (
    <Screen title={t('decisions.title')} subtitle={t('decisions.subtitle')}>
      <Txt>{t('decisions.intro')}</Txt>

      <Btn icon={ShieldCheck} label={t('decisions.check')} onPress={() => void repo.verifyDecisions().then(setResult)} />
      {result?.ok ? (
        <Notice tone="good" icon={BadgeCheck} title={t('decisions.okTitle', { count: result.count })} body={t('decisions.okBody')}>
          <Text selectable style={{ fontFamily: 'monospace', fontSize: fs('small') - 2, color: c.text }}>
            {result.head}
          </Text>
        </Notice>
      ) : null}
      {result && !result.ok ? (
        <Notice tone="urgent" icon={TriangleAlert} title={t('decisions.brokenTitle')} body={t('decisions.brokenBody', { index: result.brokenAt + 1 })} />
      ) : null}

      {[...(decisions ?? [])].reverse().map((entry) => (
        <Card key={entry.index}>
          <Txt variant="small" tone="secondary">
            {t('decisions.entry', { index: entry.index + 1 })} · {checkedDate(entry.at.slice(0, 10), language)}
          </Txt>
          <Txt variant="lead">{tl(entry.content.summary)}</Txt>
          <Tag tone="good" label={tl(entry.content.outcome)} />
          <SampleTag />
          <Txt variant="small" tone="secondary">
            {t('decisions.fingerprint')}: {entry.hash.slice(0, 12)}…
          </Txt>
        </Card>
      ))}
      <Txt variant="small" tone="secondary">
        {t('decisions.footnote')}
      </Txt>
    </Screen>
  );
}
