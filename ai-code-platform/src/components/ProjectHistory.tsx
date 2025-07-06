import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  History, 
  FileCode2, 
  Trash2, 
  Clock, 
  Search, 
  Filter, 
  Star,
  Download,
  Edit3,
  Copy,
  ExternalLink,
  MoreVertical
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  code: string;
  createdAt: string;
  updatedAt?: string;
  tags?: string[];
  starred?: boolean;
  size?: number;
}

interface ProjectHistoryProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onDeleteProject?: (projectId: string) => void;
  onStarProject?: (projectId: string) => void;
  onRenameProject?: (projectId: string, newName: string) => void;
}

export default function ProjectHistory({ 
  projects, 
  onSelectProject, 
  onDeleteProject,
  onStarProject,
  onRenameProject 
}: ProjectHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStarred, setFilterStarred] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays}d ago`;
      } else {
        return date.toLocaleDateString();
      }
    }
  };

  const truncateDescription = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  const filteredProjects = projects.filter(project => {
    const matchesSearch = !searchTerm || 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = !filterStarred || project.starred;
    
    return matchesSearch && matchesFilter;
  });
  
  const handleRename = (projectId: string, currentName: string) => {
    setEditingProject(projectId);
    setNewProjectName(currentName);
  };
  
  const saveRename = () => {
    if (editingProject && newProjectName.trim() && onRenameProject) {
      onRenameProject(editingProject, newProjectName.trim());
    }
    setEditingProject(null);
    setNewProjectName('');
  };

  if (projects.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-3">
          <History className="h-8 w-8 text-muted-foreground mx-auto" />
          <h3 className="font-medium">No Projects Yet</h3>
          <p className="text-sm text-muted-foreground">
            Generated projects will appear here for easy access.
          </p>
        </div>
      </Card>
    );
  }
  
  if (filteredProjects.length === 0) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-4 w-4" />
          <h3 className="font-semibold">Project History</h3>
          <Badge variant="secondary" className="text-xs">
            {projects.length}
          </Badge>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 h-8 text-sm"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={filterStarred ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStarred(!filterStarred)}
              className="h-7"
            >
              <Star className="h-3 w-3 mr-1" />
              Starred
            </Button>
          </div>
        </div>
        
        <div className="text-center py-8 text-sm text-muted-foreground">
          No projects match your search criteria.
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <History className="h-4 w-4" />
        <h3 className="font-semibold">Project History</h3>
        <Badge variant="secondary" className="text-xs">
          {filteredProjects.length}/{projects.length}
        </Badge>
      </div>
      
      {/* Search and Filter */}
      <div className="space-y-3 mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-7 h-8 text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={filterStarred ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStarred(!filterStarred)}
            className="h-7"
          >
            <Star className="h-3 w-3 mr-1" />
            Starred
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group p-3 rounded-lg border border-border/50 hover:border-border transition-colors cursor-pointer"
              onClick={() => onSelectProject(project)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <FileCode2 className="h-3 w-3 text-primary" />
                    {project.starred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                    {editingProject === project.id ? (
                      <Input
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        onBlur={saveRename}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveRename();
                          if (e.key === 'Escape') {
                            setEditingProject(null);
                            setNewProjectName('');
                          }
                        }}
                        className="h-6 text-sm font-medium"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-sm font-medium truncate">
                        {project.name}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">
                    {truncateDescription(project.description)}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(project.createdAt)}</span>
                      </div>
                      {project.size && (
                        <div className="flex items-center gap-1">
                          <FileCode2 className="h-3 w-3" />
                          <span>{formatFileSize(project.size)}</span>
                        </div>
                      )}
                    </div>
                    
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex gap-1">
                        {project.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onStarProject) onStarProject(project.id);
                    }}
                  >
                    <Star className={`h-3 w-3 ${project.starred ? 'text-yellow-500 fill-current' : ''}`} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRename(project.id, project.name);
                    }}
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(project.code);
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Project</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{project.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => {
                            if (onDeleteProject) onDeleteProject(project.id);
                          }}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{projects.length} projects total</span>
          <span>{projects.filter(p => p.starred).length} starred</span>
        </div>
      </div>
    </Card>
  );
}