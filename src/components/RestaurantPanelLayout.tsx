import type { ReactNode } from "react"
import Navbar from "./Navbar"
import RestaurantSidebar from "./RestaurantSidebar"

type Props = {
  title: string
  children: ReactNode
}

export default function RestaurantPanelLayout({ title, children }: Props) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
          <RestaurantSidebar />
          <main>{children}</main>
        </div>
      </div>
    </div>
  )
}