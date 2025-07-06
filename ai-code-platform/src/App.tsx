import React, { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  Play, 
  Code, 
  Eye, 
  Settings, 
  Moon, 
  Sun, 
  Monitor,
  Sparkles,
  Zap,
  Download,
  Upload,
  History,
  Star,
  Search,
  Filter,
  MoreHorizontal,
  Smartphone,
  TestTube,
  Plug,
  Wrench
} from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Custom Components
import CodeEditor from '@/components/CodeEditor'
import LivePreview from '@/components/LivePreview'
import ProjectHistory from '@/components/ProjectHistory'
import OllamaSettings from '@/components/OllamaSettings'
import DeploymentModal from '@/components/DeploymentModal'
import OllamaSetup from '@/components/OllamaSetup'
import MobileOptimizations from '@/components/MobileOptimizations'
import CustomIntegrations from '@/components/CustomIntegrations'
import PlatformTesting from '@/components/PlatformTesting'

// Hooks and Services
import { useTheme } from '@/hooks/useTheme'
import { aiService } from '@/services/aiService'
import { projectService } from '@/services/projectService'
import { deployService } from '@/services/deployService'

// Types and Utils
import type { Project, OllamaConfig, GenerationProgress, Framework } from '@/types'
import { isValidUrl, generateId, debounce } from '@/utils'

