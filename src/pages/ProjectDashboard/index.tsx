// src/pages/ProjectDashboard/index.tsx
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PageLayout from '@/components/layout/PageLayout';
import { useBusinessMode } from '@/contexts/BusinessModeContext';
import { 
  ArrowLeft,
  Calendar,
  User,
  Users,
  CheckSquare,
  Plus,
  Edit,
  Trash2,
  Clock,
  Tag,
  FileText,
  MessageSquare,
  Paperclip,
  TrendingUp,
  AlertCircle,
  Lock,
  Crown
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProjectDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('id') || '1';
  const { mode } = useBusinessMode();
  const baseURL = import.meta.env.BASE_URL;
  
  const isFreemium = mode === 'freemium';
  
  const [activeTab, setActiveTab] = useState<'tasks' | 'files' | 'team' | 'activity'>('tasks');
  const [addTaskDialog, setAddTaskDialog] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');

  // Mock project data
  const projectsData: any = {
    '1': {
      id: 1,
      name: 'E-commerce Website',
      description: 'Building a full-featured e-commerce platform with product catalog, shopping cart, and payment integration.',
      status: 'In Progress',
      priority: 'High',
      owner: 'John Doe',
      deadline: '2025-11-15',
      progress: 67,
      tags: ['Frontend', 'Backend', 'Payment'],
      team: [
        { name: 'John Doe', role: 'Project Lead', avatar: 'JD' },
        { name: 'Jane Smith', role: 'Frontend Dev', avatar: 'JS' },
        { name: 'Mike Johnson', role: 'Backend Dev', avatar: 'MJ' },
        { name: 'Sarah Williams', role: 'UI/UX Designer', avatar: 'SW' },
      ],
    },
    '2': {
      id: 2,
      name: 'Mobile App Development',
      description: 'Native mobile application for iOS and Android with offline capabilities.',
      status: 'Planning',
      priority: 'Medium',
      owner: 'Jane Smith',
      deadline: '2025-12-01',
      progress: 15,
      tags: ['Mobile', 'iOS', 'Android'],
      team: [
        { name: 'Jane Smith', role: 'Project Lead', avatar: 'JS' },
        { name: 'Tom Brown', role: 'iOS Dev', avatar: 'TB' },
        { name: 'Lisa Davis', role: 'Android Dev', avatar: 'LD' },
      ],
    },
    '3': {
      id: 3,
      name: 'AI Chatbot Integration',
      description: 'Integrate GPT-4 powered chatbot for customer support.',
      status: 'In Progress',
      priority: 'High',
      owner: 'Mike Johnson',
      deadline: '2025-11-10',
      progress: 75,
      tags: ['AI', 'NLP', 'Integration'],
      team: [
        { name: 'Mike Johnson', role: 'Project Lead', avatar: 'MJ' },
        { name: 'Emily White', role: 'AI Engineer', avatar: 'EW' },
      ],
    },
  };

  const project = projectsData[projectId] || projectsData['1'];

  const [tasks, setTasks] = useState([
    { id: 1, title: 'Design homepage layout', status: 'completed', priority: 'High', assignee: 'Jane Smith', dueDate: '2025-10-25' },
    { id: 2, title: 'Setup payment gateway', status: 'completed', priority: 'High', assignee: 'Mike Johnson', dueDate: '2025-10-26' },
    { id: 3, title: 'Build product catalog', status: 'in-progress', priority: 'High', assignee: 'John Doe', dueDate: '2025-10-30' },
    { id: 4, title: 'Create shopping cart UI', status: 'in-progress', priority: 'Medium', assignee: 'Jane Smith', dueDate: '2025-11-01' },
    { id: 5, title: 'Implement user authentication', status: 'todo', priority: 'High', assignee: 'Mike Johnson', dueDate: '2025-11-05' },
    { id: 6, title: 'Add product search', status: 'todo', priority: 'Medium', assignee: 'John Doe', dueDate: '2025-11-08' },
    { id: 7, title: 'Setup email notifications', status: 'todo', priority: 'Low', assignee: 'Sarah Williams', dueDate: '2025-11-10' },
    { id: 8, title: 'Write API documentation', status: 'todo', priority: 'Low', assignee: 'Mike Johnson', dueDate: '2025-11-12' },
  ]);

  const [files] = useState([
    { id: 1, name: 'Design_Mockups_v2.fig', size: '24 MB', uploadedBy: 'Sarah Williams', uploadedAt: '2 days ago' },
    { id: 2, name: 'API_Documentation.pdf', size: '3.5 MB', uploadedBy: 'Mike Johnson', uploadedAt: '1 week ago' },
    { id: 3, name: 'Project_Requirements.docx', size: '1.2 MB', uploadedBy: 'John Doe', uploadedAt: '2 weeks ago' },
  ]);

  const [activities] = useState([
    { id: 1, user: 'John Doe', action: 'completed task', detail: '"Setup payment gateway"', time: '2 hours ago' },
    { id: 2, user: 'Jane Smith', action: 'uploaded file', detail: '"Design_Mockups_v2.fig"', time: '2 days ago' },
    { id: 3, user: 'Mike Johnson', action: 'commented on', detail: '"Build product catalog"', time: '3 days ago' },
    { id: 4, user: 'Sarah Williams', action: 'created task', detail: '"Setup email notifications"', time: '1 week ago' },
  ]);

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      const newTask = {
        id: tasks.length + 1,
        title: newTaskTitle,
        status: 'todo',
        priority: newTaskPriority,
        assignee: newTaskAssignee || 'Unassigned',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskPriority('Medium');
      setNewTaskAssignee('');
      setAddTaskDialog(false);
    }
  };

  const handleToggleTask = (taskId: number) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status: task.status === 'completed' ? 'todo' : 'completed'
        };
      }
      return task;
    }));
  };

  const handleDeleteTask = (taskId: number) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'todo': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 border-red-300';
      case 'Medium': return 'text-yellow-600 border-yellow-300';
      case 'Low': return 'text-green-600 border-green-300';
      default: return 'text-gray-600 border-gray-300';
    }
  };

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>

          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{project.name}</h1>
              <p className="text-muted-foreground">{project.description}</p>
            </div>
            <div className="flex gap-2">
              <Badge className={project.status === 'In Progress' ? 'bg-blue-500' : 'bg-yellow-500'}>
                {project.status}
              </Badge>
              <Badge className={getPriorityColor(project.priority)} variant="outline">
                {project.priority} Priority
              </Badge>
              {isFreemium && (
                <Badge className="bg-orange-500">
                  <Lock className="h-3 w-3 mr-1" />
                  Freemium
                </Badge>
              )}
            </div>
          </div>

          {/* Freemium Limitation Warning */}
          {isFreemium && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <Card className="border-2 border-orange-400 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Lock className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-semibold text-orange-900 dark:text-orange-400">
                          Limited Features in Freemium Plan
                        </p>
                        <p className="text-sm text-orange-700 dark:text-orange-500">
                          Tasks limited to 50 • No file uploads • Basic analytics only
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => navigate(`${baseURL}subscription-plans`)}
                      className="bg-gradient-to-r from-orange-600 to-red-600"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to Subscription
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Project Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <p className="text-2xl font-bold">{project.progress}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tasks</p>
                    <p className="text-2xl font-bold">{completedTasks}/{totalTasks}</p>
                  </div>
                  <CheckSquare className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Team</p>
                    <p className="text-2xl font-bold">{project.team.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Deadline</p>
                    <p className="text-lg font-bold">{project.deadline}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b pb-2">
            <Button
              variant={activeTab === 'tasks' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('tasks')}
              className={activeTab === 'tasks' ? 'bg-purple-600' : ''}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Tasks ({totalTasks})
            </Button>
            <Button
              variant={activeTab === 'files' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('files')}
              className={activeTab === 'files' ? 'bg-purple-600' : ''}
            >
              <Paperclip className="h-4 w-4 mr-2" />
              Files ({files.length})
            </Button>
            <Button
              variant={activeTab === 'team' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('team')}
              className={activeTab === 'team' ? 'bg-purple-600' : ''}
            >
              <Users className="h-4 w-4 mr-2" />
              Team ({project.team.length})
            </Button>
            <Button
              variant={activeTab === 'activity' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('activity')}
              className={activeTab === 'activity' ? 'bg-purple-600' : ''}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Activity
            </Button>
          </div>
        </div>

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Tasks</h2>
              <Button 
                className="bg-purple-600" 
                onClick={() => {
                  if (isFreemium && tasks.length >= 50) {
                    alert('Task limit reached (50/50)\n\nUpgrade to Subscription for unlimited tasks!');
                    return;
                  }
                  setAddTaskDialog(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task {isFreemium && `(${tasks.length}/50)`}
              </Button>
            </div>

            <div className="space-y-2">
              {tasks.map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-all">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={task.status === 'completed'}
                        onChange={() => handleToggleTask(task.id)}
                        className="mt-1 h-5 w-5 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`font-semibold ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {task.assignee}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {task.dueDate}
                              </span>
                              <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                              <Badge className={getStatusColor(task.status)}>
                                {task.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {isFreemium ? (
              <Card className="border-2 border-orange-300">
                <CardContent className="py-12 text-center">
                  <Lock className="h-16 w-16 mx-auto mb-4 text-orange-500" />
                  <h3 className="text-2xl font-bold mb-2">File Uploads - Premium Feature</h3>
                  <p className="text-muted-foreground mb-6">
                    Upgrade to Subscription to upload and manage project files
                  </p>
                  <Button 
                    onClick={() => navigate(`${baseURL}subscription-plans`)}
                    className="bg-gradient-to-r from-orange-600 to-red-600"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade Now
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Files</h2>
                  <Button className="bg-purple-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </div>

                <div className="space-y-2">
                  {files.map((file) => (
                    <Card key={file.id}>
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Paperclip className="h-5 w-5 text-purple-500" />
                            <div>
                              <p className="font-semibold">{file.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {file.size} • Uploaded by {file.uploadedBy} • {file.uploadedAt}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">Download</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold mb-4">Team Members</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {project.team.map((member: any, idx: number) => (
                <Card key={idx}>
                  <CardContent className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{member.avatar}</div>
                      <div>
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-2">
              {activities.map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="py-4">
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p>
                          <span className="font-semibold">{activity.user}</span>
                          {' '}{activity.action}{' '}
                          <span className="font-semibold">{activity.detail}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Add Task Dialog */}
        <Dialog open={addTaskDialog} onOpenChange={setAddTaskDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Create a new task for {project.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Task Title *</Label>
                <Input
                  placeholder="e.g., Setup database schema"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <textarea
                  className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                  placeholder="Task details..."
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <select 
                    className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Assign to</Label>
                  <select 
                    className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {project.team.map((member: any, idx: number) => (
                      <option key={idx} value={member.name}>{member.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAddTaskDialog(false)}>
                Cancel
              </Button>
              <Button className="bg-purple-600" onClick={handleAddTask}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}
