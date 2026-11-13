import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { accountAvailable, appleCancelled, signInWithApple } from '@/features/household/account';
import { WelcomeScene } from '@/features/household/WelcomeScene';
import { pick, t } from '@/lib/i18n';
import { report } from '@/lib/monitoring';
import { getState } from '@/lib/store';
import { Button } from '@/ui/Button';
import { Body, Title } from '@/ui/Text';
import { space, useTheme } from '@/ui/theme';

const ERROR = { en: "Couldn't sign in. Try again in a moment.", fr: 'Connexion impossible. Réessayez dans un instant.' };

export default function Welcome() {
  const c = useTheme();
  const [busy, setBusy] = useState(false);
  const signIn = async () => {
    setBusy(true);
    try {
      await signInWithApple();
      if (!getState().household) router.push('/how');
    } catch (error) {
      if (!appleCancelled(error)) {
        report(error);
        Alert.alert(pick(ERROR));
      }
    } finally {
      setBusy(false);
    }
  };
  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: c.paper }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <WelcomeScene />
        <Title style={styles.title}>{t('onboarding.welcome.title')}</Title>
        <Body muted>{t('onboarding.welcome.body')}</Body>
      </ScrollView>
      <View style={styles.footer}>
        <Button label={t('onboarding.welcome.cta')} onPress={() => router.push('/how')} />
        {accountAvailable ? <Button kind="quiet" label={t('onboarding.welcome.signIn')} disabled={busy} onPress={signIn} /> : null}
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
