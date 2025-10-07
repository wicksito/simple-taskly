import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TaskCardProps {
  task: {
    id: string;
    descricao: string;
    status: string;
    created_at: string;
  };
  onUpdate: () => void;
}

export const TaskCard = ({ task, onUpdate }: TaskCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(task.descricao);

  const handleComplete = async () => {
    const newStatus = task.status === "concluida" ? "pendente" : "concluida";
    
    const { error } = await supabase
      .from("tarefas")
      .update({ status: newStatus })
      .eq("id", task.id);

    if (error) {
      toast.error("Erro ao atualizar tarefa");
      return;
    }

    toast.success(newStatus === "concluida" ? "Tarefa concluída!" : "Tarefa reativada!");
    onUpdate();
  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from("tarefas")
      .delete()
      .eq("id", task.id);

    if (error) {
      toast.error("Erro ao excluir tarefa");
      return;
    }

    toast.success("Tarefa excluída!");
    onUpdate();
  };

  const handleSaveEdit = async () => {
    if (!editedDescription.trim()) {
      toast.error("A descrição não pode estar vazia");
      return;
    }

    const { error } = await supabase
      .from("tarefas")
      .update({ descricao: editedDescription.trim() })
      .eq("id", task.id);

    if (error) {
      toast.error("Erro ao atualizar tarefa");
      return;
    }

    toast.success("Tarefa atualizada!");
    setIsEditing(false);
    onUpdate();
  };

  const handleCancelEdit = () => {
    setEditedDescription(task.descricao);
    setIsEditing(false);
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-all duration-300 border-border bg-card animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleComplete}
          className="mt-1 shrink-0 hover:bg-success/20 hover:text-success-foreground transition-colors"
        >
          <Check
            className={`h-5 w-5 transition-all ${
              task.status === "concluida"
                ? "text-success scale-110"
                : "text-muted-foreground"
            }`}
          />
        </Button>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="font-inter"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveEdit}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Salvar
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  size="sm"
                  variant="ghost"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p
                className={`font-inter text-foreground mb-1 transition-all ${
                  task.status === "concluida"
                    ? "line-through text-muted-foreground"
                    : ""
                }`}
              >
                {task.descricao}
              </p>
              <p className="text-sm text-muted-foreground font-inter">
                {format(new Date(task.created_at), "dd/MM/yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
              </p>
            </>
          )}
        </div>

        {!isEditing && (
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
