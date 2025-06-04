import TireForm from "@/components/tires/tire-form";
import TireList from "@/components/tires/tire-list";
import TireAssignment from "@/components/tires/tire-assignment";

export default function Tires() {
  return (
    <div className="p-6 space-y-6">
      <TireForm />
      <TireList />
      <TireAssignment />
    </div>
  );
}
