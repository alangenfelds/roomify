import React from "react";
import { useLocation } from "react-router";

const Visualizer = () => {
  const location = useLocation();
  const { initialImage, initialRendered, name } = location.state || {};

  return (
    <section>
      <h1>{name || "Untitled Project"}</h1>

      <div className="visializer">
        {initialImage && (
          <div className="image-container">
            <h2>Source Image</h2>
            <img src={initialImage} alt="Source Image" />
          </div>
        )}

        {/* {initialRendered && (
          <div className="image-container">
            <h2>Rendered Image</h2>
            <img src={initialRendered} alt="Rendered Image" />
          </div>
        )} */}
      </div>
    </section>
  );
};

export default Visualizer;
