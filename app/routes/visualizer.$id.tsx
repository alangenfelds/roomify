import { generate3DView } from "components/lib/ai.action";
import { Button } from "components/ui/Button";
import { Box, Download, RefreshCcw, Share2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";

const Visualizer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { initialImage, initialRendered, name } = location.state || {};
  const hasInitialGeneratedRef = useRef(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(
    initialRendered || null,
  );

  const handleBack = () => navigate("/");

  const runGeneration = async () => {
    if (!initialImage) {
      return;
    }

    setIsProcessing(true);
    try {
      const { renderedImage } = await generate3DView({
        sourceImage: initialImage,
      });

      if (!renderedImage) {
        return;
      }

      setCurrentImage(renderedImage);

      // TODO: update the project with the rendered image
    } catch (error) {
      console.error("Generation failed: ", error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!initialImage || hasInitialGeneratedRef.current) {
      return;
    }

    if (initialRendered) {
      setCurrentImage(initialRendered);
      hasInitialGeneratedRef.current = true;
      return;
    }

    hasInitialGeneratedRef.current = true;
    runGeneration();
  }, [initialImage, initialRendered]);

  return (
    <div className="visualizer">
      <nav className="topbar">
        <div className="brand">
          <Box className="logo" />
          <span className="name">Roomify</span>
        </div>

        <Button variant="ghost" size="sm" onClick={handleBack} className="exit">
          <X className="icon" /> Exit Editor
        </Button>
      </nav>

      <section className="content">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-meta">
              <p>Project</p>
              <h2>{`Untitled Project`}</h2>
              <p className="note">Created by You</p>
            </div>

            <div className="panel-actions">
              <Button
                className="export"
                size="sm"
                disabled={!currentImage}
                onClick={() => {}}
              >
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
              <Button
                className="share"
                size="sm"
                disabled={!currentImage}
                onClick={() => {}}
              >
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
            </div>
          </div>

          <div className={`render-area ${isProcessing ? "is-processing" : ""}`}>
            {currentImage ? (
              <img
                src={currentImage}
                alt="AI Rendered Image"
                className="render-img"
              />
            ) : (
              <div className="render-placeholder">
                {initialImage && (
                  <img
                    src={initialImage}
                    alt="Original Image"
                    className="render-fallback"
                  />
                )}
              </div>
            )}

            {isProcessing && (
              <div className="render-overlay">
                <div className="rendering-card">
                  <RefreshCcw className="spinner" />
                  <span className="title">Rendering...</span>
                  <span className="subtitle">
                    Generating 3D Visualization...
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Visualizer;
