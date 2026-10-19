import { useEffect, useState } from "react";
import { AdminApiError } from "../../../shared/api/httpClient";
import { adminRagApi } from "../api/adminRagApi";
import type { RagTaxonomy } from "../types/adminRag.types";

/** Loaded once per mount. On failure `taxonomy` stays null and callers fall back to raw keys. */
export function useRagTaxonomy() {
  const [taxonomy, setTaxonomy] = useState<RagTaxonomy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminRagApi
      .getTaxonomy()
      .then((response) => {
        if (cancelled) return;
        setTaxonomy(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        if (cancelled) return;
        setErrorCode(error instanceof AdminApiError ? error.code : "UNKNOWN_ERROR");
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { taxonomy, isLoading, errorCode };
}
