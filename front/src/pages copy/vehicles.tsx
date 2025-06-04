import VehicleForm from "@/components/vehicles/vehicle-form";
import VehicleList from "@/components/vehicles/vehicle-list";

export default function Vehicles() {
  return (
    <div className="p-6 space-y-6">
      <VehicleForm />
      <VehicleList />
    </div>
  );
}
