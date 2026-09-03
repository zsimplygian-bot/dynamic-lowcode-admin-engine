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
    label: 'Crear',
    loadingLabel: 'Creando...',
    buttonColor: 'blue',
    variant: 'default',
    method: 'post',
    icon: Plus,
    textColor: 'text-blue-500',
    modalPrefix: 'CREAR',
    description: 'Ingresa los datos para registrar un nuevo elemento.',
  },
  update: {
    label: 'Editar',
    loadingLabel: 'Editando...',
    buttonColor: 'green',
    variant: 'default',
    method: 'put',
    icon: Pencil,
    textColor: 'text-green-500',
    modalPrefix: 'EDITAR',
    description: 'Actualiza los datos del registro.',
  },
  delete: {
    label: 'Eliminar',
    loadingLabel: 'Eliminando...',
    buttonColor: 'red',
    variant: 'destructive',
    method: 'delete',
    icon: Trash2,
    textColor: 'text-red-500',
    modalPrefix: 'ELIMINAR',
    description: '¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.',
  },
  info: {
    label: 'Detalle',
    loadingLabel: '',
    buttonColor: undefined,
    variant: 'outline',
    method: 'get',
    icon: Eye,
    textColor: 'text-blue-500',
    modalPrefix: 'DETALLE',
    description: 'Consulta los datos del registro.',
  },
}