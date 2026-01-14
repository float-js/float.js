/**
 * Float.js Error Overlay
 * Beautiful full-screen error display
 */

export const FLOAT_ERROR_OVERLAY = `
<script id="__float-error-overlay">
(function() {
  window.__FLOAT_SHOW_ERROR = function(error) {
    // Remove existing overlay
    const existing = document.getElementById('__float-error-overlay');
    if (existing) existing.remove();
    
    const overlay = document.createElement('div');
    overlay.id = '__float-error-overlay';
    overlay.innerHTML = \`
      <div class="feo-backdrop"></div>
      <div class="feo-container">
        <div class="feo-header">
          <div class="feo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div class="feo-title-group">
            <h1 class="feo-title">\${error.type || 'Error'}</h1>
            <p class="feo-subtitle">\${error.file || ''}</p>
          </div>
          <button class="feo-close" onclick="this.closest('#__float-error-overlay').remove()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="feo-content">
          <div class="feo-message">\${error.message}</div>
          \${error.stack ? \`<pre class="feo-stack">\${error.stack}</pre>\` : ''}
          \${error.frame ? \`
            <div class="feo-frame">
              <div class="feo-frame-header">
                <span class="feo-frame-file">\${error.file || 'source'}</span>
                \${error.line ? \`<span class="feo-frame-line">:\${error.line}\${error.column ? ':' + error.column : ''}</span>\` : ''}
              </div>
              <pre class="feo-frame-code">\${error.frame}</pre>
            </div>
          \` : ''}
        </div>
        <div class="feo-footer">
          <div class="feo-hint">
            <span class="feo-hint-icon">💡</span>
            <span>\${error.hint || 'Revisa el código y guarda para recargar automáticamente'}</span>
          </div>
          <div class="feo-actions">
            <button class="feo-btn feo-btn-secondary" onclick="navigator.clipboard.writeText(document.querySelector('.feo-stack')?.textContent || '')">
              Copiar error
            </button>
            <button class="feo-btn feo-btn-primary" onclick="window.location.reload()">
              Reintentar
            </button>
          </div>
        </div>
      </div>
    \`;
    
    const styles = document.createElement('style');
    styles.textContent = \`
      #__float-error-overlay {
        position: fixed;
        inset: 0;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      
      .feo-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(8px);
      }
      
      .feo-container {
        position: relative;
        width: 100%;
        max-width: 800px;
        max-height: 90vh;
        background: linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%);
        border-radius: 20px;
        border: 1px solid rgba(239, 68, 68, 0.3);
        box-shadow: 
          0 0 0 1px rgba(239, 68, 68, 0.1),
          0 20px 60px rgba(239, 68, 68, 0.2),
          0 0 100px rgba(239, 68, 68, 0.1);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      
      .feo-header {
        padding: 24px;
        display: flex;
        align-items: flex-start;
        gap: 16px;
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, transparent 100%);
        border-bottom: 1px solid rgba(255,255,255,0.05);
      }
      
      .feo-icon {
        width: 48px;
        height: 48px;
        background: rgba(239, 68, 68, 0.2);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      
      .feo-icon svg {
        width: 28px;
        height: 28px;
        color: #ef4444;
      }
      
      .feo-title-group {
        flex: 1;
        min-width: 0;
      }
      
      .feo-title {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #ef4444;
      }
      
      .feo-subtitle {
        margin: 4px 0 0;
        font-size: 13px;
        color: rgba(255,255,255,0.5);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .feo-close {
        width: 36px;
        height: 36px;
        background: rgba(255,255,255,0.05);
        border: none;
        border-radius: 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }
      
      .feo-close:hover {
        background: rgba(255,255,255,0.1);
      }
      
      .feo-close svg {
        width: 18px;
        height: 18px;
        color: rgba(255,255,255,0.5);
      }
      
      .feo-content {
        padding: 24px;
        overflow-y: auto;
        flex: 1;
      }
      
      .feo-message {
        font-size: 16px;
        color: #fca5a5;
        line-height: 1.6;
        margin-bottom: 20px;
      }
      
      .feo-stack {
        background: rgba(0,0,0,0.4);
        border-radius: 12px;
        padding: 16px;
        margin: 0 0 20px;
        font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
        font-size: 12px;
        color: rgba(255,255,255,0.7);
        line-height: 1.8;
        overflow-x: auto;
        white-space: pre-wrap;
        word-break: break-all;
      }
      
      .feo-frame {
        background: rgba(0,0,0,0.3);
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,0.05);
      }
      
      .feo-frame-header {
        padding: 12px 16px;
        background: rgba(255,255,255,0.03);
        border-bottom: 1px solid rgba(255,255,255,0.05);
        font-size: 12px;
      }
      
      .feo-frame-file {
        color: #f59e0b;
      }
      
      .feo-frame-line {
        color: rgba(255,255,255,0.4);
      }
      
      .feo-frame-code {
        margin: 0;
        padding: 16px;
        font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
        font-size: 13px;
        color: rgba(255,255,255,0.8);
        line-height: 1.6;
        overflow-x: auto;
      }
      
      .feo-footer {
        padding: 20px 24px;
        background: rgba(0,0,0,0.3);
        border-top: 1px solid rgba(255,255,255,0.05);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }
      
      .feo-hint {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: rgba(255,255,255,0.5);
      }
      
      .feo-hint-icon {
        font-size: 16px;
      }
      
      .feo-actions {
        display: flex;
        gap: 10px;
      }
      
      .feo-btn {
        padding: 10px 20px;
        border-radius: 10px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
      }
      
      .feo-btn-secondary {
        background: rgba(255,255,255,0.1);
        color: white;
      }
      
      .feo-btn-secondary:hover {
        background: rgba(255,255,255,0.15);
      }
      
      .feo-btn-primary {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
      }
      
      .feo-btn-primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
      }
    \`;
    
    overlay.appendChild(styles);
    document.body.appendChild(overlay);
  };
  
  window.__FLOAT_HIDE_ERROR = function() {
    const overlay = document.getElementById('__float-error-overlay');
    if (overlay) overlay.remove();
  };
  
  // Global error handler
  window.addEventListener('error', (event) => {
    window.__FLOAT_SHOW_ERROR({
      type: 'Runtime Error',
      message: event.message,
      file: event.filename,
      line: event.lineno,
      column: event.colno,
      stack: event.error?.stack
    });
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    window.__FLOAT_SHOW_ERROR({
      type: 'Unhandled Promise Rejection',
      message: String(event.reason),
      stack: event.reason?.stack
    });
  });
})();
</script>
`;
