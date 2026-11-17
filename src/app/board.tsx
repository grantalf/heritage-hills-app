import { router } from 'expo-router';
import { BadgeCheck, Megaphone, ShieldCheck, TriangleAlert, Users } from 'lucide-react-native';
import { useState } from 'react';

import { ALERT_ICON } from '@/components/icons';
import { Btn, Card, Choices, EmptyState, Field, Notice, Screen, SectionTitle, Txt } from '@/components/ui';
import type { AlertKind } from '@/lib/data/types';
import { DEMO } from '@/lib/demo';
import { useT } from '@/lib/i18n';
import { useSession } from '@/lib/session';

const KINDS: AlertKind[] = ['notice', 'good', 'urgent'];

/** Shows the two-approver rule: one officer drafts an alert, a different officer confirms it. */
export default function BoardScreen() {
  const { t } = useT();
  const { repo, isBoard } = useSession();
  const pending = repo.getPendingAlert();
  const [kind, setKind] = useState<AlertKind>('notice');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [message, setMessage] = useState<'none' | 'samePerson' | 'sent'>('none');

  if (!isBoard) {
    return (
      <Screen title={t('board.title')}>
        <EmptyState icon={ShieldCheck} title={t('board.onlyBoard')} body={t('board.onlyBoardHint')} />
      </Screen>
    );
  }

  return (
    <Screen title={t('board.title')} subtitle={t('board.subtitle')}>
      <Notice tone="primary" icon={Users} title={t('board.twoTitle')} body={t('board.twoBody')} />

      {message === 'sent' ? (
        <Notice announce tone="good" icon={BadgeCheck} title={t('board.sentTitle')} body={t('board.sentBody')}>
          <Btn kind="secondary" label={t('alerts.title')} onPress={() => router.push('/alerts')} />
        </Notice>
      ) : null}

      {pending ? (
        <>
          <SectionTitle>{t('board.waitingTitle')}</SectionTitle>
          <Notice tone={pending.draft.kind} icon={ALERT_ICON[pending.draft.kind]} title={pending.draft.title.en} body={pending.draft.body.en} />
          {message === 'samePerson' ? <Notice announce tone="urgent" icon={TriangleAlert} title={t('board.sameTitle')} body={t('board.sameBody')} /> : null}
          <Btn
            kind="secondary"
            label={t('board.confirmSelf')}
            onPress={() => void repo.approvePendingAlert(false).then((ok) => setMessage(ok ? 'sent' : 'samePerson'))}
          />
          {/* A pretend second officer, for the draft only. The real server checks the second person (B-4). */}
          {DEMO ? (
            <Btn
              icon={BadgeCheck}
              label={t('board.confirmOther')}
              onPress={() =>
                void repo.approvePendingAlert(true).then((ok) => {
                  if (ok) {
                    setMessage('sent');
                    setTitle('');
                    setBody('');
                  }
                })
              }
            />
          ) : null}
          <Btn
            kind="quiet"
            label={t('board.cancelDraft')}
            onPress={() => {
              setMessage('none');
              void repo.cancelPendingAlert();
            }}
          />
        </>
      ) : (
        <>
          <SectionTitle>{t('board.newAlert')}</SectionTitle>
          <Choices label={t('board.kind')} value={kind} onChange={setKind} options={KINDS.map((k) => ({ value: k, label: t(`alerts.kind.${k}`), icon: ALERT_ICON[k] }))} />
          <Field label={t('board.alertTitle')} value={title} onChangeText={setTitle} maxLength={70} />
          <Field label={t('board.alertBody')} hint={t('board.alertBodyHint')} value={body} onChangeText={setBody} multiline maxLength={280} style={{ minHeight: 110, textAlignVertical: 'top' }} />
          <Btn
            icon={Megaphone}
            label={t('board.askSecond')}
            disabled={title.trim().length < 4 || body.trim().length < 10}
            onPress={() => {
              setMessage('none');
              void repo.draftAlert({ kind, title: { en: title.trim(), es: title.trim() }, body: { en: body.trim(), es: body.trim() } });
            }}
          />
          <Card>
            <Txt variant="small" tone="secondary">
              {t('board.translateNote')}
            </Txt>
          </Card>
        </>
      )}
    </Screen>
  );
}
