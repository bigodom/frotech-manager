import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

export function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  // Mock user data - replace with actual user data from your auth system
  const user = {
    name: "João Silva",
    role: "Gerente de Frota",
    avatar: "/avatars/01.png"
  }

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
    },
    {
      title: "Veículos",
      href: "/vehicles",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
    },
    {
      title: "Motoristas",
      href: "/drivers",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    },
    {
      title: "Pneus",
      href: "/tires",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M2 12h4"/><path d="M18 12h4"/></svg>
    },
    {
      title: "Alocação de Pneus",
      href: "/alocar",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8a8.01 8.01 0 0 1-8 8z"/><path d="M16.24 7.76a4.5 4.5 0 1 1-6.36-6.36l6.36 6.36z"/></svg> 
    },
    {
      title: "Alertas",
      href: "/alerts",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M6 8v6a6 6 0 0 0 12 0V8"/><path d="M4 8h16"/><path d="M12 2v4"/></svg>
    },
    {
      title: "Manutenção",
      href: "/maintenance",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
    },
    {
      title: "Abastecimento",
      href: "/fuel",
      icon: (
        <svg viewBox="0 0 512 512" fill="" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <g>
            <g>
              <g>
                <path d="M309.333,53.333h-192c-5.867,0-10.667,4.8-10.667,10.667v138.667c0,5.867,4.8,10.667,10.667,10.667h192
                  c5.867,0,10.667-4.8,10.667-10.667V64C320,58.133,315.2,53.333,309.333,53.333z M298.667,192H128V74.667h170.667V192z"/>
                <path d="M394.667,490.667H32c-5.867,0-10.667,4.8-10.667,10.667C21.333,507.2,26.133,512,32,512h362.667
                  c5.867,0,10.667-4.8,10.667-10.667C405.333,495.467,400.533,490.667,394.667,490.667z"/>
                <path d="M474.133,124.907l-32.64-37.653c-1.28-1.493-3.093-2.347-5.013-2.24c-11.627,0.213-15.147,11.627-9.6,18.027l31.04,35.84
                  c7.253,8.32,11.413,13.44,11.413,21.12h-29.867c-7.04,0-12.8,5.76-12.8,12.8V224c0,11.733,9.6,21.333,21.333,21.333h21.333v160
                  c0,5.867-4.8,10.667-10.667,10.667h-23.573c-6.187,0-8.427-5.76-8.427-10.667v-139.2c0-18.773-17.707-31.467-34.24-31.467
                  h-19.093V53.333C373.333,23.893,349.44,0,320,0H106.667c-29.44,0-53.333,23.893-53.333,53.333v415.253
                  c0,10.773,8.64,10.88,23.04,11.2c7.787,0.107,18.56,0.213,30.293,0.213H320c11.84,0,22.507-0.107,30.293-0.213
                  c14.4-0.213,23.04-0.427,23.04-11.2V256h19.093c6.507,0,12.907,5.013,12.907,10.133v139.2c0,18.24,12.8,32,29.76,32h23.573
                  c17.707,0,32-14.293,32-32V160C490.667,144,481.92,133.867,474.133,124.907z M352,458.453c-7.04,0.107-17.813,0.213-32,0.213
                  H106.667c-14.187,0-24.96-0.107-32-0.213V53.333c0-17.707,14.293-32,32-32H320c17.707,0,32,14.293,32,32V458.453z M469.333,224
                  H448v-42.667h21.333V224z"/>
              </g>
            </g>
          </g>
        </svg>
      )
    },
    {
      title: "Relatórios",
      href: "/reports",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
    },
    {
      title: "Configurações",
      href: "/settings",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
    },
    {
      title: "Abastecimentos Órfãos",
      href: "/orphanfuel",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8a8.01 8.01 0 0 1-8 8z"/><path d="M16.24 7.76a4.5 4.5 0 1 1-6.36-6.36l6.36 6.36z"/></svg>
    },
  ]

  const UserProfile = () => (
    <div className="flex items-center gap-3 px-3 py-4">
      <Avatar>
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{user.name}</span>
        <span className="text-xs text-muted-foreground">{user.role}</span>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <div className="flex h-full flex-col">
            <div className="flex-1 px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold">Frotech Manager</h2>
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                      location.pathname === item.href ? "bg-accent" : "transparent"
                    )}
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
            <Separator />
            <UserProfile />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className={cn("hidden md:block", className)}>
        <div className="flex h-full flex-col">
          <div className="flex-1 px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold">Frotech Manager</h2>
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                      location.pathname === item.href ? "bg-accent" : "transparent"
                    )}
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </div>
          <Separator />
          <UserProfile />
        </div>
      </div>
    </>
  )
} 