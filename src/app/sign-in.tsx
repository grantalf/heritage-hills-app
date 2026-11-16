import { router } from 'expo-router';
import { ArrowRight, BadgeCheck, Info, Users } from 'lucide-react-native';
import { useState } from 'react';

import { Btn, CheckRow, Field, Notice, Screen, Txt } from '@/components/ui';
import { useT } from '@/lib/i18n';
import { useSession } from '@/lib/session';

type Step = 'email' | 'code' | 'household' | 'done';

/** Practice version of sign-in and household verification. Nothing is sent or stored. */
export default function SignInScreen() {
  const { t } = useT();
  const { repo } = useSession();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [adult, setAdult] = useState(false);
  const [code, setCode] = useState('');
  const [household, setHousehold] = useState('');

  const emailOk = /^\S+@\S+\.\S+$/.test(email.trim()) && adult;
  const codeOk = /^\d{6}$/.test(code.trim());
  const stepNumber = { email: 1, code: 2, household: 3, done: 3 }[step];

  return (
    <Screen title={t('signIn.title')} subtitle={step === 'done' ? undefined : t('signIn.step', { n: stepNumber, total: 3 })}>
      <Notice tone="notice" icon={Info} title={t('signIn.practiceTitle')} body={t('signIn.practiceBody')} />

      {step === 'email' ? (
        <>
          <Txt>{t('signIn.emailIntro')}</Txt>
          <Field
            label={t('signIn.emailLabel')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="name@example.org"
          />
          <CheckRow label={t('signIn.adult')} checked={adult} onChange={setAdult} />
          <Btn icon={ArrowRight} label={t('signIn.sendCode')} disabled={!emailOk} onPress={() => setStep('code')} />
        </>
      ) : null}

      {step === 'code' ? (
        <>
          <Txt>{t('signIn.codeIntro')}</Txt>
          <Field label={t('signIn.codeLabel')} hint={t('signIn.codeHint')} value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={6} />
          <Btn icon={ArrowRight} label={t('common.continue')} disabled={!codeOk} onPress={() => setStep('household')} />
        </>
      ) : null}

      {step === 'household' ? (
        <>
          <Txt>{t('signIn.householdIntro')}</Txt>
          <Field label={t('signIn.householdLabel')} hint={t('signIn.householdHint')} value={household} onChangeText={setHousehold} autoCapitalize="characters" maxLength={12} />
          <Btn
            icon={BadgeCheck}
            label={t('signIn.verify')}
            disabled={household.trim().length < 4}
            onPress={() => {
              void repo.setRole('neighbor');
              setStep('done');
            }}
          />
          <Notice tone="primary" icon={Users} title={t('signIn.vouchTitle')} body={t('signIn.vouchBody')} />
          <Txt variant="small" tone="secondary">
            {t('signIn.householdPrivacy')}
          </Txt>
        </>
      ) : null}

      {step === 'done' ? (
        <>
          <Notice tone="good" icon={BadgeCheck} title={t('signIn.doneTitle')} body={t('signIn.doneBody')} />
          <Btn label={t('common.continue')} icon={ArrowRight} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
          <Btn kind="secondary" label={t('privacy.title')} onPress={() => router.replace('/privacy')} />
        </>
      ) : null}
    </Screen>
  );
}
