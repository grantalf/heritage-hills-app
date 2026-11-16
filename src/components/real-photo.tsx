import { Image as ImageIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Image, View } from 'react-native';

import { Btn, Card, LinkBtn, Txt, useUI } from '@/components/ui';
import { useT } from '@/lib/i18n';
import { loadRealPhoto, type RealPhoto } from '@/lib/real-photo';
import { radius } from '@/lib/theme';

type Status = 'idle' | 'loading' | 'none' | 'error';

/** A real photo of the species, loaded only when the person asks. Always shown with its credit. */
export function RealPhotoCard({ name, scientificName, moreUrl }: { name: string; scientificName?: string; moreUrl?: string }) {
  const { t } = useT();
  const { round, c } = useUI();
  const [status, setStatus] = useState<Status>('idle');
  const [photo, setPhoto] = useState<RealPhoto | undefined>();

  const load = async () => {
    if (!scientificName) return;
    setStatus('loading');
    try {
      const found = await loadRealPhoto(scientificName);
      if (found) setPhoto(found);
      setStatus(found ? 'idle' : 'none');
    } catch {
      setStatus('error');
    }
  };

  return (
    <Card>
      <Txt variant="label">{t('critters.realPhotosTitle')}</Txt>
      {photo ? (
        <View style={{ gap: 6 }}>
          <Image
            source={{ uri: photo.url }}
            accessibilityLabel={t('critters.realPhotoAlt', { name })}
            resizeMode="cover"
            style={{ width: '100%', aspectRatio: photo.ratio, borderRadius: round(radius.md), backgroundColor: c.surfaceStrong }}
          />
          <Txt variant="small" tone="secondary">
            {t('critters.photoCredit', { credit: photo.credit, license: photo.license })}
          </Txt>
        </View>
      ) : (
        <>
          <Txt variant="small" tone="secondary">
            {t('critters.realPhotosBody')}
          </Txt>
          {scientificName && status !== 'none' && status !== 'error' ? (
            <>
              <Btn kind="secondary" icon={ImageIcon} label={status === 'loading' ? t('critters.photoLoading') : t('critters.photoLoad')} disabled={status === 'loading'} onPress={load} />
              <Txt variant="small" tone="secondary">
                {t('critters.photoLoadNote')}
              </Txt>
            </>
          ) : null}
          {status === 'none' ? <Txt>{t('critters.photoNone')}</Txt> : null}
          {status === 'error' ? <Txt>{t('critters.photoError')}</Txt> : null}
        </>
      )}
      {moreUrl ? <LinkBtn label={t('critters.realPhotosButton')} url={moreUrl} /> : null}
    </Card>
  );
}
