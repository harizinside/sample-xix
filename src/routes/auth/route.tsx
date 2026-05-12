import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="auth-layout">
      <div className="auth-brand">{/* branding */}</div>
      <div className="auth-form">
        <Outlet />
      </div>
    </div>
  );
}
