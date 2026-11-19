import SegmentedControl from "../components/SegmentedControl";
import Gym from "./Gym";
import Nutrition from "./Nutrition";
import Weight from "./Weight";

export type FitnessSegment = "workout" | "nutrition" | "weight";

export default function Fitness({
  segment,
  onSegmentChange,
}: {
  segment: FitnessSegment;
  onSegmentChange: (s: FitnessSegment) => void;
}) {
  return (
    <div>
      <SegmentedControl
        value={segment}
        onChange={onSegmentChange}
        options={[
          { value: "workout", label: "Workout" },
          { value: "nutrition", label: "Nutrition" },
          { value: "weight", label: "Weight" },
        ]}
      />
      {segment === "workout" && <Gym />}
      {segment === "nutrition" && <Nutrition />}
      {segment === "weight" && <Weight />}
    </div>
  );
}
