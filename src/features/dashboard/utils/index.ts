export const getChildCategoryIds = (
  categories: { id: string; parentId: string | null }[],
  categoryId: string,
): string[] => {
  const children = categories
    .filter((c) => c.parentId === categoryId)
    .map((c) => c.id);

  return [
    categoryId,
    ...children.flatMap((childId) => getChildCategoryIds(categories, childId)),
  ];
};
