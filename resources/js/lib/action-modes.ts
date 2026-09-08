import React from 'react'
import { Plus, Pencil, Trash2, Eye, LucideIcon } from 'lucide-react'
import { TriggerColor, TriggerVariant } from '@/lib/trigger-utils'

export type ActionMode = 'store' | 'update' | 'delete' | 'info'

export interface ModeConfig {
  label: string
  loadingLabel: string
  buttonColor?: TriggerColor
  variant: TriggerVariant
  method: 'post' | 'put' | 'delete' | 'get'
  icon: LucideIcon
  textColor: string
  modalPrefix: string
  description: string | React.ReactNode
}

export const ACTION_MODES: Record<ActionMode, ModeConfig> = {
  store: {
    label: 'Create',
    loadingLabel: 'Creating...',
    buttonColor: 'blue',
    variant: 'default',
    method: 'post',
    icon: Plus,
    textColor: 'text-blue-500',
    modalPrefix: 'CREATE',
    description: 'Enter the details to register a new item.',
  },
  update: {
    label: 'Edit',
    loadingLabel: 'Editing...',
    buttonColor: 'green',
    variant: 'default',
    method: 'put',
    icon: Pencil,
    textColor: 'text-green-500',
    modalPrefix: 'EDIT',
    description: 'Update the record details.',
  },
  delete: {
    label: 'Delete',
    loadingLabel: 'Deleting...',
    buttonColor: 'red',
    variant: 'destructive',
    method: 'delete',
    icon: Trash2,
    textColor: 'text-red-500',
    modalPrefix: 'DELETE',
    description: 'Are you sure you want to delete this record? This action cannot be undone.',
  },
  info: {
    label: 'Detail',
    loadingLabel: '',
    buttonColor: undefined,
    variant: 'outline',
    method: 'get',
    icon: Eye,
    textColor: 'text-blue-500',
    modalPrefix: 'DETAIL',
    description: 'View record details.',
  },
}