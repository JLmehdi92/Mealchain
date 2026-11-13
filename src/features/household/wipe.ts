import { ne } from 'drizzle-orm';

import { resetAnalytics } from '@/lib/analytics';
import { db } from '@/lib/db/client';
import { household, plans, recipes, settings, shoppingChecks } from '@/lib/db/schema';
import { report } from '@/lib/monitoring';
import { cancelReminders } from '@/lib/notifications';
import { setState } from '@/lib/store';

import { defaultHousehold, setDraft } from './draft';

export function wipeAll() {
  db.transaction((tx) => {
    for (const table of [household, recipes, plans, shoppingChecks]) tx.delete(table).run();
    tx.delete(settings).where(ne(settings.key, 'installed')).run();
  });
  cancelReminders().catch(report);
  resetAnalytics();
  setDraft(defaultHousehold());
  setState({ household: null, recipes: [], plan: null });
}
