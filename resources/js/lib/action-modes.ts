import React, { useState, useCallback } from 'react'
import { TriggerColor, TriggerVariant } from '@/lib/trigger-utils'

export interface ModeConfig {
  label: string; loadingLabel: string; buttonColor?: TriggerColor; variant: TriggerVariant;
  method: 'post' | 'put' | 'delete' | 'get'; icon: string; textColor: string; modalPrefix: string; description: React.ReactNode
}

export const MODES = {
  s: { label: 'Save', loadingLabel: 'Creating...', buttonColor: 'blue', variant: 'default', method: 'post', icon: 'plus', textColor: 'text-blue-500', modalPrefix: 'CREATE', description: 'Enter details to register a new item.' },
  u: { label: 'Edit', loadingLabel: 'Editing...', buttonColor: 'green', variant: 'default', method: 'put', icon: 'pencil', textColor: 'text-green-500', modalPrefix: 'EDIT', description: 'Update record details.' },
  d: { label: 'Delete', loadingLabel: 'Deleting...', buttonColor: 'red', variant: 'destructive', method: 'delete', icon: 'trash-2', textColor: 'text-red-500', modalPrefix: 'DELETE', description: 'Are you sure you want to delete this record? This action cannot be undone.' },
  i: { label: 'Detail', loadingLabel: '', buttonColor: 'blue', variant: 'outline', method: 'get', icon: 'eye', textColor: 'text-sky-500', modalPrefix: 'DETAIL', description: 'View record details.' },
} as const satisfies Record<string, ModeConfig>

export const ACTION_MODES = MODES
export type Mode = keyof typeof MODES
export type ActionMode = Mode

// Hook que gestiona el modo y la configuración automáticamente
export function useMode(initial: Mode | null = null) {
  const [mode, setMode] = useState<Mode | null>(initial)
  const reset = useCallback(() => setMode(null), [])
  return { mode, setMode, config: mode ? MODES[mode] : null, reset }
}