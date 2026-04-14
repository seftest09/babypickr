"use client";

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";

function appendSummaryFromLine(
  line: string,
  id: string,
  signal: AbortSignal | undefined,
  setSummaries: Dispatch<SetStateAction<Record<string, string>>>,
) {
  if (signal?.aborted || !line) return;
  let evt: unknown;
  try {
    evt = JSON.parse(line);
  } catch {
    return;
  }
  if (
    typeof evt === "object" &&
    evt !== null &&
    (evt as { type?: string }).type === "content_block_delta" &&
    typeof (evt as { delta?: { type?: string; text?: string } }).delta === "object" &&
    (evt as { delta: { type?: string; text?: string } }).delta?.type === "text_delta" &&
    typeof (evt as { delta: { text: string } }).delta.text === "string"
  ) {
    const piece = (evt as { delta: { text: string } }).delta.text;
    setSummaries((prev) => ({ ...prev, [id]: (prev[id] ?? "") + piece }));
  }
}

export type ProductSummaryCategory = string;

/**
 * Streams AI summaries for products. Pass a stable `category` phrase for the prompt
 * (e.g. "stroller", "car seat", "baby monitor").
 */
export function useProductAiSummary(filters: unknown, category: ProductSummaryCategory) {
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [loadingSummaries, setLoadingSummaries] = useState<Record<string, boolean>>({});
  const summaryAbortByIdRef = useRef(new Map<string, AbortController>());

  useEffect(() => {
    for (const c of summaryAbortByIdRef.current.values()) {
      c.abort();
    }
    summaryAbortByIdRef.current.clear();
    setSummaries({});
    setLoadingSummaries({});
  }, [filters, category]);

  const requestSummary = useCallback(
    async <T extends { id: string }>(product: T) => {
      const id = product.id;
      summaryAbortByIdRef.current.get(id)?.abort();
      const controller = new AbortController();
      summaryAbortByIdRef.current.set(id, controller);

      setLoadingSummaries((prev) => ({ ...prev, [id]: true }));

      const finishLoading = () => {
        const current = summaryAbortByIdRef.current.get(id);
        if (current === controller) {
          summaryAbortByIdRef.current.delete(id);
          setLoadingSummaries((prev) => ({ ...prev, [id]: false }));
        } else if (current === undefined) {
          setLoadingSummaries((prev) => ({ ...prev, [id]: false }));
        }
      };

      try {
        const res = await fetch("/api/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product, filters, category }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) return;

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (controller.signal.aborted) return;
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            appendSummaryFromLine(line, id, controller.signal, setSummaries);
          }
        }
        appendSummaryFromLine(buffer, id, controller.signal, setSummaries);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        console.error("Summary error:", e);
      } finally {
        finishLoading();
      }
    },
    [filters, category],
  );

  return { summaries, loadingSummaries, requestSummary };
}
