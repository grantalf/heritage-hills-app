/**
 * On-screen game controls. One touch surface handles every finger, because a
 * player holds a direction with one thumb and bonks with the other. Separate
 * buttons would only notice one finger at a time.
 *
 * Left half: touch and slide to move. Right half: touch to bonk.
 */
import { Move, Star } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { View, type GestureResponderEvent, type ViewStyle } from 'react-native';

import { Txt, useUI } from '@/components/ui';
import { useT } from '@/lib/i18n';

const HEIGHT = 190;
/** Stops the browser from selecting text or scrolling while a thumb is on the controls. */
const NO_SELECT = { userSelect: 'none', touchAction: 'none' } as ViewStyle;
const DEAD = 12;
/** How long one screen-reader or switch action holds a direction or the bonk button. */
const PULSE_MS = 280;
type PadAction = 'forward' | 'back' | 'up' | 'down' | 'bonk';
const PULSES: Record<PadAction, [number, number, boolean]> = { forward: [1, 0, false], back: [-1, 0, false], up: [0, -1, false], down: [0, 1, false], bonk: [0, 0, true] };

export function Pad({ onInput, moveLabel, bonkLabel, label, disabled }: { onInput: (x: number, z: number, bonk: boolean) => void; moveLabel: string; bonkLabel: string; label: string; disabled?: boolean }) {
  const { c } = useUI();
  const { t } = useT();
  const pulse = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(pulse.current), []);
  // Screen readers and switch controls cannot slide a thumb, so the surface also offers named actions:
  // each one holds a direction or the bonk button for a moment (WCAG 2.1.1, 2.5.1; block 5 review).
  const act = (name: string) => {
    const p = PULSES[name as PadAction];
    if (!p || disabled) return;
    clearTimeout(pulse.current);
    onInput(p[0], p[1], p[2]);
    pulse.current = setTimeout(() => onInput(0, 0, false), PULSE_MS);
  };
  const box = useRef({ x: 0, y: 0, w: 320, h: HEIGHT });
  const [show, setShow] = useState({ dx: 0, dy: 0, bonk: false });

  // The first touch tells us where the surface sits on the screen. Children ignore touches, so the touch target is the surface itself.
  const place = (e: GestureResponderEvent) => {
    box.current.x = e.nativeEvent.pageX - e.nativeEvent.locationX;
    box.current.y = e.nativeEvent.pageY - e.nativeEvent.locationY;
  };

  const read = (e: GestureResponderEvent) => {
    const { x, y, w, h } = box.current;
    const touches = e.nativeEvent.touches ?? [];
    let mx = 0;
    let mz = 0;
    let bonk = false;
    for (const touch of touches) {
      const lx = touch.pageX - x;
      const ly = touch.pageY - y;
      if (lx < 0 || lx > w || ly < -40 || ly > h + 40) continue;
      if (lx < w / 2) {
        const dx = lx - w * 0.25;
        const dy = ly - h / 2;
        mx = Math.abs(dx) > DEAD ? Math.sign(dx) : 0;
        mz = Math.abs(dy) > DEAD ? Math.sign(dy) : 0;
      } else bonk = true;
    }
    onInput(mx, mz, bonk);
    setShow((s) => (s.dx === mx && s.dy === mz && s.bonk === bonk ? s : { dx: mx, dy: mz, bonk }));
  };
  const clear = () => {
    onInput(0, 0, false);
    setShow({ dx: 0, dy: 0, bonk: false });
  };

  return (
    <View
      onLayout={(e) => {
        box.current.w = e.nativeEvent.layout.width;
        box.current.h = e.nativeEvent.layout.height;
      }}
      accessible
      accessibilityLabel={label}
      accessibilityHint={t('street.padHint')}
      accessibilityState={{ disabled: !!disabled }}
      accessibilityActions={(Object.keys(PULSES) as PadAction[]).map((name) => ({ name, label: t(`street.pad.${name}`) }))}
      onAccessibilityAction={(e) => act(e.nativeEvent.actionName)}
      onStartShouldSetResponder={() => !disabled}
      onMoveShouldSetResponder={() => !disabled}
      onResponderTerminationRequest={() => false}
      onResponderGrant={(e) => {
        place(e);
        read(e);
      }}
      onResponderStart={read}
      onResponderMove={read}
      onResponderEnd={read}
      onResponderRelease={clear}
      onResponderTerminate={clear}
      style={[{ height: HEIGHT, flexDirection: 'row', direction: 'ltr', opacity: disabled ? 0.4 : 1 }, NO_SELECT]}>
      <View pointerEvents="none" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <View style={{ width: 132, height: 132, borderRadius: 66, borderWidth: 2, borderColor: c.border, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
          <Txt variant="label" tone="secondary" style={{ position: 'absolute', top: 6 }}>▲</Txt>
          <Txt variant="label" tone="secondary" style={{ position: 'absolute', bottom: 6 }}>▼</Txt>
          <Txt variant="label" tone="secondary" style={{ position: 'absolute', left: 10 }}>◀</Txt>
          <Txt variant="label" tone="secondary" style={{ position: 'absolute', right: 10 }}>▶</Txt>
          <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center', transform: [{ translateX: show.dx * 26 }, { translateY: show.dy * 26 }] }}>
            <Move color={c.onPrimary} size={28} />
          </View>
        </View>
        <Txt variant="label" maxFontSizeMultiplier={1.6} style={{ textAlign: 'center' }}>
          {moveLabel}
        </Txt>
      </View>
      <View pointerEvents="none" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <View style={{ width: 112, height: 112, borderRadius: 56, borderWidth: 3, borderColor: c.primary, backgroundColor: show.bonk ? c.primary : c.primarySoft, alignItems: 'center', justifyContent: 'center', transform: [{ scale: show.bonk ? 0.94 : 1 }] }}>
          <Star color={show.bonk ? c.onPrimary : c.primary} size={44} />
        </View>
        <Txt variant="label" maxFontSizeMultiplier={1.6} style={{ textAlign: 'center' }}>
          {bonkLabel}
        </Txt>
      </View>
    </View>
  );
}
