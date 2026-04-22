'use client';

import { useContext, useMemo } from 'react';
import { AuthContext } from '@/lib/auth-context';


export function useHotel() {
  const auth = useContext(AuthContext);

  if (!auth?.user) {
    throw new Error('useHotel must be used within an authenticated component');
  }

  return useMemo(
    () => ({
      hotelId: auth.user.hotel_id,
      userId: auth.user.id,
      role: auth.user.role,
      outletIds: auth.user.outlet_ids,
      user: auth.user,
    }),
    [auth.user]
  );
}


export function usePermission(action: string) {
  const { role } = useHotel();

  const permissions: Record<string, string[]> = {
    'approve_discount': ['manager', 'hotel_admin', 'cashier'],
    'void_bill': ['manager', 'cashier'],
    'adjust_inventory': ['storekeeper', 'manager', 'hotel_admin'],
    'approve_stock': ['manager', 'hotel_admin'],
    'close_shift': ['cashier', 'manager'],
    'generate_invoice': ['accountant', 'cashier', 'front_desk'],
  };

  return permissions[action]?.includes(role) ?? false;
}
