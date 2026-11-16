/**
 * Small set of building blocks used by every screen.
 * Rules they enforce (docs/SPEC.md section 4):
 *  - touch targets at least 48 x 48
 *  - icon plus words on every action
 *  - text follows the phone's size setting and the in-app size setting
 *  - start/end layout so right-to-left languages can be added
 */
import { router, type Href } from 'expo-router';
import { ChevronLeft, ChevronRight, Circle, CircleCheck, ExternalLink, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import {
  I18nManager,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useT } from '@/lib/i18n';
import { usePrefs } from '@/lib/prefs';
import { dark, fontSize, light, MAX_CONTENT_WIDTH, MIN_TOUCH, radius, space, type Palette } from '@/lib/theme';

export function useUI(): { c: Palette; fs: (size: keyof typeof fontSize) => number; scale: number } {
  const scheme = useColorScheme();
  const { textScale } = usePrefs();
  const c = scheme === 'dark' ? dark : light;
  return { c, scale: textScale, fs: (size) => Math.round(fontSize[size] * textScale) };
}

type Variant = 'display' | 'title' | 'lead' | 'body' | 'small' | 'label';
type Tone = 'text' | 'secondary' | 'primary' | 'onPrimary' | 'urgent' | 'notice' | 'good';

export function Txt({
  variant = 'body',
  tone = 'text',
  style,
  children,
  ...rest
}: TextProps & { variant?: Variant; tone?: Tone; children: ReactNode }) {
  const { c, fs } = useUI();
  const sizes: Record<Variant, TextStyle> = {
    display: { fontSize: fs('display'), lineHeight: fs('display') * 1.2, fontWeight: '700' },
    title: { fontSize: fs('title'), lineHeight: fs('title') * 1.25, fontWeight: '700' },
    lead: { fontSize: fs('lead'), lineHeight: fs('lead') * 1.35, fontWeight: '600' },
    body: { fontSize: fs('body'), lineHeight: fs('body') * 1.45 },
    small: { fontSize: fs('small'), lineHeight: fs('small') * 1.4 },
    label: { fontSize: fs('small'), lineHeight: fs('small') * 1.3, fontWeight: '700' },
  };
  const colors: Record<Tone, string> = {
    text: c.text,
    secondary: c.textSecondary,
    primary: c.primary,
    onPrimary: c.onPrimary,
    urgent: c.urgent,
    notice: c.notice,
    good: c.good,
  };
  const heading = variant === 'display' || variant === 'title';
  return (
    <Text
      accessibilityRole={heading ? 'header' : rest.accessibilityRole}
      {...rest}
      style={[{ color: colors[tone], textAlign: 'auto' }, sizes[variant], style]}>
      {children}
    </Text>
  );
}

/** Page frame: draft banner, header with a labeled back button, scrolling content. */
export function Screen({
  title,
  subtitle,
  back = true,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { c } = useUI();
  const { t } = useT();
  const insets = useSafeAreaInsets();
  const canGoBack = back && router.canGoBack();
  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ backgroundColor: c.sample, paddingTop: insets.top }}>
        <Text
          accessibilityRole="text"
          style={{ color: c.onSample, textAlign: 'center', fontSize: 13, fontWeight: '700', paddingVertical: 5, paddingHorizontal: space.lg }}>
          {t('draft.banner')}
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={{
          padding: space.lg,
          paddingBottom: space.xxl + (footer ? 0 : insets.bottom),
          gap: space.lg,
          width: '100%',
          maxWidth: MAX_CONTENT_WIDTH,
          alignSelf: 'center',
        }}>
        {back && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            onPress={() => (canGoBack ? router.back() : router.replace('/'))}
            style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.6 : 1 }]}>
            {I18nManager.isRTL ? <ChevronRight color={c.primary} size={24} /> : <ChevronLeft color={c.primary} size={24} />}
            <Txt tone="primary" variant="lead">
              {t('common.back')}
            </Txt>
          </Pressable>
        )}
        <View style={{ gap: space.xs }}>
          <Txt variant="display">{title}</Txt>
          {subtitle ? <Txt tone="secondary">{subtitle}</Txt> : null}
        </View>
        {children}
      </ScrollView>
      {footer ? (
        <View
          style={{
            padding: space.lg,
            paddingBottom: space.lg + insets.bottom,
            borderTopWidth: 1,
            borderTopColor: c.surfaceStrong,
            backgroundColor: c.background,
          }}>
          <View style={{ width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' }}>{footer}</View>
        </View>
      ) : null}
    </View>
  );
}

