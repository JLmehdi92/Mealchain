import { proEntitlement, purchasesEnabled } from './purchase';
import { useCustomerInfo } from './useCustomerInfo';

export function usePro() {
  const info = useCustomerInfo();
  return { known: !purchasesEnabled || info !== null, entitlement: proEntitlement(info) };
}

export const useIsPro = (): boolean => usePro().entitlement !== null;
