import { Download, Eye, EyeOff, LogIn, Trash2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Btn, Card, Choices, Notice, Screen, SectionTitle, Txt, useUI } from '@/components/ui';
import { useT } from '@/lib/i18n';
import { currentAudience, type Audience, type ConsentField } from '@/lib/rules';
import { useSession } from '@/lib/session';
import { space } from '@/lib/theme';

const FIELDS: ConsentField[] = ['firstName', 'block', 'contact', 'rsvpName'];
const AUDIENCES: Audience[] = ['nobody', 'coordinator', 'neighbors'];

export default function PrivacyScreen() {
  const { t } = useT();
  const { c, fs } = useUI();
  const { repo, isNeighbor } = useSession();
  const ledger = repo.getConsentLedger();
  const [exported, setExported] = useState<string | undefined>();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleted, setDeleted] = useState(false);

  return (
    <Screen title={t('privacy.title')} subtitle={t('privacy.subtitle')}>
      <Txt>{t('privacy.promise')}</Txt>

      {!isNeighbor ? (
        <>
          <Notice tone="good" icon={EyeOff} title={t('privacy.visitorTitle')} body={t('privacy.visitorBody')} />
          <Btn kind="secondary" icon={LogIn} label={t('signIn.start')} onPress={() => router.push('/sign-in')} />
        </>
      ) : (
        <>
          <SectionTitle>{t('privacy.whoSees')}</SectionTitle>
          <Txt variant="small" tone="secondary">
            {t('privacy.whoSeesNote')}
          </Txt>
          {FIELDS.map((field) => {
            const audience = currentAudience(ledger, field);
            return (
              <Card key={field}>
                <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
                  {audience === 'nobody' ? <EyeOff color={c.textSecondary} size={22} /> : <Eye color={c.primary} size={22} />}
                  <Txt variant="lead" style={{ flex: 1 }}>
                    {t(`privacy.field.${field}`)}
                  </Txt>
                </View>
                <Choices
                  label={t(`privacy.field.${field}`)}
                  value={audience}
                  onChange={(next) => void repo.setConsent(field, next)}
                  options={AUDIENCES.map((a) => ({ value: a, label: t(`privacy.audience.${a}`) }))}
                />
              </Card>
            );
          })}
          <Txt variant="small" tone="secondary">
            {t('privacy.history', { count: ledger.length })}
          </Txt>
        </>
      )}

      <SectionTitle>{t('privacy.yourData')}</SectionTitle>
      <Btn
        kind="secondary"
        icon={Download}
        label={t('privacy.download')}
        onPress={() => void repo.exportMyData().then((data) => setExported(JSON.stringify(data, null, 2)))}
      />
      {exported ? (
        <Card>
          <Txt variant="small" tone="secondary">
            {t('privacy.downloadNote')}
          </Txt>
          <Text selectable style={{ fontFamily: 'monospace', fontSize: fs('small') - 2, color: c.text }}>
            {exported}
          </Text>
        </Card>
      ) : null}

      {deleted ? <Notice tone="good" icon={Trash2} title={t('privacy.deletedTitle')} body={t('privacy.deletedBody')} /> : null}
      {!confirmDelete ? (
        <Btn kind="danger" icon={Trash2} label={t('privacy.delete')} onPress={() => setConfirmDelete(true)} />
      ) : (
        <Notice tone="urgent" icon={Trash2} title={t('privacy.deleteConfirmTitle')} body={t('privacy.deleteConfirmBody')}>
          <Btn
            kind="danger"
            icon={Trash2}
            label={t('privacy.deleteYes')}
            onPress={() => {
              void repo.deleteMyData();
              setConfirmDelete(false);
              setExported(undefined);
              setDeleted(true);
            }}
          />
          <Btn kind="quiet" label={t('common.cancel')} onPress={() => setConfirmDelete(false)} />
        </Notice>
      )}
    </Screen>
  );
}
