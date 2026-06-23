import MemberPage from "/home/evncrl/craylife/frontend/src/components/MemberPage.jsx"

export default function Tomon({ sensors }) {
  return (
    <MemberPage
      title="Tomon"
      sensors={sensors}
      sensorKeys={[
        "lux",
        "growlightstatus"
      ]}
    />
  );
}