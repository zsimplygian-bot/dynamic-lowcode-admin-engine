import { memo } from 'react'
import { CellFormatter, CellFormatterProps } from '@/components/datatable/cell-formatter'
import { SmartBadge } from '@/components/smart-badge'

export const domainCustomRenderers = (accessor: string, value: any) => {
  if (accessor === 'consola' && String(value).toUpperCase() === "SWITCH") {
    return <SmartBadge label="SWITCH" variant="destructive" />
  }
  return null
}

export const CustomCellFormatter = memo((props: CellFormatterProps) => (
  <CellFormatter {...props} renderCustom={props.renderCustom ?? domainCustomRenderers} />
))

export default CustomCellFormatter