/**
 * Float.js Dev Indicator
 * A unique floating indicator for development mode
 */

export const FLOAT_INDICATOR_SCRIPT = `
<script id="__float-indicator">
(function() {
  // State
  let isConnected = false;
  let hasErrors = false;
  let errors = [];
  let isExpanded = false;
  let buildTime = null;
  
  // Create indicator
  const indicator = document.createElement('div');
  indicator.id = '__float-dev-indicator';
  indicator.innerHTML = \`
    <div class="float-indicator-btn" id="float-btn">
      <svg class="float-logo" viewBox="0 0 32 32" fill="none">
        <defs>
          <linearGradient id="floatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#6366f1"/>
            <stop offset="50%" style="stop-color:#8b5cf6"/>
            <stop offset="100%" style="stop-color:#d946ef"/>
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="14" stroke="url(#floatGrad)" stroke-width="2" fill="none" class="float-ring"/>
        <path d="M12 10 L20 16 L12 22 Z" fill="url(#floatGrad)" class="float-play"/>
      </svg>
      <div class="float-pulse"></div>
      <div class="float-status"></div>
    </div>
    <div class="float-panel" id="float-panel">
      <div class="float-panel-header">
        <span class="float-panel-title">⚡ Float.js</span>
        <span class="float-panel-version">v0.1.0</span>
        <button class="float-panel-close" id="float-close">×</button>
      </div>
      <div class="float-panel-content" id="float-content">
        <div class="float-status-row">
          <span class="float-status-label">Estado</span>
          <span class="float-status-value" id="float-state">Conectando...</span>
        </div>
        <div class="float-status-row">
          <span class="float-status-label">HMR</span>
          <span class="float-status-value" id="float-hmr">—</span>
        </div>
        <div class="float-status-row">
          <span class="float-status-label">Último build</span>
          <span class="float-status-value" id="float-build">—</span>
        </div>
        <div class="float-errors-container" id="float-errors" style="display:none;">
          <div class="float-errors-header">
            <span>⚠️ Errores</span>
            <span class="float-error-count" id="float-error-count">0</span>
          </div>
          <div class="float-errors-list" id="float-errors-list"></div>
        </div>
      </div>
      <div class="float-panel-footer">
        <a href="https://floatjs.dev/docs" target="_blank" class="float-link">Docs</a>
        <span class="float-separator">•</span>
        <button class="float-action" id="float-refresh">↻ Refresh</button>
      </div>
    </div>
  \`;
  
  // Styles
  const styles = document.createElement('style');
  styles.textContent = \`
    #__float-dev-indicator {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 99999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .float-indicator-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(15, 15, 20, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.1);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    
    .float-indicator-btn:hover {
      transform: scale(1.1);
      border-color: rgba(139, 92, 246, 0.5);
      box-shadow: 0 0 30px rgba(139, 92, 246, 0.3);
    }
    
    .float-logo {
      width: 28px;
      height: 28px;
    }
    
    .float-ring {
      transform-origin: center;
      animation: float-spin 8s linear infinite;
    }
    
    @keyframes float-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    .float-pulse {
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 2px solid transparent;
      opacity: 0;
    }
    
    .float-indicator-btn.connected .float-pulse {
      animation: float-pulse 2s ease-out infinite;
      border-color: #22c55e;
    }
    
    .float-indicator-btn.error .float-pulse {
      animation: float-pulse 1s ease-out infinite;
      border-color: #ef4444;
    }
    
    @keyframes float-pulse {
      0% { transform: scale(1); opacity: 0.8; }
      100% { transform: scale(1.5); opacity: 0; }
    }
    
    .float-status {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #6b7280;
      border: 2px solid rgba(15, 15, 20, 0.95);
      transition: background 0.3s;
    }
    
    .float-indicator-btn.connected .float-status { background: #22c55e; }
    .float-indicator-btn.error .float-status { background: #ef4444; }
    .float-indicator-btn.warning .float-status { background: #f59e0b; }
    
    .float-panel {
      position: absolute;
      bottom: 54px;
      right: 0;
      width: 320px;
      background: rgba(15, 15, 20, 0.98);
      backdrop-filter: blur(20px);
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.1);
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      opacity: 0;
      visibility: hidden;
      transform: translateY(10px) scale(0.95);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }
    
    .float-panel.open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0) scale(1);
    }
    
    .float-panel-header {
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
    }
    
    .float-panel-title {
      font-weight: 600;
      font-size: 14px;
      color: white;
    }
    
    .float-panel-version {
      font-size: 11px;
      color: rgba(255,255,255,0.4);
      background: rgba(255,255,255,0.1);
      padding: 2px 8px;
      border-radius: 10px;
    }
    
    .float-panel-close {
      margin-left: auto;
      background: none;
      border: none;
      color: rgba(255,255,255,0.5);
      font-size: 20px;
      cursor: pointer;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    
    .float-panel-close:hover {
      background: rgba(255,255,255,0.1);
      color: white;
    }
    
    .float-panel-content {
      padding: 16px;
    }
    
    .float-status-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    
    .float-status-row:last-child { border-bottom: none; }
    
    .float-status-label {
      font-size: 12px;
      color: rgba(255,255,255,0.5);
    }
    
    .float-status-value {
      font-size: 12px;
      color: white;
      font-weight: 500;
    }
    
    .float-status-value.success { color: #22c55e; }
    .float-status-value.error { color: #ef4444; }
    .float-status-value.warning { color: #f59e0b; }
    
    .float-errors-container {
      margin-top: 12px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 10px;
      overflow: hidden;
    }
    
    .float-errors-header {
      padding: 10px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #ef4444;
      border-bottom: 1px solid rgba(239, 68, 68, 0.2);
    }
    
    .float-error-count {
      background: #ef4444;
      color: white;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 600;
    }
    
    .float-errors-list {
      max-height: 150px;
      overflow-y: auto;
    }
    
    .float-error-item {
      padding: 10px 12px;
      font-size: 11px;
      color: rgba(255,255,255,0.8);
      border-bottom: 1px solid rgba(239, 68, 68, 0.1);
      font-family: 'Monaco', 'Menlo', monospace;
    }
    
    .float-error-item:last-child { border-bottom: none; }
    
    .float-error-file {
      color: #f59e0b;
      display: block;
      margin-bottom: 4px;
    }
    
    .float-panel-footer {
      padding: 12px 16px;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 12px;
    }
    
    .float-link {
      color: rgba(139, 92, 246, 0.8);
      text-decoration: none;
      transition: color 0.2s;
    }
    
    .float-link:hover { color: #8b5cf6; }
    
    .float-separator { color: rgba(255,255,255,0.2); }
    
    .float-action {
      background: rgba(255,255,255,0.1);
      border: none;
      color: white;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 11px;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .float-action:hover { background: rgba(255,255,255,0.15); }
    
    /* Hide indicator when no errors in production-like mode */
    #__float-dev-indicator.hidden { display: none; }
  \`;
  
  document.head.appendChild(styles);
  document.body.appendChild(indicator);
  
  // Elements
  const btn = document.getElementById('float-btn');
  const panel = document.getElementById('float-panel');
  const closeBtn = document.getElementById('float-close');
  const refreshBtn = document.getElementById('float-refresh');
  const stateEl = document.getElementById('float-state');
  const hmrEl = document.getElementById('float-hmr');
  const buildEl = document.getElementById('float-build');
  const errorsContainer = document.getElementById('float-errors');
  const errorsList = document.getElementById('float-errors-list');
  const errorCount = document.getElementById('float-error-count');
  
  // Toggle panel
  btn.addEventListener('click', () => {
    isExpanded = !isExpanded;
    panel.classList.toggle('open', isExpanded);
  });
  
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    isExpanded = false;
    panel.classList.remove('open');
  });
  
  refreshBtn.addEventListener('click', () => {
    window.location.reload();
  });
  
  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!indicator.contains(e.target) && isExpanded) {
      isExpanded = false;
      panel.classList.remove('open');
    }
  });
  
  // Update UI
  function updateState(state, message) {
    btn.className = 'float-indicator-btn ' + state;
    stateEl.textContent = message;
    stateEl.className = 'float-status-value ' + state;
  }
  
  function showErrors(errorList) {
    errors = errorList;
    if (errors.length > 0) {
      hasErrors = true;
      errorsContainer.style.display = 'block';
      errorCount.textContent = errors.length;
      errorsList.innerHTML = errors.map(err => \`
        <div class="float-error-item">
          <span class="float-error-file">\${err.file || 'Unknown file'}</span>
          \${err.message}
        </div>
      \`).join('');
      updateState('error', errors.length + ' error(s)');
      
      // Auto-expand on error
      if (!isExpanded) {
        isExpanded = true;
        panel.classList.add('open');
      }
    } else {
      hasErrors = false;
      errorsContainer.style.display = 'none';
      if (isConnected) {
        updateState('connected', 'Listo');
      }
    }
  }
  
  // WebSocket connection
  const wsUrl = 'ws://' + window.location.hostname + ':' + (parseInt(window.location.port) + 1);
  let ws;
  let reconnectAttempts = 0;
  
  function connect() {
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      isConnected = true;
      reconnectAttempts = 0;
      updateState('connected', 'Conectado');
      hmrEl.textContent = 'Activo';
      hmrEl.className = 'float-status-value success';
      console.log('[Float] ⚡ HMR conectado');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'reload') {
          buildEl.textContent = 'Recargando...';
          window.location.reload();
        }
        
        if (data.type === 'build-start') {
          updateState('warning', 'Compilando...');
          buildEl.textContent = 'En progreso...';
        }
        
        if (data.type === 'build-complete') {
          buildTime = new Date();
          buildEl.textContent = 'Hace un momento';
          if (!hasErrors) {
            updateState('connected', 'Listo');
          }
        }
        
        if (data.type === 'errors') {
          showErrors(data.errors || []);
        }
        
        if (data.type === 'clear-errors') {
          showErrors([]);
        }
        
      } catch (e) {
        console.error('[Float] Error parsing message:', e);
      }
    };
    
    ws.onclose = () => {
      isConnected = false;
      updateState('', 'Desconectado');
      hmrEl.textContent = 'Inactivo';
      hmrEl.className = 'float-status-value error';
      
      // Reconnect with backoff
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
      reconnectAttempts++;
      setTimeout(connect, delay);
    };
    
    ws.onerror = () => {
      ws.close();
    };
  }
  
  connect();
  
  // Update build time periodically
  setInterval(() => {
    if (buildTime) {
      const seconds = Math.floor((Date.now() - buildTime) / 1000);
      if (seconds < 60) {
        buildEl.textContent = 'Hace ' + seconds + 's';
      } else if (seconds < 3600) {
        buildEl.textContent = 'Hace ' + Math.floor(seconds / 60) + 'm';
      }
    }
  }, 1000);
})();
</script>
`;
