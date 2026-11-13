import { t } from '@/lib/i18n';
import { Body } from '@/ui/Text';
import { Screen } from '@/ui/Screen';

export default function Welcome() {
  return (
    <Screen title={t('onboarding.welcome.title')}>
      <Body muted>{t('onboarding.welcome.body')}</Body>
    </Screen>
  );
}
