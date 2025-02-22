export default function Page() {
  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min"></div>
        <div className="grid auto-rows-min gap-4 md:grid-cols-2">
          <div className="aspect-square rounded-xl bg-muted/50" />
          <div className="aspect-square rounded-xl bg-muted/50" />
        </div>
      </div>
    </>
  );
}
