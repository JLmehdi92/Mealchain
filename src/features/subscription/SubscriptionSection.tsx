import { router } from 'expo-router';
import Purchases from 'react-native-purchases';

import { SETTINGS_COPY } from '@/features/household/settingsCopy';
import { fill, language, pick } from '@/lib/i18n';
import { report } from '@/lib/monitoring';
import { Group } from '@/ui/Card';
import { Icon } from '@/ui/Icon';
import { Row } from '@/ui/Row';
import { SectionLabel } from '@/ui/SectionLabel';

import { restoreWithFeedback } from './actions';
import { usePro } from './useIsPro';

export function SubscriptionSection() {
  const copy = pick(SETTINGS_COPY);
  const pro = usePro().entitlement;
  const date = pro?.expirationDate ? new Date(pro.expirationDate).toLocaleDateString(language(), { dateStyle: 'medium' }) : null;
  const detail = !pro ? copy.free : date ? fill(pro.willRenew ? copy.renews : copy.ends, { date }) : undefined;
  return (
    <>
      <SectionLabel>{copy.subscription}</SectionLabel>
      <Group>
        <Row
          testID="subscription-pro"
          label="Demidemi Pro"
          detail={detail}
          trailing={<Icon name="chevron.right" size={14} muted />}
          onPress={() => (pro ? Purchases.showManageSubscriptions().catch(report) : router.push('/paywall'))}
        />
        <Row label={copy.restore} onPress={restoreWithFeedback} />
      </Group>
    </>
  );
}
