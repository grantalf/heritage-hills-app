import { PartyPopper } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Emoji } from '@/components/game';
import { Notice, Screen, Txt, useUI } from '@/components/ui';
import { useLoad } from '@/lib/data/provider';
import { bingoLines, cardForMonth } from '@/lib/game';
import { useT } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { radius, space } from '@/lib/theme';

export default function BingoScreen() {
  const { t, tl } = useT();
  const { c, round } = useUI();
  const { repo } = useSession();
  const cards = useLoad((r) => r.listBingoCards());
  if (!cards) return <Screen title={t('critters.bingo')}>{null}</Screen>;

  const card = cardForMonth(cards, new Date().getMonth() + 1);
  const marked = repo.getGame().bingo[card.id] ?? [];
  const lines = bingoLines(card, marked);

  return (
    <Screen title={tl(card.title)} subtitle={t('critters.bingoSubtitle')}>
      {lines > 0 ? <Notice tone="good" icon={PartyPopper} title={t('critters.bingoLine', { count: lines })} body={t('critters.bingoKeepGoing')} /> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {card.squares.map((square, i) => {
          const on = marked.includes(square.id);
          return (
            <Pressable
              key={square.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              aria-checked={on}
              // Row and column, so a screen reader user can aim for three in a row (block 5 review, A-13).
              accessibilityLabel={t('critters.bingoSquare', { row: Math.floor(i / 3) + 1, col: (i % 3) + 1, text: tl(square.text) })}
              onPress={() => void repo.toggleBingo(card.id, square.id)}
              style={({ pressed }) => ({
                flexBasis: '30%',
                flexGrow: 1,
                minHeight: 132,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                padding: space.sm,
                borderRadius: round(radius.lg),
                borderWidth: 2,
                borderColor: on ? c.primary : c.border,
                backgroundColor: pressed ? c.surfaceStrong : on ? c.primarySoft : c.background,
              })}>
              <Emoji size={34}>{on ? '✅' : square.emoji}</Emoji>
              <Txt variant="small" style={{ textAlign: 'center' }}>
                {tl(square.text)}
              </Txt>
            </Pressable>
          );
        })}
      </View>
      <Txt tone="secondary">{t('critters.bingoCount', { count: marked.length })}</Txt>
      <Txt variant="small" tone="secondary">
        {t('critters.bingoRule')}
      </Txt>
    </Screen>
  );
}
