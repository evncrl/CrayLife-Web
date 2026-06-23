import MemberPage from "/home/evncrl/craylife/frontend/src/components/MemberPage.jsx"

export default function Belenzo({ sensors }) {
  return (
    <MemberPage
      title="Belenzo"
      sensors={sensors}
      sensorKeys={[
        "watertank_tds",
        "watertank_pump2",
        "watertank_pump3"
      ]}
    />
  );
}