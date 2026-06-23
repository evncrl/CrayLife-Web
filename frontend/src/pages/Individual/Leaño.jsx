import MemberPage from "/home/evncrl/craylife/frontend/src/components/MemberPage.jsx"

export default function Leano({ sensors }) {
  return (
    <MemberPage
      title="Leaño"
      sensors={sensors}
      sensorKeys={[
        "watertank_status",
        "watertank_valve"
      ]}
    />
  );
}   