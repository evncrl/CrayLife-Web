// src/App.jsx

import { useState, useEffect } from "react";

import Sidebar from "../src/components/Sidebar";
import TopBar from "../src/components/Topbar";

import Overview from "../src/pages/Overview";
import Sensors from "../src/pages/Sensors";
import Outputs from "../src/pages/Outputs";
import History from "../src/pages/History";

import {fetchSensors} from "../src/services/api";

import Piad from "../src/pages/Individual/Piad";
import Tomon from "../src/pages/Individual/Tomon";
import Belenzo from "../src/pages/Individual/Belenzo";
import Leano from "../src/pages/Individual/Leaño";
import Carutcho from "../src/pages/Individual/Carutcho";
import Ofracio from "../src/pages/Individual/Ofracio";

import Control from "../src/pages/Control";

import "../src/styles/Dashboard.css";

function secondsAgo(date) {
  if (!date) return null;

  return Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 1000)
  );
}

export default function App() {
  const [page, setPage] = useState("overview");
  const [sensors, setSensors] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const loadSensors = async () => {
    try {
      const data = await fetchSensors();

      setSensors(data);
      setLastUpdated(new Date());
      setIsConnected(true);

    } catch (error) {
      console.error(error);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    loadSensors();

    const interval = setInterval(
      loadSensors,
      2000
    );

    return () => clearInterval(interval);
  }, []);

  const ago = secondsAgo(lastUpdated);

  const syncLabel =
    isConnected && ago !== null
      ? ago < 5
        ? "Live"
        : `Synced ${ago}s ago`
      : "Disconnected";

  const renderPage = () => {
    switch (page) {
      case "overview":
        return <Overview sensors={sensors} />;

      case "sensors":
        return <Sensors sensors={sensors} />;

      case "outputs":
        return <Outputs sensors={sensors} />;

      case "history":
        return <History />;

      case "piad":
        return <Piad sensors={sensors} />;

      case "tomon":
        return <Tomon sensors={sensors} />;

      case "belenzo":
        return <Belenzo sensors={sensors} />;

      case "leano":
        return <Leano sensors={sensors} />;

      case "carutcho":
        return <Carutcho sensors={sensors} />;

      case "ofracio":
        return <Ofracio sensors={sensors} />;

      default:
        return <Overview sensors={sensors} />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        activePage={page}
        onNavigate={setPage}
        alerts={0}
        isConnected={isConnected}
        syncLabel={syncLabel}
      />

      <div className="main-area">
        <TopBar page={page} />

        <main className="page-body">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}