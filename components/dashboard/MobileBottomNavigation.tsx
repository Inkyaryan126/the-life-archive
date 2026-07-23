"use client";

import {
  AuthenticatedMobileBottomNavigation,
  type AuthenticatedMobileBottomNavigationProps
} from "@/components/navigation/AuthenticatedMobileBottomNavigation";

export function MobileBottomNavigation(
  props: AuthenticatedMobileBottomNavigationProps
) {
  return <AuthenticatedMobileBottomNavigation {...props} />;
}
