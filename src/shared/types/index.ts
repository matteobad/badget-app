export type TreeNode<T> = [T, TreeNode<T>[]];

export type WithIdAndParentId = {
  id: string;
  parentId: string | null;
};
