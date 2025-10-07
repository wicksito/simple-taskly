-- Criar tabela de tarefas
CREATE TABLE public.tarefas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  descricao TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'concluida')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;

-- Como não há autenticação, permitir acesso público total
CREATE POLICY "Permitir acesso público total"
ON public.tarefas
FOR ALL
USING (true)
WITH CHECK (true);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_tarefas_updated_at
BEFORE UPDATE ON public.tarefas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();