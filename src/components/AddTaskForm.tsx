import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface AddTaskFormProps {
  onTaskAdded: () => void;
}

export const AddTaskForm = ({ onTaskAdded }: AddTaskFormProps) => {
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast.error("Por favor, digite uma descrição para a tarefa");
      return;
    }

    if (!user) {
      toast.error("Você precisa estar logado para adicionar tarefas");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase
      .from("tarefas")
      .insert([{ 
        descricao: description.trim(), 
        status: "pendente",
        user_id: user.id 
      }]);

    setIsLoading(false);

    if (error) {
      toast.error("Erro ao adicionar tarefa");
      return;
    }

    toast.success("Tarefa adicionada com sucesso!");
    setDescription("");
    onTaskAdded();
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <Input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Digite sua nova tarefa..."
        className="flex-1 font-inter border-input focus-visible:ring-primary"
        disabled={isLoading}
      />
      <Button
        type="submit"
        disabled={isLoading}
        className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 font-inter font-medium"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar
      </Button>
    </form>
  );
};
