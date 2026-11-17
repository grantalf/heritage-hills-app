import AsyncStorage from '@react-native-async-storage/async-storage';
import { Download, Eye, EyeOff, LogIn, Trash2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Btn, Card, Choices, Notice, Screen, SectionTitle, Txt, useUI } from '@/components/ui';
import { parseProgress, PROGRESS_KEY } from '@/lib/arcade/progress';
import { parseWorld, WORLD_KEY } from '@/lib/quest/state';
import { resetWorld } from '@/lib/quest/store';
import { shortDay } from '@/lib/dates';
import { useT } from '@/lib/i18n';
import { usePrefs } from '@/lib/prefs';
import { currentAudience, type Audience, type ConsentField } from '@/lib/rules';
import { useSession } from '@/lib/session';
import { space } from '@/lib/theme';

const FIELDS: ConsentField[] = ['firstName', 'block', 'contact', 'rsvpName'];
const AUDIENCES: Audience[] = ['nobody', 'coordinator', 'neighbors'];

export default function PrivacyScreen() {
  const { t, language } = useT();
  const prefs = usePrefs();
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
          {/* The record itself, newest first, as the line above promises (block 5 review). */}
          {[...ledger].reverse().map((row, i) => (
            <Txt key={row.at + i} variant="small">
              {t('privacy.historyRow', { date: shortDay(row.at, language), field: t(`privacy.field.${row.field}`), audience: t(`privacy.audience.${row.audience}`) })}
            </Txt>
          ))}
        </>
      )}

      <SectionTitle>{t('privacy.yourData')}</SectionTitle>
      <Btn
        kind="secondary"
        icon={Download}
        label={t('privacy.download')}
        onPress={() =>
          void Promise.all([repo.exportMyData(), AsyncStorage.getItem(PROGRESS_KEY), AsyncStorage.getItem(WORLD_KEY)])
            // Game progress kept on this phone is part of "your information" too.
            .then(([data, rescue, world]) =>
              setExported(
                JSON.stringify(
                  // Display settings kept on this phone are listed too, so nothing stored is left out (block 5 review).
                  { ...data, rescueGame: parseProgress(rescue), mapGame: parseWorld(world), settingsOnThisPhone: { language: prefs.language, textSize: prefs.textScale, look: prefs.look } },
                  null,
                  2,
                ),
              ),
            )
        }
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

      {deleted ? <Notice announce tone="good" icon={Trash2} title={t('privacy.deletedTitle')} body={t('privacy.deletedBody')} /> : null}
      {!confirmDelete ? (
        <Btn kind="danger" icon={Trash2} label={t('privacy.delete')} onPress={() => setConfirmDelete(true)} />
      ) : (
        <Notice announce tone="urgent" icon={Trash2} title={t('privacy.deleteConfirmTitle')} body={t('privacy.deleteConfirmBody')}>
          <Btn
            kind="danger"
            icon={Trash2}
            label={t('privacy.deleteYes')}
            onPress={() => {
              void repo.deleteMyData();
              // Game stamps and best scores live on this phone only; delete them too.
              AsyncStorage.removeItem(PROGRESS_KEY).catch(() => undefined);
              // The map game's places, quests and settings (block 3) too.
              resetWorld();
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
