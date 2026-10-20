import { useEffect, useState } from "react";
import { adminRagApi } from "../api/adminRagApi";

type ChunkImageProps = { chunkId: string; heading: string };

type ImageState = { chunkId: string; url: string | null; failed: boolean };

export function ChunkImage({ chunkId, heading }: ChunkImageProps) {
  const [state, setState] = useState<ImageState | null>(null);
  const [zoomed, setZoomed] = useState(false);

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
  const url = current.url;
  const openFullSize = () => {
    // The object URL stays valid until this component's cleanup revokes it.
    window.open(url, "_blank", "noopener");
  };

  return (
    <div className="rag-image-wrap">
      <div className={`rag-image-box${zoomed ? " zoomed" : ""}`}>
        <button className="rag-image-open" type="button" title="Open full size in a new tab" onClick={openFullSize}>
          <img className="rag-image" src={url} alt={`Original image for chunk: ${heading || "untitled"}`} />
        </button>
      </div>
      <div className="rag-image-actions">
        <button className="secondary-button" type="button" aria-pressed={zoomed} onClick={() => setZoomed((value) => !value)}>
          {zoomed ? "Fit to width" : "Actual size"}
        </button>
        <button className="secondary-button" type="button" onClick={openFullSize}>
          Open in new tab
        </button>
      </div>
    </div>
  );
}
