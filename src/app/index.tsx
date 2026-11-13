import { Redirect } from 'expo-router';

import { useHousehold } from '@/lib/store';

export default function Index() {
  return <Redirect href={useHousehold() ? '/week' : '/welcome'} />;
}
