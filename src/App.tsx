import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Lesson from "./pages/Lesson";
import Labs from "./pages/Labs";
import Review from "./pages/Review";
import Exercises from "./pages/Exercises";
import Traps from "./pages/Traps";
import ReferencePage from "./pages/Reference";
import { useSelector } from "./lib/store";

export default function App() {
  const theme = useSelector((s) => s.theme);

  // The whole palette hangs off [data-theme] on <html>.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/lesson/:id" element={<Lesson />} />
        <Route path="/labs" element={<Labs />} />
        <Route path="/review" element={<Review />} />
        <Route path="/exercises" element={<Exercises />} />
        <Route path="/traps" element={<Traps />} />
        <Route path="/reference" element={<ReferencePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
