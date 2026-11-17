/** All paw notes the family said yes to, newest first. */
import { useLocalSearchParams } from 'expo-router';
import { Heart } from 'lucide-react-native';

import { NoteCard } from '@/components/pet-card';
import { EmptyState, Screen, Txt } from '@/components/ui';
import { shortDay } from '@/lib/dates';
import { useLoad } from '@/lib/data/provider';
import { useT } from '@/lib/i18n';
import { useSession } from '@/lib/session';

export default function AllNotesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, language } = useT();
  const { repo, isNeighbor, needNeighbor } = useSession();
  const result = useLoad(async (r) => ({ pet: await r.getPet(id) }), id);
  const pet = result?.pet;
  if (!pet) return <Screen title={t('cards.notesTitle')}>{result ? <EmptyState icon={Heart} title={t('critters.missing')} /> : null}</Screen>;
  const family = pet.mine && isNeighbor;
  const shown = repo.cards.getNotes(pet.id).shown.filter((n) => !repo.hasReported(n.id) && !repo.isHidden(n.id));
  return (
    <Screen title={t('cards.notesAllTitle', { name: pet.name })}>
      <Txt variant="small" tone="secondary">
        {t('cards.notesRule')}
      </Txt>
      {shown.length === 0 ? <Txt tone="secondary">{t('cards.notesNone')}</Txt> : null}
      {shown.map((n) => (
        <NoteCard key={n.id} note={n} date={shortDay(n.at, language)} onReport={family ? undefined : () => needNeighbor(() => void repo.reportItem(n.id))} onRemove={family ? () => void repo.cards.removeNote(n.id) : undefined} />
      ))}
    </Screen>
  );
}
