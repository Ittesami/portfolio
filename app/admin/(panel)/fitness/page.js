import FitnessTracker from "@/components/admin/fitness/FitnessTracker";

export const metadata = { title: "Fitness · Daily" };

export default function FitnessPage() {
  return (
    <>
      <h1 className="page-title small-title">Fitness</h1>
      <FitnessTracker />
    </>
  );
}
