
import { Outlet } from "react-router-dom";
import AppLayout from "./layout/AppLayout";

export function Layout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
