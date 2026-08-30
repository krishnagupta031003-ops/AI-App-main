'use client';

import { useContext } from 'react';
import { UiShellContext } from '../contexts/UiShellContext';

export function useUiShell() {
  const context = useContext(UiShellContext);

  if (!context) {
    throw new Error('useUiShell must be used within a UiShellProvider');
  }

  return context;
}

