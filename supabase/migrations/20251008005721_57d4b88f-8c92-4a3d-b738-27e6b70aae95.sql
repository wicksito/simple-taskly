-- Corrigir a view user_task_stats para usar o status correto (sem acento)
DROP VIEW IF EXISTS public.user_task_stats;

CREATE OR REPLACE VIEW public.user_task_stats AS
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

-- Habilitar RLS na view
ALTER VIEW public.user_task_stats SET (security_invoker = true);