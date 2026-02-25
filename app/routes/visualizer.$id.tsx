import { generate3DView } from "components/lib/ai.action";
import { createProject, getProjectById } from "components/lib/puter.action";
import { Button } from "components/ui/Button";
import { Box, Download, RefreshCcw, Share2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import { useNavigate, useOutletContext, useParams } from "react-router";

const Visualizer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId } = useOutletContext<AuthContext>();

  const hasInitialGeneratedRef = useRef(false);

  const [project, setProject] = useState<DesignItem | null>(null);
  const [isProjectLoading, setIsProjectLoading] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  const handleBack = () => navigate("/");

  const handleExport = async () => {
    if (!currentImage) return;

    try {
      const response = await fetch(currentImage);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `roomify-${id}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to export image:", error);
    }
  };

  const runGeneration = async (item: DesignItem) => {
    if (!id || !item.sourceImage) return;

    try {
      setIsProcessing(true);
      const result = await generate3DView({
        sourceImage: item.sourceImage,
      });

      if (!result?.renderedImage) {
        return;
      }

      setCurrentImage(result.renderedImage);

      // update the project with the rendered image
      const updatedItem = {
        ...item,
        renderedImage: result.renderedImage,
        renderedPath: result.renderedPath,
        timestamp: Date.now(),
        ownerId: item.ownerId ?? userId ?? null,
        isPublic: item.isPublic ?? false,
      };

      const saved = await createProject({
        item: updatedItem,
        visibility: "private",
      });

      if (!saved) {
        console.error("Failed to save project!");
        return;
      }

      setProject(saved);
      setCurrentImage(saved.renderedImage || result.renderedImage);
    } catch (error) {
      console.error("Generation failed: ", error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadProject = async () => {
      if (!id) {
        setIsProjectLoading(false);
        return;
      }

      setIsProjectLoading(true);

      const fetchedProject = await getProjectById({ id });

      if (!isMounted) return;

      setProject(fetchedProject);
      setCurrentImage(fetchedProject?.renderedImage || null);
      setIsProjectLoading(false);
      hasInitialGeneratedRef.current = false;
    };

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (
      isProjectLoading ||
      hasInitialGeneratedRef.current ||
      !project?.sourceImage
    )
      return;

    if (project.renderedImage) {
      setCurrentImage(project.renderedImage);
      hasInitialGeneratedRef.current = true;
      return;
    }

    hasInitialGeneratedRef.current = true;
    void runGeneration(project);
  }, [project, isProjectLoading]);

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
              <h2>{project?.name || `Residence ${id}`}</h2>
              <p className="note">Created by You</p>
            </div>

            <div className="panel-actions">
              <Button
                className="export"
                size="sm"
                disabled={!currentImage}
                onClick={handleExport}
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
                {project?.sourceImage && (
                  <img
                    src={project?.sourceImage}
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

        <div className="panel compare">
          <div className="panel-header">
            <div className="panel-meta">
              <p>Comparison</p>
              <h3>Original vs AI Rendered</h3>
            </div>
            <div className="hint">Drag to compare</div>
          </div>

          <div className="compare-stage">
            {project?.sourceImage && currentImage ? (
              <ReactCompareSlider
                defaultValue={50}
                style={{ height: "auto", width: "100%" }}
                itemOne={
                  <ReactCompareSliderImage
                    src={project.sourceImage}
                    alt="before"
                  />
                }
                itemTwo={
                  <ReactCompareSliderImage src={currentImage} alt="after" />
                }
              />
            ) : (
              <div className="compare-fallback">
                {project?.sourceImage && (
                  <img
                    src={project.sourceImage}
                    alt="Original Image"
                    className="compare-img"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Visualizer;
