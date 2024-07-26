import { ReactNode } from "react"

export default function PageHeader({children}: {children: ReactNode}) {
  return (
    <h1 className="text-4xl mb-2 font-bold">{children}</h1>
  )
}
