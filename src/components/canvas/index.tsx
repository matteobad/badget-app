import { useArtifacts } from "@ai-sdk-tools/artifacts/client";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { CanvasErrorFallback } from "./base/canvas-error-fallback";
import { CashFlowCanvas } from "./cash-flow-canvas";
import { CategoryExpensesCanvas } from "./category-expenses-canvas";

export function Canvas() {
  const [selectedType, setSelectedType] = useQueryState(
    "artifact-type",
    parseAsString,
  );

  const [data] = useArtifacts({
    value: selectedType,
    onChange: (v) => setSelectedType(v ?? null),
    exclude: ["chat-title", "suggestions"],
  });

  const renderCanvas = useCallback(() => {
    switch (data.activeType) {
      case "cash-flow-canvas":
        return <CashFlowCanvas />;
      case "category-expenses-canvas":
        return <CategoryExpensesCanvas />;
      default:
        return null;
    }
  }, [data.activeType]);

  return (
    <ErrorBoundary key={selectedType} fallback={<CanvasErrorFallback />}>
      {renderCanvas()}
    </ErrorBoundary>
  );
}
