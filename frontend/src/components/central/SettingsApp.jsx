import { useState } from 'react';
import { useHMI } from '../../contexts/HMIContext';
import './SettingsApp.css';

function SettingsApp() {
  const { state, updateState } = useHMI();
  const [activeSubpage, setActiveSubpage] = useState(null); // null = main menu

  const handleQualityChange = (quality) => {
    updateState({ graphicsQuality: quality });
  };

  const handleModelChange = (modelPath) => {
    updateState({ selected3DModel: modelPath });
  };

  const settingsCategories = [
    {
      id: 'graphics',
      title: '3D Scene Settings',
      description: 'Adjust graphics quality and performance',
      icon: '🎮',
    },
    {
      id: 'display',
      title: 'Display',
      description: 'Screen brightness and appearance',
      icon: '🖥️',
    },
    {
      id: 'audio',
      title: 'Audio',
      description: 'Volume and sound preferences',
      icon: '🔊',
    },
    {
      id: 'connectivity',
      title: 'Connectivity',
      description: 'Bluetooth, Wi-Fi, and network settings',
      icon: '📡',
    },
    {
      id: 'vehicle',
      title: 'Vehicle',
      description: 'Vehicle-specific settings and preferences',
      icon: '🚗',
    },
    {
      id: 'system',
      title: 'System',
      description: 'System information and updates',
      icon: '⚙️',
    },
  ];

  const qualityOptions = [
    {
      id: 'low',
      label: 'Low Quality',
      description: 'Best performance, minimal resource usage',
      specs: [
        '625 vertices ground plane',
        '2 light sources',
        'No shadows',
        'Standard materials',
        '~60% less GPU usage'
      ],
      icon: '🚀'
    },
    {
      id: 'medium',
      label: 'Medium Quality',
      description: 'Balanced performance and visual quality',
      specs: [
        '2,500 vertices ground plane',
        '4 light sources',
        'Basic shadows',
        'Standard materials',
        '~40% less GPU usage'
      ],
      icon: '⚡'
    },
    {
      id: 'high',
      label: 'High Quality',
      description: 'Maximum visual fidelity',
      specs: [
        '10,000 vertices ground plane',
        '7 light sources',
        'Full quality shadows',
        'Physical-based materials',
        'Full GPU rendering'
      ],
      icon: '✨'
    }
  ];

  const modelOptions = [
    {
      id: 'default',
      path: '/models/vehicle.glb',
      label: 'Default Vehicle',
      description: 'Standard sedan model',
      icon: '🚗',
      preview: '/models/vehicle.glb'
    },
    {
      id: 'dodge',
      path: '/models/dodge.glb',
      label: 'Dodge',
      description: 'Dodge vehicle model',
      icon: '🚙',
      preview: '/models/dodge.glb'
    },
    {
      id: 'sports',
      path: '/models/sports-car.glb',
      label: 'Sports Car',
      description: 'High-performance sports car (coming soon)',
      icon: '🏎️',
      preview: '/models/sports-car.glb',
      disabled: true
    },
    {
      id: 'truck',
      path: '/models/truck.glb',
      label: 'Pickup Truck',
      description: 'Large pickup truck (coming soon)',
      icon: '🛻',
      preview: '/models/truck.glb',
      disabled: true
    }
  ];

  // Main Menu View
  const renderMainMenu = () => (
    <>
      <div className="settings-header">
        <h2>Settings</h2>
        <p className="settings-subtitle">Configure your HMI experience</p>
      </div>

      <div className="settings-content">
        <div className="settings-menu">
          {settingsCategories.map((category) => (
            <button
              key={category.id}
              className="settings-menu-item"
              onClick={() => setActiveSubpage(category.id)}
            >
              <div className="menu-item-icon">{category.icon}</div>
              <div className="menu-item-content">
                <div className="menu-item-title">{category.title}</div>
                <div className="menu-item-description">{category.description}</div>
              </div>
              <div className="menu-item-arrow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );

  // Graphics Subpage
  const renderGraphicsSubpage = () => (
    <>
      <div className="settings-header">
        <button className="back-button" onClick={() => setActiveSubpage(null)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <h2>3D Scene Settings</h2>
        <p className="settings-subtitle">Adjust graphics quality and performance</p>
      </div>

      <div className="settings-content">
        {/* Graphics Quality Section */}
        <section className="settings-section">
          <div className="section-header">
            <div className="section-icon">🎮</div>
            <div>
              <h3 className="section-title">Graphics Quality</h3>
              <p className="section-description">
                Adjust 3D rendering quality to optimize performance based on your hardware
              </p>
            </div>
          </div>

          <div className="quality-options">
            {qualityOptions.map((option) => (
              <button
                key={option.id}
                className={`quality-option ${state.graphicsQuality === option.id ? 'active' : ''}`}
                onClick={() => handleQualityChange(option.id)}
              >
                <div className="quality-option-header">
                  <span className="quality-icon">{option.icon}</span>
                  <div className="quality-info">
                    <div className="quality-label">{option.label}</div>
                    <div className="quality-description">{option.description}</div>
                  </div>
                  <div className="quality-radio">
                    {state.graphicsQuality === option.id && (
                      <div className="radio-selected" />
                    )}
                  </div>
                </div>
                <div className="quality-specs">
                  {option.specs.map((spec, index) => (
                    <div key={index} className="spec-item">
                      <span className="spec-dot">•</span>
                      <span className="spec-text">{spec}</span>
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>

          <div className="quality-note">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="var(--onSurface-inactive, rgba(255, 255, 255, 0.6))"/>
            </svg>
            <p>
              Quality changes apply immediately to the 3D vehicle view. 
              Lower settings are recommended for mobile devices or integrated graphics.
            </p>
          </div>
        </section>

        {/* Vehicle Model Section */}
        <section className="settings-section">
          <div className="section-header">
            <div className="section-icon">🚗</div>
            <div>
              <h3 className="section-title">Vehicle Model</h3>
              <p className="section-description">
                Choose which 3D vehicle model to display in the Vehicle View
              </p>
            </div>
          </div>

          <div className="model-options">
            {modelOptions.map((option) => (
              <button
                key={option.id}
                className={`model-option ${state.selected3DModel === option.path ? 'active' : ''} ${option.disabled ? 'disabled' : ''}`}
                onClick={() => !option.disabled && handleModelChange(option.path)}
                disabled={option.disabled}
              >
                <div className="model-option-header">
                  <span className="model-icon">{option.icon}</span>
                  <div className="model-info">
                    <div className="model-label">
                      {option.label}
                      {option.disabled && <span className="coming-soon-badge">Coming Soon</span>}
                    </div>
                    <div className="model-description">{option.description}</div>
                  </div>
                  <div className="model-radio">
                    {state.selected3DModel === option.path && !option.disabled && (
                      <div className="radio-selected" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="quality-note">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="var(--onSurface-inactive, rgba(255, 255, 255, 0.6))"/>
            </svg>
            <p>
              Model changes apply immediately to the 3D Vehicle View. Additional models will be added in future updates.
            </p>
          </div>
        </section>

        {/* Performance Info Section */}
        <section className="settings-section info-section">
          <div className="section-header">
            <div className="section-icon">📊</div>
            <div>
              <h3 className="section-title">Performance Information</h3>
              <p className="section-description">
                Current system performance metrics
              </p>
            </div>
          </div>

          <div className="info-grid">
            <div className="info-card">
              <div className="info-label">Current Quality</div>
              <div className="info-value">{state.graphicsQuality.charAt(0).toUpperCase() + state.graphicsQuality.slice(1)}</div>
            </div>
            <div className="info-card">
              <div className="info-label">Display Mode</div>
              <div className="info-value">Central Display</div>
            </div>
            <div className="info-card">
              <div className="info-label">Connection</div>
              <div className="info-value">WebSocket Active</div>
            </div>
            <div className="info-card">
              <div className="info-label">Renderer</div>
              <div className="info-value">WebGL 2.0</div>
            </div>
          </div>
        </section>
      </div>
    </>
  );

  // Placeholder for other subpages
  const renderPlaceholderSubpage = (title, icon) => (
    <>
      <div className="settings-header">
        <button className="back-button" onClick={() => setActiveSubpage(null)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <h2>{icon} {title}</h2>
        <p className="settings-subtitle">Settings coming soon</p>
      </div>

      <div className="settings-content">
        <div className="placeholder-content">
          <div className="placeholder-icon">{icon}</div>
          <h3>Coming Soon</h3>
          <p>{title} settings will be available in a future update.</p>
        </div>
      </div>
    </>
  );

  // Render based on active subpage
  const renderContent = () => {
    if (activeSubpage === 'graphics') {
      return renderGraphicsSubpage();
    } else if (activeSubpage === 'display') {
      return renderPlaceholderSubpage('Display', '🖥️');
    } else if (activeSubpage === 'audio') {
      return renderPlaceholderSubpage('Audio', '🔊');
    } else if (activeSubpage === 'connectivity') {
      return renderPlaceholderSubpage('Connectivity', '📡');
    } else if (activeSubpage === 'vehicle') {
      return renderPlaceholderSubpage('Vehicle', '🚗');
    } else if (activeSubpage === 'system') {
      return renderPlaceholderSubpage('System', '⚙️');
    } else {
      return renderMainMenu();
    }
  };

  return (
    <div className="settings-app">
      {renderContent()}
    </div>
  );
}

export default SettingsApp;

