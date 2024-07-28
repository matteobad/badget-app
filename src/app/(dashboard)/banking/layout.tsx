export default function DashboardLayout(props: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-hidden p-6">
      <div>{props.children}</div>
    </div>
  );
}
