import type { TreeNode, WithIdAndParentId } from "~/shared/types";

export const buildCategoryTree = <T extends WithIdAndParentId>(data: T[]) => {
  const lookup = new Map<string, TreeNode<T>>();
  const roots: TreeNode<T>[] = [];

  for (const item of data) {
    const node = lookup.get(item.id) ?? [item, []];
    node[0] = item; // aggiorna con l'oggetto completo
    lookup.set(item.id, node);

    if (item.parentId === null) {
      roots.push(node);
    } else {
      const parent = lookup.get(item.parentId) ?? [
        { ...({ id: item.parentId, parentId: null } as T) },
        [],
      ];
      lookup.set(item.parentId, parent);
      parent[1].push(node);
    }
  }

  return roots;
};
