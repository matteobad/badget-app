export default async function DashboardLayout(props: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-130px)] flex-col gap-6 overflow-hidden p-6 px-8">
      {props.children}
    </div>
  );
}
