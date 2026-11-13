import { proEntitlement } from '../subscription/purchase';
import { useCustomerInfo } from '../subscription/useCustomerInfo';

export const useIsPro = (): boolean => proEntitlement(useCustomerInfo()) !== null;
