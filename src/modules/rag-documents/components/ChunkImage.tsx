import { useEffect, useState } from "react";
import { adminRagApi } from "../api/adminRagApi";

type ChunkImageProps = { chunkId: string; heading: string };

type ImageState = { chunkId: string; url: string | null; failed: boolean };

export function ChunkImage({ chunkId, heading }: ChunkImageProps) {
  const [state, setState] = useState<ImageState | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    adminRagApi
      .getChunkImage(chunkId)
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        if (cancelled) {
          // Late response for a previous chunk: release it right away.
          URL.revokeObjectURL(url);
          return;
        }
        objectUrl = url;
        setState({ chunkId, url, failed: false });
      })
      .catch(() => {
        if (!cancelled) setState({ chunkId, url: null, failed: true });
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [chunkId]);

  const current = state && state.chunkId === chunkId ? state : null;

  if (current?.failed) {
    return <div className="rag-image-state">Image unavailable</div>;
  }
  if (!current?.url) {
    return <div className="rag-image-state">Loading image...</div>;
  }
  return <img className="rag-image" src={current.url} alt={`Original image for chunk: ${heading || "untitled"}`} />;
}
