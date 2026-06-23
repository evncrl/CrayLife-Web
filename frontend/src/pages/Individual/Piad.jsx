import MemberPage from "/home/evncrl/craylife/frontend/src/components/MemberPage.jsx"

export default function Piad({ sensors }) {
  return (
    <MemberPage
      title="Piad"
      sensors={sensors}
      sensorKeys={[
        "ammonia",
        "uv"
      ]}
    />
  );
}