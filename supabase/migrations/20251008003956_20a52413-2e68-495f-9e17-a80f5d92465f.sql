-- View para relatório de tarefas por usuário
CREATE OR REPLACE VIEW public.user_task_stats AS
SELECT 
  p.id as user_id,
  p.email,
  COUNT(t.id) as total_tarefas,
  COUNT(CASE WHEN t.status = 'concluída' THEN 1 END) as tarefas_concluidas,
  COUNT(CASE WHEN t.status = 'pendente' THEN 1 END) as tarefas_pendentes,
  CASE 
    WHEN COUNT(t.id) > 0 THEN 
      ROUND((COUNT(CASE WHEN t.status = 'concluída' THEN 1 END)::numeric / COUNT(t.id)::numeric) * 100, 2)
    ELSE 0
  END as percentual_concluido,
  MIN(t.created_at) as primeira_tarefa,
  MAX(t.updated_at) as ultima_atualizacao
FROM public.profiles p
LEFT JOIN public.tarefas t ON t.user_id = p.id
GROUP BY p.id, p.email;

-- Habilitar RLS na view
ALTER VIEW public.user_task_stats SET (security_invoker = true);

-- Função para obter estatísticas de um usuário específico
CREATE OR REPLACE FUNCTION public.get_user_task_report(target_user_id uuid DEFAULT NULL)
RETURNS TABLE (
  user_id uuid,
  email text,
  total_tarefas bigint,
  tarefas_concluidas bigint,
  tarefas_pendentes bigint,
  percentual_concluido numeric,
  primeira_tarefa timestamp with time zone,
  ultima_atualizacao timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    user_id,
    email,
    total_tarefas,
    tarefas_concluidas,
    tarefas_pendentes,
    percentual_concluido,
    primeira_tarefa,
    ultima_atualizacao
  FROM public.user_task_stats
  WHERE 
    CASE 
      WHEN target_user_id IS NULL THEN user_id = auth.uid()
      ELSE user_id = target_user_id AND auth.uid() = target_user_id
    END;
$$;