export function Card({ children, style, tone }: { children: ReactNode; style?: StyleProp<ViewStyle>; tone?: 'plain' | 'soft' }) {
  const { c } = useUI();
  return (
    <View style={[{ backgroundColor: tone === 'soft' ? c.primarySoft : c.surface, borderRadius: radius.lg, padding: space.lg, gap: space.sm }, style]}>
      {children}
    </View>
  );
}

export function SectionTitle({ children, action }: { children: string; action?: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.sm, gap: space.md }}>
      <Txt variant="title" style={{ flexShrink: 1 }}>
        {children}
      </Txt>
      {action}
    </View>
  );
}

export function IconBubble({ icon: Icon, tone = 'primary', size = 44 }: { icon: LucideIcon; tone?: 'primary' | 'urgent' | 'notice' | 'good' | 'neutral'; size?: number }) {
  const { c } = useUI();
  const bg = { primary: c.primarySoft, urgent: c.urgentSoft, notice: c.noticeSoft, good: c.goodSoft, neutral: c.surfaceStrong }[tone];
  const fg = { primary: c.primary, urgent: c.urgent, notice: c.notice, good: c.good, neutral: c.text }[tone];
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Icon color={fg} size={Math.round(size * 0.52)} />
    </View>
  );
}

/** A tappable row that goes somewhere. */
export function RowLink({
  icon,
  title,
  subtitle,
  href,
  onPress,
  right,
  tone,
}: {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  href?: Href;
  onPress?: () => void;
  right?: ReactNode;
  tone?: 'primary' | 'urgent' | 'notice' | 'good' | 'neutral';
}) {
  const { c } = useUI();
  const Chevron = I18nManager.isRTL ? ChevronLeft : ChevronRight;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      onPress={onPress ?? (() => href && router.push(href))}
      style={({ pressed }) => [styles.row, { backgroundColor: pressed ? c.surfaceStrong : c.surface }]}>
      {icon ? <IconBubble icon={icon} tone={tone} /> : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Txt variant="lead">{title}</Txt>
        {subtitle ? (
          <Txt variant="small" tone="secondary">
            {subtitle}
          </Txt>
        ) : null}
      </View>
      {right ?? <Chevron color={c.textSecondary} size={22} />}
    </Pressable>
  );
}

/** Same look as RowLink, but it is information only and cannot be pressed. */
export function InfoRow({ icon, title, subtitle, right }: { icon?: LucideIcon; title: string; subtitle?: string; right?: ReactNode }) {
  const { c } = useUI();
  return (
    <View accessible accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title} style={[styles.row, { backgroundColor: c.surface }]}>
      {icon ? <IconBubble icon={icon} tone="neutral" /> : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Txt variant="lead">{title}</Txt>
        {subtitle ? (
          <Txt variant="small" tone="secondary">
            {subtitle}
          </Txt>
        ) : null}
      </View>
      {right}
    </View>
  );
}

type BtnKind = 'primary' | 'secondary' | 'quiet' | 'danger';
export function Btn({
  label,
  onPress,
  icon: Icon,
  kind = 'primary',
  disabled,
  hint,
}: {
  label: string;
  onPress: () => void;
  icon?: LucideIcon;
  kind?: BtnKind;
  disabled?: boolean;
  hint?: string;
}) {
  const { c } = useUI();
  const bg = { primary: c.primary, secondary: 'transparent', quiet: 'transparent', danger: 'transparent' }[kind];
  const fg = { primary: c.onPrimary, secondary: c.primary, quiet: c.primary, danger: c.urgent }[kind];
  const border = { primary: c.primary, secondary: c.primary, quiet: 'transparent', danger: c.urgent }[kind];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, borderColor: border, opacity: disabled ? 0.45 : pressed ? 0.75 : 1 },
      ]}>
      {Icon ? <Icon color={fg} size={22} /> : null}
      <Txt variant="lead" style={{ color: fg, textAlign: 'center', flexShrink: 1 }}>
        {label}
      </Txt>
    </Pressable>
  );
}

export function LinkBtn({ label, url }: { label: string; url: string }) {
  return <Btn kind="secondary" icon={ExternalLink} label={label} onPress={() => void Linking.openURL(url).catch(() => undefined)} />;
}

