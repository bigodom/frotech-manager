import StatsGrid from "@/components/dashboard/stats-grid";
import RecentActivity from "@/components/dashboard/recent-activity";
import QuickActions from "@/components/dashboard/quick-actions";
import FleetOverviewTable from "@/components/dashboard/fleet-overview-table";

export default function Dashboard() {
  return (
    <div className="p-6">
      <StatsGrid />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <RecentActivity />
        <QuickActions />
      </div>

      <FleetOverviewTable />
    </div>
  );
}
