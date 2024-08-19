import type { TopbarItem } from "../_components/topbar";
import Topbar from "../_components/topbar";

const bankingTopbarItems = [
  { title: "Overview", href: "/banking" },
  { title: "Transazioni", href: "/banking/transactions" },
] satisfies TopbarItem[];

export default async function DashboardLayout(props: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-130px)] flex-col gap-6 overflow-hidden p-6">
      <Topbar items={bankingTopbarItems} />
      <div className="flex flex-1">{props.children}</div>
    </div>
  );
}
