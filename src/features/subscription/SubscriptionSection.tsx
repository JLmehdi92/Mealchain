import { router } from 'expo-router';
import Purchases from 'react-native-purchases';

import { Chevron } from '@/features/household/Chevron';
import { SectionLabel } from '@/features/household/controls';
import { SETTINGS_COPY } from '@/features/household/settingsCopy';
import { fill, language, pick } from '@/lib/i18n';
import { report } from '@/lib/monitoring';
import { Group } from '@/ui/Card';
import { Row } from '@/ui/Row';

import { restoreWithFeedback } from './actions';
import { proEntitlement } from './purchase';
import { useCustomerInfo } from './useCustomerInfo';

export function SubscriptionSection() {
  const copy = pick(SETTINGS_COPY);
  const pro = proEntitlement(useCustomerInfo());
  const date = pro?.expirationDate ? new Date(pro.expirationDate).toLocaleDateString(language(), { dateStyle: 'medium' }) : null;
  const detail = !pro ? copy.free : date ? fill(pro.willRenew ? copy.renews : copy.ends, { date }) : undefined;
  return (
    <>
      <SectionLabel>{copy.subscription}</SectionLabel>
      <Group>
        <Row
          label="Demidemi Pro"
          detail={detail}
          trailing={<Chevron />}
          onPress={() => (pro ? Purchases.showManageSubscriptions().catch(report) : router.push('/paywall'))}
        />
        <Row label={copy.restore} onPress={restoreWithFeedback} />
      </Group>
    </>
  );
}
