import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { FileText, BookOpen, MessageSquare, Home } from "lucide-react"
import Link from "next/link"

// Menu items.
const items = [
  {
    title: "Documents",
    url: "/documents",
    icon: FileText,
  },
  {
    title: "Prompts",
    url: "/prompts",
    icon: MessageSquare,
  },
  {
    title: "Exams",
    url: "/exams",
    icon: BookOpen,
  },
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border/50">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-80 transition-opacity">
          <Home className="h-5 w-5" />
          <span className="truncate">SuperExam</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border/50">
         <div className="text-xs text-muted-foreground text-center">
            v0.1.0
         </div>
      </SidebarFooter>
    </Sidebar>
  )
}
