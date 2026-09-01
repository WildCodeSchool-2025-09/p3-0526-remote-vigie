import { Outlet } from "react-router";
import "./index.css";
import "./app.scss";

function App() {
  return (
    <>
      {/* Structure globale */}
      <div className="GLOBAL-LAYOUT h-dvh flex flex-col">
        <div className="grow">
          <Outlet />
        </div>
        {/* Placeholder de la navigation */}
        <nav className="bg-primary text-white flex items-center justify-center">
          Navigation
        </nav>
      </div>
    </>
  );
}

export default App;
