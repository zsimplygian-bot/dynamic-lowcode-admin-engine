// use-can.ts
import { ReactNode } from "react"
import { usePage } from "@inertiajs/react"

export function useCan(): boolean {
  const { auth } = usePage<any>().props
  return Boolean(auth?.user?.roles?.includes("admin"))
}

export function Can({ children }: { children: ReactNode }) {
  return useCan() ? {children} : null
}