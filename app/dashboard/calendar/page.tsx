import { Suspense } from "react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { CalendarView } from "@/components/dashboard/calendar-view";

export default function CalendarPage() {
  return (
    <Suspense fallback={<div>Loading calendar...</div>}>
      <DashboardLayout>
        <CalendarView />
      </DashboardLayout>
    </Suspense>
  );
}
