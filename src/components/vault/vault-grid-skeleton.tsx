import { VaultItemSkeleton } from "./vault-item-skeleton";

export function VaultGridSkeleton() {
  return (
    <div>
      <div className="3xl:grid-cols-6 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, index) => (
          <VaultItemSkeleton key={index.toString()} />
        ))}
      </div>
    </div>
  );
}
