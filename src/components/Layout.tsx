import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout() {
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  // scroll to top on navigation (unless jumping to an in-page anchor)
  useEffect(() => {
    if (!location.hash) window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  // any navigation closes the mobile drawer
  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={"app" + (navOpen ? " nav-open" : "")}>
      <Sidebar />
      {navOpen && <div className="nav-scrim" onClick={() => setNavOpen(false)} />}
      <div className="main">
        <Topbar onMenu={() => setNavOpen((v) => !v)} />
        <Outlet />
      </div>
    </div>
  );
}
