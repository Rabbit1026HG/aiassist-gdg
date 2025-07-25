// Ensure we're not loading any external resources that might cause issues
import { DashboardLayout } from "@/components/dashboard/layout"
import { DashboardOverview } from "@/components/dashboard/overview1"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardOverview />
    </DashboardLayout>
  )
}
