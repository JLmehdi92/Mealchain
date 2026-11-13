import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { t, type StringKey } from '@/lib/i18n';
import { Banner } from '@/ui/Banner';
import { Button } from '@/ui/Button';
import { Icon, type IconName } from '@/ui/Icon';
import { Screen } from '@/ui/Screen';
import { H2, Secondary } from '@/ui/Text';
import { space, useTheme } from '@/ui/theme';

const STEPS: [IconName, StringKey, StringKey][] = [
  ['book', 'onboarding.how.recipes.title', 'onboarding.how.recipes.body'],
  ['person.2', 'onboarding.how.people.title', 'onboarding.how.people.body'],
  ['checklist', 'onboarding.how.list.title', 'onboarding.how.list.body'],
];

export default function How() {
  const c = useTheme();
  return (
    <Screen title={t('onboarding.how.title')} footer={<Button testID="how-continue" label={t('common.continue')} onPress={() => router.push('/household')} />}>
      {STEPS.map(([icon, title, body]) => (
        <View key={title} style={styles.step}>
          <View style={[styles.icon, { backgroundColor: c.surface }]}>
            <Icon name={icon} />
          </View>
          <View style={styles.grow}>
            <H2>{t(title)}</H2>
            <Secondary muted>{t(body)}</Secondary>
          </View>
        </View>
      ))}
      <Banner icon="info.circle">{t('onboarding.how.free')}</Banner>
    </Screen>
  );
}

const styles = StyleSheet.create({
  step: { flexDirection: 'row', gap: space.lg, marginVertical: space.sm },
  icon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  grow: { flex: 1, gap: 6 },
});
