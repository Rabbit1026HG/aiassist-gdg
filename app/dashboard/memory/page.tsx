import { DashboardLayout } from "@/components/dashboard/layout"
import { MemoryManager } from "@/components/memory/memory-manager"

export default function MemoryPage() {
  return(<DashboardLayout><div className="h-full w-full">
      <MemoryManager />
    </div></DashboardLayout>) 
}