export default function App() {
  // Theme management
  const { theme, toggleTheme, isDark } = useTheme()

  // Core state
  const [input, setInput] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress | null>(null)
  const [streamingText, setStreamingText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  // Project management
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [selectedFramework, setSelectedFramework] = useState<Framework>('react')

  // UI state
  const [activeTab, setActiveTab] = useState('setup')
  const [showSettings, setShowSettings] = useState(false)
  const [showDeployment, setShowDeployment] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Ollama configuration
  const [ollamaConfig, setOllamaConfig] = useState<OllamaConfig>({
    endpoint: 'http://localhost:11434',
    model: 'codellama:7b',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 0.9,
    topK: 40,
    repeatPenalty: 1.1,
    stream: true,
    timeout: 120000,
    contextLength: 4096
  })

  // Load projects on mount
  useEffect(() => {
    const loadedProjects = projectService.getProjects()
    setProjects(loadedProjects)
  }, [])

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.trim()) {
        const filtered = projectService.searchProjects({ query }).items
        setProjects(filtered)
      } else {
        setProjects(projectService.getProjects())
      }
    }, 300),
    []
  )

  useEffect(() => {
    debouncedSearch(searchQuery)
  }, [searchQuery, debouncedSearch])

  // Handle code generation
  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error('Please enter a URL or description')
      return
    }

    setIsGenerating(true)
    setIsStreaming(true)
    setStreamingText('')
    setGenerationProgress(null)
    setActiveTab('editor')

    try {
      // Update AI service config
      aiService.updateConfig(ollamaConfig)

      // Generate code with streaming
      await aiService.generateCodeStreaming({
        input: input.trim(),
        model: ollamaConfig.model,
        temperature: ollamaConfig.temperature,
        maxTokens: ollamaConfig.maxTokens,
        framework: selectedFramework,
        features: [],
        constraints: [],
        onProgress: (progress) => {
          setGenerationProgress(progress)
        },
        onStream: (chunk) => {
          if (chunk.content) {
            setStreamingText(prev => prev + chunk.content)
          }
        }
      })

      // Create project from generated code
      const projectData: Partial<Project> = {
        name: `Generated App ${formatDate(new Date())}`,
        description: `Generated from: ${input.slice(0, 100)}...`,
        input: input.trim(),
        code: streamingText || generatedCode,
        framework: selectedFramework,
        language: selectedFramework === 'react' || selectedFramework === 'next' ? 'tsx' : 'javascript',
        generationTime: Date.now() - (generationProgress?.estimatedTimeRemaining || 0),
        tokenCount: Math.ceil((streamingText || generatedCode).length / 4),
        model: ollamaConfig.model,
        tags: [selectedFramework, 'ai-generated']
      }

      const savedProject = await projectService.saveProject(projectData)
      setCurrentProject(savedProject)
      setProjects([savedProject, ...projects])
      setGeneratedCode(streamingText || generatedCode)

      toast.success('Code generated successfully!')

    } catch (error) {
      console.error('Generation failed:', error)
      toast.error('Failed to generate code. Please check your Ollama connection.')
    } finally {
      setIsGenerating(false)
      setIsStreaming(false)
      setGenerationProgress(null)
    }
  }

  // Handle project actions
  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project)
    setGeneratedCode(project.code)
    setInput(project.input)
    setSelectedFramework(project.framework as Framework)
    setActiveTab('editor')
  }

  const handleProjectDelete = async (projectId: string) => {
    const success = projectService.deleteProject(projectId)
    if (success) {
      setProjects(prev => prev.filter(p => p.id !== projectId))
      if (currentProject?.id === projectId) {
        setCurrentProject(null)
        setGeneratedCode('')
      }
      toast.success('Project deleted')
    } else {
      toast.error('Failed to delete project')
    }
  }

  const handleProjectStar = (projectId: string) => {
    const success = projectService.toggleStarProject(projectId)
    if (success) {
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, starred: !p.starred } : p
      ))
      toast.success('Project updated')
    }
  }

  const handleProjectRename = (projectId: string, newName: string) => {
    const success = projectService.renameProject(projectId, newName)
    if (success) {
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, name: newName } : p
      ))
      if (currentProject?.id === projectId) {
        setCurrentProject(prev => prev ? { ...prev, name: newName } : null)
      }
      toast.success('Project renamed')
    }
  }

  const handleDownloadZip = async () => {
    if (!currentProject) {
      toast.error('No project to download')
      return
    }

    try {
      await projectService.exportProjectAsZip(currentProject.id)
      toast.success('Project downloaded!')
    } catch (error) {
      toast.error('Failed to download project')
    }
  }

  const handleDeploy = () => {
    if (!currentProject) {
      toast.error('No project to deploy')
      return
    }
    setShowDeployment(true)
  }

  // Helper function for date formatting
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold gradient-text">AI Code Platform</h1>
                <p className="text-xs text-muted-foreground">Local LLM-powered development</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Zap className="w-3 h-3 mr-1" />
                {ollamaConfig.model}
              </Badge>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="w-9 h-9 p-0"
              >
                {theme === 'light' ? (
                  <Sun className="w-4 h-4" />
                ) : theme === 'dark' ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Monitor className="w-4 h-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="w-9 h-9 p-0"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Input Section */}
            <Card className="p-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="input" className="text-sm font-medium">
                    URL or Description
                  </Label>
                  <Textarea
                    id="input"
                    placeholder="Enter a URL to clone or describe your app idea..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="mt-2 min-h-[100px] resize-none"
                  />
                </div>

                <div>
                  <Label htmlFor="framework" className="text-sm font-medium">
                    Framework
                  </Label>
                  <Select value={selectedFramework} onValueChange={(value) => setSelectedFramework(value as Framework)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="react">React</SelectItem>
                      <SelectItem value="next">Next.js</SelectItem>
                      <SelectItem value="vue">Vue.js</SelectItem>
                      <SelectItem value="svelte">Svelte</SelectItem>
                      <SelectItem value="angular">Angular</SelectItem>
                      <SelectItem value="vanilla">Vanilla JS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating || !input.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <div className="loading-dots">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                      </div>
                      Generating...
                    </div>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Generate App
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Generation Progress */}
            {generationProgress && (
              <Card className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Progress</Label>
                    <span className="text-sm text-muted-foreground">
                      {generationProgress.progress}%
                    </span>
                  </div>
                  <Progress value={generationProgress.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {generationProgress.message}
                  </p>
                  {generationProgress.tokensGenerated && (
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Tokens: {generationProgress.tokensGenerated}</span>
                      {generationProgress.tokensPerSecond && (
                        <span>{generationProgress.tokensPerSecond}/s</span>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Project Actions */}
            {currentProject && (
              <Card className="p-4">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Project Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={handleDownloadZip}>
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDeploy}>
                      <Upload className="w-3 h-3 mr-1" />
                      Deploy
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="setup" className="flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  <span className="hidden sm:inline">Setup</span>
                </TabsTrigger>
                <TabsTrigger value="editor" className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  <span className="hidden sm:inline">Editor</span>
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">Preview</span>
                </TabsTrigger>
                <TabsTrigger value="mobile" className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <span className="hidden sm:inline">Mobile</span>
                </TabsTrigger>
                <TabsTrigger value="testing" className="flex items-center gap-2">
                  <TestTube className="w-4 h-4" />
                  <span className="hidden sm:inline">Testing</span>
                </TabsTrigger>
                <TabsTrigger value="integrations" className="flex items-center gap-2">
                  <Plug className="w-4 h-4" />
                  <span className="hidden sm:inline">Integrations</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="setup" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <OllamaSetup 
                    config={ollamaConfig}
                    onConfigChange={setOllamaConfig}
                  />
                  <ProjectHistory
                    projects={projects}
                    onProjectSelect={handleProjectSelect}
                    onProjectDelete={handleProjectDelete}
                    onProjectStar={handleProjectStar}
                    onProjectRename={handleProjectRename}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                  />
                </div>
              </TabsContent>

              <TabsContent value="editor" className="space-y-6">
                {generatedCode || streamingText ? (
                  <CodeEditor
                    code={isStreaming ? streamingText : generatedCode}
                    language={selectedFramework === 'react' || selectedFramework === 'next' ? 'typescript' : 'javascript'}
                    onChange={setGeneratedCode}
                    project={currentProject}
                  />
                ) : (
                  <Card className="h-[600px] flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                        <Code className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Ready to Generate Your App</h3>
                        <p className="text-muted-foreground max-w-md">
                          Enter a URL or describe your app idea, select a framework, and click "Generate App" to get started.
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="preview" className="space-y-6">
                {generatedCode || streamingText ? (
                  <LivePreview
                    code={isStreaming ? streamingText : generatedCode}
                    framework={selectedFramework}
                  />
                ) : (
                  <Card className="h-[600px] flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                        <Eye className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Live Preview</h3>
                        <p className="text-muted-foreground">
                          Generate some code to see a live preview here.
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="mobile" className="space-y-6">
                <MobileOptimizations project={currentProject} />
              </TabsContent>

              <TabsContent value="testing" className="space-y-6">
                <PlatformTesting project={currentProject} />
              </TabsContent>

              <TabsContent value="integrations" className="space-y-6">
                <CustomIntegrations />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="absolute right-4 top-4 w-96 max-h-[80vh] overflow-auto">
            <OllamaSettings
              config={ollamaConfig}
              onConfigChange={setOllamaConfig}
              onClose={() => setShowSettings(false)}
            />
          </div>
        </div>
      )}

      {/* Deployment Modal */}
      {showDeployment && currentProject && (
        <DeploymentModal
          project={currentProject}
          isOpen={showDeployment}
          onClose={() => setShowDeployment(false)}
          onDeploy={(platform) => {
            // Handle deployment logic here
            toast.success(`Deploying to ${platform}...`)
            setShowDeployment(false)
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4" />
              <span>AI Code Platform - Generate apps with local LLMs</span>
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <span>Built with React + Vite + Tailwind</span>
              <span>•</span>
              <span>Powered by Ollama</span>
              <span>•</span>
              <span>Open Source</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Transform ideas into production-ready applications with the power of AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}