export default function DashboardLayout(props: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-130px)] overflow-hidden p-6">
      {props.children}
    </div>
  );
}
