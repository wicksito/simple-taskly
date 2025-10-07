import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AddTaskForm } from "@/components/AddTaskForm";
import { TaskCard } from "@/components/TaskCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, CheckCheck, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Task {
  id: string;
  descricao: string;
  status: string;
  created_at: string;
}

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, signOut } = useAuth();

  const fetchTasks = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from("tarefas")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTasks(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Logout realizado com sucesso!");
  };

  const pendingTasksCount = tasks.filter((task) => task.status === "pendente").length;
  const completedTasksCount = tasks.filter((task) => task.status === "concluida").length;
  const pendingTasks = tasks.filter((task) => task.status === "pendente");
  const completedTasks = tasks.filter((task) => task.status === "concluida");

  const EmptyState = ({ message, icon: Icon }: { message: string; icon: any }) => (
    <div className="text-center py-12 bg-card rounded-lg border border-border">
      <Icon className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
      <p className="text-muted-foreground font-inter">{message}</p>
    </div>
  );

  const TasksList = ({ taskList }: { taskList: Task[] }) => (
    <div className="space-y-3">
      {taskList.map((task) => (
        <TaskCard key={task.id} task={task} onUpdate={fetchTasks} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-inter pb-24">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground font-poppins">
                  Taskly
                </h1>
                <p className="text-sm text-muted-foreground font-inter">
                  Organize suas tarefas em segundos
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="gap-2 hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-inter">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Add Task Form */}
        <div className="mb-8">
          <AddTaskForm onTaskAdded={fetchTasks} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pendentes" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="pendentes" className="font-inter gap-2">
              <Clock className="h-4 w-4" />
              Pendentes
              <span className="ml-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/20 text-primary">
                {pendingTasksCount}
              </span>
            </TabsTrigger>
            <TabsTrigger value="concluidas" className="font-inter gap-2">
              <CheckCheck className="h-4 w-4" />
              Concluídas
              <span className="ml-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-success/20 text-success-foreground">
                {completedTasksCount}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pendentes">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <p className="mt-4 text-muted-foreground font-inter">
                  Carregando tarefas...
                </p>
              </div>
            ) : pendingTasks.length === 0 ? (
              <EmptyState 
                message="Nenhuma tarefa pendente. Você está em dia!" 
                icon={Clock}
              />
            ) : (
              <TasksList taskList={pendingTasks} />
            )}
          </TabsContent>

          <TabsContent value="concluidas">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <p className="mt-4 text-muted-foreground font-inter">
                  Carregando tarefas...
                </p>
              </div>
            ) : completedTasks.length === 0 ? (
              <EmptyState 
                message="Nenhuma tarefa concluída ainda. Complete suas primeiras tarefas!" 
                icon={CheckCheck}
              />
            ) : (
              <TasksList taskList={completedTasks} />
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg">
        <div className="container mx-auto px-4 py-4 max-w-3xl">
          <div className="flex items-center justify-between">
            <p className="text-sm font-inter text-muted-foreground">
              Total de tarefas pendentes
            </p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary font-poppins">
                {pendingTasksCount}
              </span>
              <span className="text-sm text-muted-foreground font-inter">
                {pendingTasksCount === 1 ? "tarefa" : "tarefas"}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
