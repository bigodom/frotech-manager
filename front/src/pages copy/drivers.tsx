import DriverForm from "@/components/drivers/driver-form";
import DriverList from "@/components/drivers/driver-list";

export default function Drivers() {
  return (
    <div className="p-6 space-y-6">
      <DriverForm />
      <DriverList />
    </div>
  );
}
