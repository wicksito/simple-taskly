import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AddTaskForm } from "@/components/AddTaskForm";
import { TaskCard } from "@/components/TaskCard";
import { CheckCircle2 } from "lucide-react";

interface Task {
  id: string;
  descricao: string;
  status: string;
  created_at: string;
}

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("tarefas")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTasks(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const pendingTasksCount = tasks.filter((task) => task.status === "pendente").length;

  return (
    <div className="min-h-screen bg-background font-inter">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-6">
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
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Add Task Form */}
        <div className="mb-8">
          <AddTaskForm onTaskAdded={fetchTasks} />
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-4 text-muted-foreground font-inter">
                Carregando tarefas...
              </p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-lg border border-border">
              <CheckCircle2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground font-poppins mb-2">
                Nenhuma tarefa ainda
              </h3>
              <p className="text-muted-foreground font-inter">
                Adicione sua primeira tarefa acima para começar!
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard key={task.id} task={task} onUpdate={fetchTasks} />
            ))
          )}
        </div>
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
