import { LegalPage } from '@/features/household/LegalPage';
import { ALLERGY_NOTICE } from '@/features/household/legalText';

export default function AllergyNotice() {
  return <LegalPage text={ALLERGY_NOTICE} />;
}
