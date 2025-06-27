import { ChatInterface } from "@/components/dashboard/chat-interface"
import { DashboardLayout } from "@/components/dashboard/layout"

export default function ChatPage() {
  return (
    <DashboardLayout>
      <div className="h-full w-full">
        <ChatInterface />
      </div>
    </DashboardLayout>
  )
}
