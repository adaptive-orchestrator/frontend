// src/pages/FreemiumDashboard/index.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import PageLayout from '@/components/layout/PageLayout';
import { 
  AlertCircle, 
  Lock, 
  Database, 
  Users, 
  Sparkles, 
  TrendingUp, 
  FileText, 
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Plus,
  Play,
  Settings,
  CheckSquare,
  FolderOpen,
  Calendar,
  User,
  Tag,
  Trash2,
  Save
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function FreemiumDashboard() {
  const navigate = useNavigate();
  const baseURL = import.meta.env.BASE_URL;

  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'tasks'>('overview');
  
  // Dialog states
  const [openProjectDialog, setOpenProjectDialog] = useState(false);
  const [settingsProjectDialog, setSettingsProjectDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [addTaskDialog, setAddTaskDialog] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskProject, setNewTaskProject] = useState('');

  const [usage] = useState({
    storage: { used: 1.8, total: 2, unit: 'GB' },
    projects: { used: 3, total: 3 },
    tasks: { used: 45, total: 50 },
  });

  // Free tier projects (limited to 3)
  const [projects] = useState([
    { 
      id: 1, 
      name: 'Personal Website', 
      status: 'Active', 
      tasks: 8, 
      completed: 5,
      description: 'Building my personal portfolio website with React',
      priority: 'High',
      owner: 'You',
      tags: ['React', 'Portfolio'],
      deadline: '2025-11-20',
      recentActivity: [
        { action: 'Task completed', detail: 'Homepage design', time: '1 hour ago' },
        { action: 'File uploaded', detail: 'Profile picture', time: '3 hours ago' },
      ]
    },
    { 
      id: 2, 
      name: 'Portfolio Site', 
      status: 'Active', 
      tasks: 5, 
      completed: 3,
      description: 'Showcase my design work and projects',
      priority: 'Medium',
      owner: 'You',
      tags: ['Design', 'Showcase'],
      deadline: '2025-12-01',
      recentActivity: [
        { action: 'Task updated', detail: 'Gallery layout', time: '2 days ago' },
      ]
    },
    { 
      id: 3, 
      name: 'Blog Platform', 
      status: 'Active', 
      tasks: 7, 
      completed: 4,
      description: 'Simple blog to share my thoughts',
      priority: 'Low',
      owner: 'You',
      tags: ['Blog', 'Writing'],
      deadline: '2025-12-15',
      recentActivity: [
        { action: 'Task created', detail: 'Write first post', time: '1 week ago' },
      ]
    },
  ]);

  // Free tier tasks (limited to 50)
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Design homepage', project: 'Personal Website', completed: true },
    { id: 2, title: 'Setup database', project: 'Personal Website', completed: true },
    { id: 3, title: 'Create contact form', project: 'Portfolio Site', completed: false },
    { id: 4, title: 'Write blog posts', project: 'Blog Platform', completed: false },
    { id: 5, title: 'Add SEO optimization', project: 'Blog Platform', completed: false },
  ]);

  const lockedFeatures = [
    {
      icon: Sparkles,
      name: 'AI Assistant (GPT-4)',
      description: 'Code generation, content writing, data analysis',
      price: 19.99,
      type: 'MONTHLY',
    },
    {
      icon: Database,
      name: 'Extra Storage 50GB',
      description: 'Tăng từ 2GB lên 50GB',
      price: 9.99,
      type: 'MONTHLY',
    },
    {
      icon: Users,
      name: 'Team Collaboration',
      description: 'Thêm team members, real-time chat',
      price: 14.99,
      type: 'MONTHLY',
    },
    {
      icon: TrendingUp,
      name: 'Advanced Analytics',
      description: 'Reports, insights, performance tracking',
      price: 12.99,
      type: 'MONTHLY',
    },
    {
      icon: FileText,
      name: 'Unlimited Projects',
      description: 'Không giới hạn số lượng projects',
      price: 9.99,
      type: 'MONTHLY',
    },
    {
      icon: MessageSquare,
      name: 'Priority Support',
      description: '24/7 support với response time < 2h',
      price: 29.99,
      type: 'MONTHLY',
    },
  ];

  const handleUpgrade = (featureName: string) => {
    alert(`Upgrading to: ${featureName}\n\nBạn sẽ được chuyển đến trang thanh toán...`);
  };

  const handleCreateProject = () => {
    alert('⚠️ Bạn đã đạt giới hạn 3 projects!\n\nNâng cấp lên "Unlimited Projects" để tạo thêm.');
  };

  const handleCreateTask = () => {
    if (usage.tasks.used >= usage.tasks.total) {
      alert('⚠️ Bạn đã đạt giới hạn 50 tasks!\n\nNâng cấp lên Professional Plan để có unlimited tasks.');
    } else {
      setAddTaskDialog(true);
    }
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim() && newTaskProject) {
      const newTask = {
        id: tasks.length + 1,
        title: newTaskTitle,
        project: newTaskProject,
        completed: false,
      };
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
      setNewTaskProject('');
      setAddTaskDialog(false);
    }
  };

  const handleToggleTask = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleOpenProject = (project: any) => {
    // Navigate to Project Dashboard
    navigate(`${baseURL}project-dashboard?id=${project.id}`);
  };

  const handleSettingsProject = (project: any) => {
    setSelectedProject(project);
    setSettingsProjectDialog(true);
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Free Plan Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Đang sử dụng Free Plan - Nâng cấp để mở khóa thêm tính năng
              </p>
            </div>
            <Badge className="bg-green-500 text-white text-lg px-4 py-2">
              ✓ FREE
            </Badge>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 flex-wrap border-b pb-2">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('overview')}
              className={activeTab === 'overview' ? 'bg-green-600' : ''}
            >
              📊 Overview
            </Button>
            <Button
              variant={activeTab === 'projects' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('projects')}
              className={activeTab === 'projects' ? 'bg-green-600' : ''}
            >
              📁 My Projects (3/3)
            </Button>
            <Button
              variant={activeTab === 'tasks' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('tasks')}
              className={activeTab === 'tasks' ? 'bg-green-600' : ''}
            >
              ✓ Tasks ({usage.tasks.used}/{usage.tasks.total})
            </Button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Warning Cards */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <Card className="border-2 border-red-300 bg-red-50 dark:bg-red-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    Storage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-600">{usage.storage.used}GB</p>
                  <p className="text-sm text-muted-foreground">of {usage.storage.total}GB</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(usage.storage.used / usage.storage.total) * 100}%` }}></div>
                  </div>
                  <p className="text-xs text-red-600 font-semibold mt-2">⚠️ Sắp đầy! (90%)</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-300 bg-orange-50 dark:bg-orange-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-orange-600">{usage.projects.used}</p>
                  <p className="text-sm text-muted-foreground">of {usage.projects.total} projects</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${(usage.projects.used / usage.projects.total) * 100}%` }}></div>
                  </div>
                  <p className="text-xs text-orange-600 font-semibold mt-2">⚠️ Đã dùng hết (100%)</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-yellow-600">{usage.tasks.used}</p>
                  <p className="text-sm text-muted-foreground">of {usage.tasks.total} tasks</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(usage.tasks.used / usage.tasks.total) * 100}%` }}></div>
                  </div>
                  <p className="text-xs text-yellow-600 font-semibold mt-2">⚠️ Sắp đầy! (90%)</p>
                </CardContent>
              </Card>
            </div>

            {/* Unlock Features */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">🔓 Unlock Premium Features</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {lockedFeatures.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="border-2 border-gray-300 hover:border-blue-400 transition-all h-full">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <feature.icon className="h-8 w-8 text-blue-500" />
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <CardTitle className="text-lg">{feature.name}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-3">
                          <p className="text-2xl font-bold text-blue-600">
                            ${feature.price}
                            <span className="text-sm text-muted-foreground">/month</span>
                          </p>
                        </div>
                        <Button 
                          className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                          onClick={() => handleUpgrade(feature.name)}
                        >
                          Mua ngay
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Comparison Section */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="text-center text-2xl">💡 Nâng cấp lên Subscription Plan?</CardTitle>
                <CardDescription className="text-center">
                  Nhận TẤT CẢ tính năng với giá ưu đãi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-lg mb-3">Freemium (Hiện tại)</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span>2GB Storage</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span>3 Projects</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span>50 Tasks/month</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lock className="h-5 w-5 text-gray-400 mt-0.5" />
                        <span className="text-muted-foreground line-through">AI Assistant</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lock className="h-5 w-5 text-gray-400 mt-0.5" />
                        <span className="text-muted-foreground line-through">Team Collaboration</span>
                      </li>
                    </ul>
                    <p className="mt-4 font-bold text-lg">Tổng nếu mua riêng: ~$97.94/month</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-purple-300">
                    <h3 className="font-bold text-lg mb-3 text-purple-600">Professional Plan</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span>100GB Storage</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span>Unlimited Projects</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span>Unlimited Tasks</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span>AI Assistant (1000 credits)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span>Team Collaboration (10 members)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span>Advanced Analytics</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span>Priority Support</span>
                      </li>
                    </ul>
                    <p className="mt-4 font-bold text-2xl text-purple-600">
                      Chỉ $49.99/month
                    </p>
                    <Button 
                      className="w-full mt-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      onClick={() => navigate(`${baseURL}subscription-plans`)}
                    >
                      Chuyển sang Subscription
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold">📁 My Projects</h2>
                <p className="text-sm text-muted-foreground">
                  Bạn đã sử dụng {usage.projects.used}/{usage.projects.total} projects
                </p>
              </div>
              <Button 
                className="bg-green-600" 
                onClick={handleCreateProject}
                disabled={usage.projects.used >= usage.projects.total}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>

            {/* Limit Warning */}
            <Card className="border-2 border-orange-300 bg-orange-50 dark:bg-orange-950/20 mb-4">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-semibold">⚠️ Đã đạt giới hạn projects</p>
                    <p className="text-sm text-muted-foreground">
                      Mua add-on "Unlimited Projects" ($9.99/month) hoặc nâng cấp lên Professional Plan
                    </p>
                    <Button 
                      size="sm" 
                      className="mt-2 bg-orange-600"
                      onClick={() => handleUpgrade('Unlimited Projects')}
                    >
                      Mở khóa thêm projects
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-all">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{project.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CheckSquare className="h-4 w-4" />
                            {project.completed}/{project.tasks} tasks
                          </span>
                        </div>
                      </div>
                      <Badge className="bg-green-500">
                        {project.status}
                      </Badge>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{Math.round((project.completed / project.tasks) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(project.completed / project.tasks) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" onClick={() => handleOpenProject(project)}>
                        <Play className="h-4 w-4 mr-1" />
                        Open
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleSettingsProject(project)}>
                        <Settings className="h-4 w-4 mr-1" />
                        Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold">✓ My Tasks</h2>
                <p className="text-sm text-muted-foreground">
                  Bạn đã sử dụng {usage.tasks.used}/{usage.tasks.total} tasks
                </p>
              </div>
              <Button 
                className="bg-green-600" 
                onClick={handleCreateTask}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>

            {/* Limit Warning */}
            <Card className="border-2 border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20 mb-4">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-semibold">⚠️ Sắp đạt giới hạn tasks ({usage.tasks.used}/{usage.tasks.total})</p>
                    <p className="text-sm text-muted-foreground">
                      Nâng cấp lên Professional Plan để có unlimited tasks
                    </p>
                    <Button 
                      size="sm" 
                      className="mt-2 bg-yellow-600"
                      onClick={() => navigate(`${baseURL}subscription-plans`)}
                    >
                      Nâng cấp ngay
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="flex items-start gap-3 p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      <input 
                        type="checkbox" 
                        checked={task.completed}
                        onChange={() => handleToggleTask(task.id)}
                        className="mt-1 cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className={`font-semibold ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {task.project}
                        </p>
                      </div>
                      {task.completed && (
                        <Badge className="bg-green-500">✓ Done</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Add Task Dialog */}
        <Dialog open={addTaskDialog} onOpenChange={setAddTaskDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Create a new task (Free Plan: {usage.tasks.used}/{usage.tasks.total} tasks used)
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Task Title *</Label>
                <Input
                  placeholder="e.g., Update contact page"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Project *</Label>
                <select 
                  className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
                  value={newTaskProject}
                  onChange={(e) => setNewTaskProject(e.target.value)}
                >
                  <option value="">Select a project...</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.name}>{project.name}</option>
                  ))}
                </select>
              </div>

              {usage.tasks.used >= usage.tasks.total * 0.9 && (
                <Card className="border-2 border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm">⚠️ Approaching task limit</p>
                        <p className="text-xs text-muted-foreground">
                          Upgrade to Professional Plan for unlimited tasks
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAddTaskDialog(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-green-600" 
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim() || !newTaskProject}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Project Details Dialog */}
        <Dialog open={openProjectDialog} onOpenChange={setOpenProjectDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <FolderOpen className="h-6 w-6 text-green-600" />
                {selectedProject?.name}
              </DialogTitle>
              <DialogDescription>
                {selectedProject?.description}
              </DialogDescription>
            </DialogHeader>
            
            {selectedProject && (
              <div className="space-y-4 py-4">
                {/* Project Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Owner</p>
                      <p className="font-semibold">{selectedProject.owner}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Deadline</p>
                      <p className="font-semibold">{selectedProject.deadline}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Progress</p>
                      <p className="font-semibold">{selectedProject.completed}/{selectedProject.tasks} tasks</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{selectedProject.priority} Priority</Badge>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedProject.tags?.map((tag: string, idx: number) => (
                      <Badge key={idx} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold">Overall Progress</span>
                    <span>{Math.round((selectedProject.completed / selectedProject.tasks) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-green-600 h-3 rounded-full transition-all" 
                      style={{ width: `${(selectedProject.completed / selectedProject.tasks) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <p className="text-sm font-semibold mb-2">Recent Activity</p>
                  <div className="space-y-2">
                    {selectedProject.recentActivity?.map((activity: any, idx: number) => (
                      <div key={idx} className="flex gap-3 p-2 bg-gray-50 dark:bg-gray-900 rounded">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">{activity.detail}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Free Plan Limitation */}
                <Card className="border-2 border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Lock className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">🔒 Project Dashboard - Premium Feature</p>
                        <p className="text-sm text-muted-foreground">
                          Nâng cấp lên Professional Plan để mở project workspace với: Task management, File sharing, Team collaboration, Time tracking
                        </p>
                        <Button 
                          size="sm" 
                          className="mt-2 bg-gradient-to-r from-green-500 to-blue-500"
                          onClick={() => {
                            setOpenProjectDialog(false);
                            navigate(`${baseURL}subscription-plans`);
                          }}
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Upgrade to Open Project
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setOpenProjectDialog(false)}
                className="w-full"
              >
                Close (View Only)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Project Settings Dialog */}
        <Dialog open={settingsProjectDialog} onOpenChange={setSettingsProjectDialog}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-green-600" />
                Project Settings
              </DialogTitle>
              <DialogDescription>
                Manage your project settings (Free Plan - Basic features only)
              </DialogDescription>
            </DialogHeader>
            
            {selectedProject && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input defaultValue={selectedProject.name} />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <textarea 
                    className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                    defaultValue={selectedProject.description}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <select className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background">
                      <option value="Active" selected={selectedProject.status === 'Active'}>Active</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <select className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background">
                      <option value="Low" selected={selectedProject.priority === 'Low'}>Low</option>
                      <option value="Medium" selected={selectedProject.priority === 'Medium'}>Medium</option>
                      <option value="High" selected={selectedProject.priority === 'High'}>High</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Deadline</Label>
                  <Input type="date" defaultValue={selectedProject.deadline} />
                </div>

                {/* Locked Advanced Settings */}
                <Card className="border-2 border-gray-300 bg-gray-50 dark:bg-gray-900">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold flex items-center gap-2">
                        <Lock className="h-4 w-4 text-gray-400" />
                        Advanced Settings
                      </p>
                      <Badge variant="outline">Premium</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Team assignment, Custom fields, Automation rules
                    </p>
                    <Button 
                      size="sm" 
                      className="w-full bg-gradient-to-r from-green-500 to-blue-500"
                      onClick={() => navigate(`${baseURL}subscription-plans`)}
                    >
                      Unlock with Premium
                    </Button>
                  </CardContent>
                </Card>

                <div className="pt-4 border-t">
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Project
                  </Button>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setSettingsProjectDialog(false)}>
                Cancel
              </Button>
              <Button className="bg-green-600" onClick={() => {
                alert('Settings saved successfully!');
                setSettingsProjectDialog(false);
              }}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}
