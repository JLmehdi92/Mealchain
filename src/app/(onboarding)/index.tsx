import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { accountAvailable, signInWithApple } from '@/features/household/account';
import { signInFailed } from '@/features/household/signInError';
import { WelcomeScene } from '@/features/household/WelcomeScene';
import { pick, t } from '@/lib/i18n';
import { getState } from '@/lib/store';
import { Button } from '@/ui/Button';
import { enterDown } from '@/ui/motion';
import { Body, Title } from '@/ui/Text';
import { space, useTheme } from '@/ui/theme';

const ERROR = { en: "Couldn't sign in. Try again in a moment.", fr: 'Connexion impossible. Réessayez dans un instant.' };

export default function Welcome() {
  const c = useTheme();
  const reduced = useReducedMotion();
  const [busy, setBusy] = useState(false);
  const signIn = async () => {
    setBusy(true);
    try {
      await signInWithApple();
      if (!getState().household) router.push('/how');
    } catch (error) {
      signInFailed(error, pick(ERROR));
    } finally {
      setBusy(false);
    }
  };
  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: c.paper }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <WelcomeScene />
        <Animated.View entering={enterDown(reduced, 600)} style={styles.title}>
          <Title>{t('onboarding.welcome.title')}</Title>
        </Animated.View>
        <Animated.View entering={enterDown(reduced, 660)}>
          <Body muted>{t('onboarding.welcome.body')}</Body>
        </Animated.View>
      </ScrollView>
      <View style={styles.footer}>
        <Button testID="welcome-start" label={t('onboarding.welcome.cta')} onPress={() => router.push('/how')} />
        {accountAvailable ? <Button testID="welcome-sign-in" kind="quiet" label={t('onboarding.welcome.signIn')} disabled={busy} onPress={signIn} /> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, gap: space.md },
  title: { marginTop: space.xxl },
  footer: { paddingHorizontal: space.xl, paddingTop: space.lg, gap: space.sm },
});
