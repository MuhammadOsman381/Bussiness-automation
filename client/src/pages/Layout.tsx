import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
export default function Layout() {
  const { pathname } = useLocation()
  const [currentRoute, setCurrentRoute] = useState('')

  useEffect(() => {
    if (!currentRoute) {
      const parts = pathname.split("/");
      if (parts.length > 2) {
        setCurrentRoute(parts[2]);
      }
    }
  }, [pathname, currentRoute]);


  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar setCurrentRoute={setCurrentRoute} className="z-50 shadow-none" />
      <SidebarInset>
        <header className="flex h-16 shrink-0 ml-2  items-center gap-2 ">
          <SidebarTrigger className="-ml-1" />
          <div className="  border-gray-300 h-16 w-full flex items-center">
            <span className="bg-gradient-to-tr from-[#484f98] to-[#1a237e] ml-1  
            py-1.5 px-4 text-white
             rounded-lg">
              {currentRoute}
            </span>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 mt-3">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
