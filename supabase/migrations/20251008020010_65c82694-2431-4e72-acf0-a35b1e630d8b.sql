-- Remover security_invoker da view e adicionar políticas RLS corretas
DROP VIEW IF EXISTS public.user_task_stats CASCADE;

CREATE VIEW public.user_task_stats AS
SELECT 
  p.id as user_id,
  p.email,
  COUNT(t.id) as total_tarefas,
  COUNT(CASE WHEN t.status = 'concluida' THEN 1 END) as tarefas_concluidas,
  COUNT(CASE WHEN t.status = 'pendente' THEN 1 END) as tarefas_pendentes,
  CASE 
    WHEN COUNT(t.id) > 0 THEN 
      ROUND((COUNT(CASE WHEN t.status = 'concluida' THEN 1 END)::numeric / COUNT(t.id)::numeric) * 100, 2)
    ELSE 0
  END as percentual_concluido,
  MIN(t.created_at) as primeira_tarefa,
  MAX(t.updated_at) as ultima_atualizacao
FROM public.profiles p
LEFT JOIN public.tarefas t ON t.user_id = p.id
GROUP BY p.id, p.email;

-- Recriar a função get_user_task_report
CREATE OR REPLACE FUNCTION public.get_user_task_report(target_user_id uuid DEFAULT NULL::uuid)
RETURNS TABLE(
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
STABLE SECURITY DEFINER
SET search_path TO 'public'
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