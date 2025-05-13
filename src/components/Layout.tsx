
import { Outlet } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import { useData } from "@/contexts/data/DataContext";

export function Layout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
