'use client';

/**
 * Chat Shell Layout
 * ChatGPT-style shell with guest access and modal auth
 */

import { UiShellProvider } from '../../contexts/UiShellContext';
import ChatShell from '../../components/layout/ChatShell';

export default function DashboardLayout({ children }) {
  return (
    <UiShellProvider>
      <ChatShell>{children}</ChatShell>
    </UiShellProvider>
  );
}
