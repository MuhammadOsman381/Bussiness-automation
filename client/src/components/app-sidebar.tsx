import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link, useLocation } from "react-router-dom"
import { NavUser } from "./nav-user"
import { BriefcaseBusiness } from "lucide-react"
import { IoCreateOutline } from "react-icons/io5";
import { TbRouteSquare } from "react-icons/tb";
import { MdOutlineDashboard } from "react-icons/md";
import axios from "axios"
import useGetAndDelete from "@/hooks/useGetAndDelete"
import { FaUserTie } from "react-icons/fa6";
import { PiUsersThree } from "react-icons/pi";

type AppSidebarProps = {
  setCurrentRoute: (route: string) => void
} & React.ComponentProps<typeof Sidebar>

export function AppSidebar({ setCurrentRoute, ...props }: AppSidebarProps) {
  const { pathname } = useLocation()
  const get = useGetAndDelete(axios.get)
  const [userData, setUserData] = React.useState({
    name: '',
    email: '',
    avatar: ''
  })

  const getMe = async () => {
    const response = await get.callApi('auth/me', true, false)
    setUserData({
      name: response.users.name,
      email: response.users.email,
      avatar: response.users.name.charAt(0).toUpperCase()
    })
    console.log(
      {
        name: response.users.name,
        email: response.users.email,
        avatar: response.users.name.charAt(0).toUpperCase()
      }
    )
  }

  const applicantRoutes = [
    {
      title: "Prescreen Interview",
      url: "/applicant/prescreen_interview",
      icon: BriefcaseBusiness,
    },
    {
      title: "Documents",
      url: "/applicant/documents",
      icon: IoCreateOutline,
    },
  ]

  const recruiterRoutes = [
    {
      title: "Dashboard",
      url: "/recruiter/dashboard",
      icon: MdOutlineDashboard,
    },
    {
      title: "Documents",
      url: "/recruiter/document",
      icon: IoCreateOutline,
    },
    // {
    //   title: "Jobs",
    //   icon: BriefcaseBusiness,
    //   url: "/recruiter/jobs",
    // },
    // {
    //   title: "Journey",
    //   icon: GiPathDistance,
    //   url: "/recruiter/journey",
    // },
    {
      title: "Prescreen Interview",
      icon: FaUserTie,
      url: "/recruiter/prescreen_interview",
    },
    {
      title: "Candidates",
      icon: PiUsersThree,
      url: "/recruiter/candidates",
    },
  ]


  const data = {
    user: userData,
    navMain: pathname.startsWith("/applicant")
      ? applicantRoutes
      : recruiterRoutes,
  }

  React.useEffect(() => {
    getMe()
  }, [])

  return (
    <Sidebar className="z-50" variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="bg-gradient-to-tr from-[#484f98] to-[#1a237e] text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <TbRouteSquare className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5  leading-none">
                  <span className="font-medium">Business Automation</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {data.navMain.map((item) => {
              const isActive = pathname === item.url
              return (
                <SidebarMenuItem  key={item.title}>
                  <Link
                    to={item.url}
                    onClick={() => setCurrentRoute(item.title)}
                    className={`font-medium ${isActive ? "text-blue-600" : ""}`}
                  >
                    <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
