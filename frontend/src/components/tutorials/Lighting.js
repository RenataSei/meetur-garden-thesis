import React from 'react';
import './Tutorials.css'; 

const Lighting = () => {
  return (
    <div className="tutorial-tab-content">
      <div className="tutorial-header">
        <h2>Understanding Plant Light</h2>
        <p className="text-muted">Light is literally plant food! Getting the right amount of light is crucial for your plants to photosynthesize and thrive.</p>
      </div>

      <div className="tutorial-section">
        <h3>☀️ Direct Sunlight</h3>
        <p>The sun's rays hit the plant directly without any barriers. Usually found right on the windowsill of an unobstructed South or West-facing window.</p>
        <ul className="tutorial-list">
          <li><span className="accent">Best for:</span> Cacti, Succulents, Herbs, Bird of Paradise, and Citrus plants.</li>
          <li><span className="accent">Tip:</span> Acclimate plants slowly to avoid sunburn!</li>
        </ul>
      </div>

      <div className="tutorial-section">
        <h3>🌤️ Bright Indirect Light</h3>
        <p>The plant is in a bright room, but the sun's rays don't hit the leaves directly. Filtered through a sheer curtain or a few feet back from a window.</p>
        <ul className="tutorial-list">
          <li><span className="accent">Best for:</span> Monsteras, Philodendrons, Calatheas, and Alocasias.</li>
        </ul>
      </div>

      <div className="tutorial-section">
        <h3>🌥️ Low Light</h3>
        <p>Far away from windows. Remember: no plant thrives in completely zero light, but some are highly tolerant of dim conditions.</p>
        <ul className="tutorial-list">
          <li><span className="accent">Best for:</span> ZZ Plants, Snake Plants, Pothos, and Cast Iron Plants.</li>
        </ul>
      </div>

      <div className="tutorial-troubleshooting">
        <h3>Troubleshooting Light Issues</h3>
        <div className="troubleshoot-grid">
          
          <div className="troubleshoot-card warning">
            <h4>Too Much Light 🥵</h4>
            <ul>
              <li>Crispy, brown leaf edges (sunburn)</li>
              <li>Washed out, pale, or faded colors</li>
              <li>Leaves curling inward to protect themselves</li>
              <li>Soil dries out extremely fast</li>
            </ul>
          </div>

          <div className="troubleshoot-card info">
            <h4>Too Little Light 🥶</h4>
            <ul>
              <li>"Leggy" growth (stretched stems, huge gaps)</li>
              <li>Heavily leaning towards the nearest window</li>
              <li>Variegated leaves reverting to solid green</li>
              <li>Soil stays wet for weeks</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Lighting;