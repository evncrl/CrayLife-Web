import MemberPage from "/home/evncrl/craylife/frontend/src/components/MemberPage.jsx"

export default function Carutcho({ sensors }) {
  return (
    <MemberPage
      title="Carutcho"
      sensors={sensors}
      sensorKeys={[
        "watertank_flow",
        "gsm"
      ]}
    />
  );
}