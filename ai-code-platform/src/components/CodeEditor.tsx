import { useEffect, useRef, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Copy, 
  Download, 
  FileCode2, 
  Play, 
  Settings, 
  Maximize2, 
  Minimize2,
  RotateCcw,
  Save,
  Zap
} from 'lucide-react';

interface FileTab {
  id: string;
  name: string;
  content: string;
  language: string;
  modified: boolean;
}

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  theme?: 'light' | 'vs-dark';
  language?: string;
  files?: FileTab[];
  activeFile?: string;
  onFileChange?: (fileId: string, content: string) => void;
  onFileSelect?: (fileId: string) => void;
  readOnly?: boolean;
}

export default function CodeEditor({ 
  code, 
  onChange, 
  theme = 'light', 
  language = 'typescript',
  files = [],
  activeFile,
  onFileChange,
  onFileSelect,
  readOnly = false
}: CodeEditorProps) {
  const editorRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [showSettings, setShowSettings] = useState(false);
  const [wordWrap, setWordWrap] = useState<'on' | 'off'>('on');

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Configure Monaco for React/TypeScript
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.Latest,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: 'React',
      allowJs: true,
      typeRoots: ['node_modules/@types'],
    });

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });
    
    // Add keyboard shortcuts
    editor.addAction({
      id: 'save-file',
      label: 'Save File',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => {
        const content = editor.getValue();
        if (activeFile && onFileChange) {
          onFileChange(activeFile, content);
        } else {
          onChange(content);
        }
      }
    });
    
    editor.addAction({
      id: 'format-code',
      label: 'Format Code',
      keybindings: [monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF],
      run: () => {
        editor.getAction('editor.action.formatDocument')?.run();
      }
    });
  };

  const handleCopy = () => {
    const currentCode = activeFile && files.length > 0 ? 
      files.find(f => f.id === activeFile)?.content || code : code;
    navigator.clipboard.writeText(currentCode);
  };

  const handleDownload = () => {
    const currentCode = activeFile && files.length > 0 ? 
      files.find(f => f.id === activeFile)?.content || code : code;
    const fileName = activeFile ? 
      files.find(f => f.id === activeFile)?.name || 'code.tsx' : 'generated-app.tsx';
    
    const blob = new Blob([currentCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleSave = () => {
    if (editorRef.current) {
      const content = editorRef.current.getValue();
      if (activeFile && onFileChange) {
        onFileChange(activeFile, content);
      } else {
        onChange(content);
      }
    }
  };
  
  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };
  
  const getCurrentCode = () => {
    if (activeFile && files.length > 0) {
      return files.find(f => f.id === activeFile)?.content || code;
    }
    return code;
  };
  
  const getCurrentLanguage = () => {
    if (activeFile && files.length > 0) {
      return files.find(f => f.id === activeFile)?.language || language;
    }
    return language;
  };

  return (
    <Card className={`overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      {/* File Tabs */}
      {files.length > 0 && (
        <div className="border-b border-border/50 bg-muted/20">
          <Tabs value={activeFile} onValueChange={onFileSelect}>
            <div className="flex items-center justify-between px-3 py-1">
              <TabsList className="h-8">
                {files.map(file => (
                  <TabsTrigger key={file.id} value={file.id} className="text-xs gap-1">
                    <FileCode2 className="h-3 w-3" />
                    {file.name}
                    {file.modified && <div className="w-1 h-1 bg-orange-500 rounded-full" />}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="text-xs">
                  {getCurrentLanguage()}
                </Badge>
              </div>
            </div>
          </Tabs>
        </div>
      )}
      
      {/* Toolbar */}
      <div className="border-b border-border/50 p-3 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode2 className="h-4 w-4" />
            <span className="text-sm font-medium">
              {files.length > 0 ? 
                files.find(f => f.id === activeFile)?.name || 'Code Editor' : 
                'Generated Code'
              }
            </span>
            {!readOnly && (
              <Badge variant="outline" className="text-xs">
                Editable
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {!readOnly && (
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="h-3 w-3 mr-2" />
                Save
              </Button>
            )}
            
            <Button variant="outline" size="sm" onClick={formatCode}>
              <Zap className="h-3 w-3 mr-2" />
              Format
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="h-3 w-3 mr-2" />
              Copy
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-3 w-3 mr-2" />
              Download
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-3 w-3" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? 
                <Minimize2 className="h-3 w-3" /> : 
                <Maximize2 className="h-3 w-3" />
              }
            </Button>
          </div>
        </div>
        
        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span>Font Size:</span>
                <Select value={fontSize.toString()} onValueChange={(v) => setFontSize(Number(v))}>
                  <SelectTrigger className="w-16 h-7">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 12, 14, 16, 18, 20].map(size => (
                      <SelectItem key={size} value={size.toString()}>{size}px</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <span>Word Wrap:</span>
                <Select value={wordWrap} onValueChange={(v: 'on' | 'off') => setWordWrap(v)}>
                  <SelectTrigger className="w-16 h-7">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on">On</SelectItem>
                    <SelectItem value="off">Off</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Editor */}
      <div className={isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-[600px]'}>
        <Editor
          height="100%"
          language={getCurrentLanguage()}
          theme={theme}
          value={getCurrentCode()}
          onChange={(value) => {
            if (activeFile && onFileChange) {
              onFileChange(activeFile, value || '');
            } else {
              onChange(value || '');
            }
          }}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: !isFullscreen },
            scrollBeyondLastLine: false,
            fontSize,
            lineHeight: 1.5,
            renderWhitespace: 'selection',
            automaticLayout: true,
            formatOnPaste: true,
            formatOnType: true,
            wordWrap,
            tabSize: 2,
            insertSpaces: true,
            readOnly,
            quickSuggestions: !readOnly,
            suggestOnTriggerCharacters: !readOnly,
          }}
        />
      </div>
    </Card>
  );
}