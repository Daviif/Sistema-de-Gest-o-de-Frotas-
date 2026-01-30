import { Sidebar } from "../components/Sidebar"
import { Header } from "../components/Header"
import { Outlet } from "react-router-dom"

export function MainLayout() {
  return (
    <div className="flex bg-slate-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}


export default MainLayout