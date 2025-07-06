import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ExternalLink, Monitor, Smartphone, Tablet, RefreshCw } from 'lucide-react';

interface LivePreviewProps {
  code: string;
}

export default function LivePreview({ code }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const viewModes = {
    desktop: { width: '100%', height: '600px', icon: Monitor },
    tablet: { width: '768px', height: '600px', icon: Tablet },
    mobile: { width: '375px', height: '600px', icon: Smartphone }
  };

  useEffect(() => {
    if (code && iframeRef.current) {
      renderPreview();
    }
  }, [code]);

  const renderPreview = () => {
    if (!iframeRef.current) return;

    setIsLoading(true);
    setHasError(false);

    try {
      // Create a complete HTML document with the React code
      const previewHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }
    .error { color: red; padding: 20px; background: #fee; border: 1px solid #fcc; border-radius: 4px; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    try {
      // Wrap the generated code in a try-catch
      const { useState, useEffect } = React;
      
      ${code}
      
      // Try to render the default export or first component found
      const Component = typeof App !== 'undefined' ? App : 
                       typeof Home !== 'undefined' ? Home :
                       typeof Main !== 'undefined' ? Main :
                       (() => React.createElement('div', {}, 'Component not found'));
      
      ReactDOM.render(React.createElement(Component), document.getElementById('root'));
    } catch (error) {
      console.error('Preview error:', error);
      document.getElementById('root').innerHTML = 
        '<div class="error"><h3>Preview Error</h3><p>' + error.message + '</p></div>';
    }
  </script>
</body>
</html>`;

      const blob = new Blob([previewHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      iframeRef.current.onload = () => {
        setIsLoading(false);
        URL.revokeObjectURL(url);
      };
      
      iframeRef.current.onerror = () => {
        setHasError(true);
        setIsLoading(false);
      };
      
      iframeRef.current.src = url;
    } catch (error) {
      setHasError(true);
      setIsLoading(false);
      console.error('Preview generation error:', error);
    }
  };

  const handleRefresh = () => {
    renderPreview();
  };

  const handleOpenInNewTab = () => {
    if (iframeRef.current?.src) {
      window.open(iframeRef.current.src, '_blank');
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border/50 p-3 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Live Preview</span>
            {isLoading && <Badge variant="secondary">Loading...</Badge>}
            {hasError && <Badge variant="destructive">Error</Badge>}
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Mode Toggles */}
            <div className="flex items-center border rounded-md p-1">
              {Object.entries(viewModes).map(([mode, config]) => {
                const Icon = config.icon;
                return (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode(mode as any)}
                    className="h-7 w-7 p-0"
                  >
                    <Icon className="h-3 w-3" />
                  </Button>
                );
              })}
            </div>
            
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-3 w-3 mr-2" />
              Refresh
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleOpenInNewTab}>
              <ExternalLink className="h-3 w-3 mr-2" />
              Open
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-gray-100 dark:bg-gray-900 min-h-[600px] flex items-center justify-center">
        {hasError ? (
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <div>
              <h3 className="font-semibold text-destructive">Preview Error</h3>
              <p className="text-sm text-muted-foreground">
                There was an error rendering the preview. Check the code for syntax issues.
              </p>
            </div>
            <Button onClick={handleRefresh}>Try Again</Button>
          </div>
        ) : (
          <div 
            className="bg-white rounded-lg shadow-lg overflow-hidden border transition-all duration-200"
            style={{ 
              width: viewModes[viewMode].width, 
              maxWidth: '100%',
              height: viewModes[viewMode].height 
            }}
          >
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
              title="Live Preview"
            />
          </div>
        )}
      </div>
    </Card>
  );
}