type TagTone = 'sample' | 'draft' | 'neutral' | 'good' | 'notice' | 'urgent';
export function Tag({ label, tone = 'neutral' }: { label: string; tone?: TagTone }) {
  const { c, fs } = useUI();
  const bg = { sample: c.sample, draft: c.noticeSoft, neutral: c.surfaceStrong, good: c.goodSoft, notice: c.noticeSoft, urgent: c.urgentSoft }[tone];
  const fg = { sample: c.onSample, draft: c.notice, neutral: c.text, good: c.good, notice: c.notice, urgent: c.urgent }[tone];
  return (
    <View style={{ backgroundColor: bg, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' }}>
      <Text style={{ color: fg, fontSize: fs('small') - 2, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

export function SampleTag() {
  const { t } = useT();
  return <Tag tone="sample" label={t('common.sample')} />;
}

export function Notice({
  icon,
  title,
  body,
  tone = 'notice',
  children,
}: {
  icon: LucideIcon;
  title: string;
  body?: string;
  tone?: 'urgent' | 'notice' | 'good' | 'primary';
  children?: ReactNode;
}) {
  const { c } = useUI();
  const bg = { urgent: c.urgentSoft, notice: c.noticeSoft, good: c.goodSoft, primary: c.primarySoft }[tone];
  const fg = { urgent: c.urgent, notice: c.notice, good: c.good, primary: c.primary }[tone];
  const Icon = icon;
  return (
    <View style={{ backgroundColor: bg, borderRadius: radius.lg, padding: space.lg, gap: space.sm, borderStartWidth: 5, borderStartColor: fg }}>
      <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' }}>
        <Icon color={fg} size={24} />
        <Txt variant="lead" style={{ flex: 1 }}>
          {title}
        </Txt>
      </View>
      {body ? <Txt>{body}</Txt> : null}
      {children}
    </View>
  );
}

/** A labeled checkbox row. */
export function CheckRow({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (next: boolean) => void }) {
  const { c } = useUI();
  const Icon = checked ? CircleCheck : Circle;
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      accessibilityHint={hint}
      onPress={() => onChange(!checked)}
      style={({ pressed }) => [styles.row, { backgroundColor: pressed ? c.surfaceStrong : c.surface }]}>
      <Icon color={checked ? c.primary : c.textSecondary} size={28} />
      <View style={{ flex: 1, gap: 2 }}>
        <Txt variant="lead">{label}</Txt>
        {hint ? (
          <Txt variant="small" tone="secondary">
            {hint}
          </Txt>
        ) : null}
      </View>
    </Pressable>
  );
}

/** Pick one of a few options. */
export function Choices<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string; icon?: LucideIcon }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const { c } = useUI();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
      {options.map((option) => {
        const selected = option.value === value;
        const Icon = option.icon;
        return (
          <Pressable
            key={String(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected, checked: selected }}
            accessibilityLabel={option.label}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.choice,
              {
                backgroundColor: selected ? c.primary : pressed ? c.surfaceStrong : c.surface,
                borderColor: selected ? c.primary : c.border,
              },
            ]}>
            {Icon ? <Icon size={20} color={selected ? c.onPrimary : c.text} /> : null}
            <Txt variant="label" style={{ color: selected ? c.onPrimary : c.text }}>
              {option.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

export function EmptyState({ icon, title, body }: { icon: LucideIcon; title: string; body?: string }) {
  return (
    <Card style={{ alignItems: 'center', paddingVertical: space.xl }}>
      <IconBubble icon={icon} tone="neutral" size={56} />
      <Txt variant="lead" style={{ textAlign: 'center' }}>
        {title}
      </Txt>
      {body ? (
        <Txt tone="secondary" style={{ textAlign: 'center' }}>
          {body}
        </Txt>
      ) : null}
    </Card>
  );
}

export function Bullets({ items }: { items: string[] }) {
  const { c } = useUI();
  return (
    <View style={{ gap: space.sm }}>
      {items.map((item, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.primary, marginTop: 9 }} />
          <Txt style={{ flex: 1 }}>{item}</Txt>
        </View>
      ))}
    </View>
  );
}

/** A text box with its label always visible. */
export function Field({ label, hint, ...rest }: TextInputProps & { label: string; hint?: string }) {
  const { c, fs } = useUI();
  return (
    <View style={{ gap: 6 }}>
      <Txt variant="label">{label}</Txt>
      {hint ? (
        <Txt variant="small" tone="secondary">
          {hint}
        </Txt>
      ) : null}
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={hint}
        placeholderTextColor={c.textSecondary}
        {...rest}
        style={[
          {
            minHeight: 52,
            borderWidth: 1.5,
            borderColor: c.border,
            borderRadius: radius.md,
            paddingHorizontal: space.lg,
            paddingVertical: space.md,
            fontSize: fs('body'),
            color: c.text,
            backgroundColor: c.background,
            textAlign: 'auto',
          },
          rest.style,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    minHeight: MIN_TOUCH,
    minWidth: MIN_TOUCH,
    gap: 2,
    paddingEnd: space.md,
    marginStart: -6,
    marginBottom: -space.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 64,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.lg,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    minHeight: 52,
    paddingVertical: space.md,
    paddingHorizontal: space.xl,
    borderRadius: radius.md,
    borderWidth: 2,
  },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: MIN_TOUCH,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
});
