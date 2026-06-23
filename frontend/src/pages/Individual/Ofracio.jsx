import MemberPage from "/home/evncrl/craylife/frontend/src/components/MemberPage.jsx"

export default function Ofracio({ sensors }) {
  return (
    <MemberPage
      title="Ofracio"
      sensors={sensors}
      sensorKeys={[
        "ir",
        "servo"
      ]}
    />
  );
}