import { router, useLocalSearchParams } from 'expo-router';
import { Check, Clock, Flag, HandHeart, Lock, LogIn, ShieldAlert, Trash2, Wrench } from 'lucide-react-native';
import { View } from 'react-native';

import { Btn, Card, EmptyState, Notice, SampleTag, Screen, Tag, Txt } from '@/components/ui';
import { useLoad } from '@/lib/data/provider';
import { useT } from '@/lib/i18n';
import { useSession } from '@/lib/session';

export default function ShareItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, tl } = useT();
  const { repo, needNeighbor, isNeighbor } = useSession();
  const result = useLoad(async (r) => ({ item: await r.getShareItem(id) }), id);
  const item = result?.item;

  if (!item) {
    // After a report hides the item, the reporter still sees the thank-you instead of "not found".
    const body = !isNeighbor ? (
      <>
        <EmptyState icon={Lock} title={t('share.neighborsOnly')} body={t('share.neighborsOnlyHint')} />
        <Btn icon={LogIn} label={t('signIn.start')} onPress={() => router.push('/sign-in')} />
      </>
    ) : repo.hasReported(id) ? (
      <Notice announce tone="good" icon={Check} title={t('share.reportedTitle')} body={t('share.reportedBody')} />
    ) : (
      <EmptyState icon={Wrench} title={t('share.notFound')} />
    );
    return <Screen title={t('share.title')}>{result ? body : null}</Screen>;
  }
  const request = repo.getShareRequest(item.id);
  const reported = repo.hasReported(item.id);

  return (
    <Screen title={tl(item.title)} subtitle={t(`share.category.${item.category}`)}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        <Tag tone={item.status === 'available' ? 'good' : 'neutral'} label={t(`share.status.${item.status}`)} />
        {item.mine ? <Tag tone="notice" label={t('share.yours')} /> : null}
        {item.sample ? <SampleTag /> : null}
      </View>

      <Card>
        <Txt variant="label">{t('share.condition')}</Txt>
        <Txt>{tl(item.condition)}</Txt>
        <Txt variant="label">{t('share.owner')}</Txt>
        <Txt>{item.mine ? t('share.ownerYou') : t('share.ownerNeighbor')}</Txt>
      </Card>

      {item.category === 'tool' ? <Notice tone="notice" icon={ShieldAlert} title={t('share.toolSafetyTitle')} body={t('share.toolSafetyBody')} /> : null}

      {reported ? (
        <Notice announce tone="good" icon={Check} title={t('share.reportedTitle')} body={t('share.reportedBody')} />
      ) : item.mine ? (
        <Btn
          kind="danger"
          icon={Trash2}
          label={t('share.remove')}
          onPress={() => {
            void repo.removeShareItem(item.id);
            router.back();
          }}
        />
      ) : (
        <>
          {request === 'none' && item.status === 'available' ? (
            <Btn icon={HandHeart} label={t('share.ask')} onPress={() => needNeighbor(() => void repo.requestShareItem(item.id))} />
          ) : null}
          {request === 'none' && item.status === 'lent' ? <Notice tone="notice" icon={Clock} title={t('share.lentTitle')} body={t('share.lentBody')} /> : null}
          {request === 'sent' ? (
            <Notice announce tone="notice" icon={Clock} title={t('share.sentTitle')} body={t('share.sentBody')}>
              <Btn kind="quiet" label={t('share.cancel')} onPress={() => void repo.cancelShareRequest(item.id)} />
            </Notice>
          ) : null}
          {request === 'accepted' ? (
            <Notice announce tone="good" icon={Check} title={t('share.acceptedTitle')} body={t('share.acceptedBody')}>
              <Btn kind="quiet" label={t('share.cancel')} onPress={() => void repo.cancelShareRequest(item.id)} />
            </Notice>
          ) : null}
          <Txt variant="small" tone="secondary">
            {t('share.contactPrivacy')}
          </Txt>
          <Btn kind="quiet" icon={Flag} label={t('share.report')} onPress={() => needNeighbor(() => void repo.reportItem(item.id))} />
        </>
      )}
    </Screen>
  );
}
