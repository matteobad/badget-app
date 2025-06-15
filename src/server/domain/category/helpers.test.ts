import { describe, expect, it } from "bun:test";

import { buildCategoryTree } from "./helpers";

describe("buildCategoryTree", () => {
  it("should build a tree with a single root node", () => {
    const data = [{ id: "1", parentId: null, name: "Root" }];
    const tree = buildCategoryTree(data);
    expect(tree).toEqual([[{ id: "1", parentId: null, name: "Root" }, []]]);
  });

  it("should build a tree with nested children", () => {
    const data = [
      { id: "1", parentId: null, name: "Root" },
      { id: "2", parentId: "1", name: "Child 1" },
      { id: "3", parentId: "1", name: "Child 2" },
      { id: "4", parentId: "2", name: "Grandchild" },
    ];
    const tree = buildCategoryTree(data);
    expect(tree).toEqual([
      [
        { id: "1", parentId: null, name: "Root" },
        [
          [
            { id: "2", parentId: "1", name: "Child 1" },
            [[{ id: "4", parentId: "2", name: "Grandchild" }, []]],
          ],
          [{ id: "3", parentId: "1", name: "Child 2" }, []],
        ],
      ],
    ]);
  });

  it("should build a forest with multiple root nodes", () => {
    const data = [
      { id: "1", parentId: null, name: "Root 1" },
      { id: "2", parentId: null, name: "Root 2" },
      { id: "3", parentId: "1", name: "Child of Root 1" },
      { id: "4", parentId: "2", name: "Child of Root 2" },
    ];
    const tree = buildCategoryTree(data);
    expect(tree).toEqual([
      [
        { id: "1", parentId: null, name: "Root 1" },
        [[{ id: "3", parentId: "1", name: "Child of Root 1" }, []]],
      ],
      [
        { id: "2", parentId: null, name: "Root 2" },
        [[{ id: "4", parentId: "2", name: "Child of Root 2" }, []]],
      ],
    ]);
  });

  it("should handle empty input", () => {
    const data: { id: string; parentId: string | null }[] = [];
    const tree = buildCategoryTree(data);
    expect(tree).toEqual([]);
  });

  // it("should handle nodes with missing parents gracefully", () => {
  //   const data = [{ id: "2", parentId: "1", name: "Orphan" }];
  //   const tree = buildCategoryTree(data);
  //   expect(tree).toEqual([
  //     [
  //       { id: "1", parentId: null },
  //       [[{ id: "2", parentId: "1", name: "Orphan" }, []]],
  //     ],
  //   ]);
  // });
});
