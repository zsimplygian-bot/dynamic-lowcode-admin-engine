import { ReactNode } from 'react'
import { DynamicIcon } from '@/components/dynamic-icon'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

type SmartCardProps = {
  title: string
  description?: string
  icon?: string
  variant?: 'default' | 'destructive'
  children?: ReactNode
}

export function SmartCard({ title, description, icon, variant = 'default', children }: SmartCardProps) {
  const isDestructive = variant === 'destructive'

  return (
    <Card className={isDestructive ? 'border-destructive/30 bg-destructive/5' : ''}>
      <CardHeader className="space-y-1">
        <CardTitle className={`text-base flex items-center gap-2 ${isDestructive ? 'text-destructive' : ''}`}>
          {icon && <DynamicIcon name={icon} className="size-5" />}
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  )
}