-- Script para añadir las columnas faltantes a la tabla agent_settings

-- Añadir columna system_instructions si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'agent_settings'
        AND column_name = 'system_instructions'
    ) THEN
        ALTER TABLE public.agent_settings ADD COLUMN system_instructions text;
        RAISE NOTICE 'Columna system_instructions añadida.';
    ELSE
        RAISE NOTICE 'La columna system_instructions ya existe.';
    END IF;
END $$;

-- Añadir columna assistant_id si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'agent_settings'
        AND column_name = 'assistant_id'
    ) THEN
        ALTER TABLE public.agent_settings ADD COLUMN assistant_id text;
        RAISE NOTICE 'Columna assistant_id añadida.';
    ELSE
        RAISE NOTICE 'La columna assistant_id ya existe.';
    END IF;
END $$;

-- Añadir columna model si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'agent_settings'
        AND column_name = 'model'
    ) THEN
        ALTER TABLE public.agent_settings ADD COLUMN model text;
        RAISE NOTICE 'Columna model añadida.';
    ELSE
        RAISE NOTICE 'La columna model ya existe.';
    END IF;
END $$;

-- Añadir columna file_search si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'agent_settings'
        AND column_name = 'file_search'
    ) THEN
        ALTER TABLE public.agent_settings ADD COLUMN file_search boolean DEFAULT false;
        RAISE NOTICE 'Columna file_search añadida.';
    ELSE
        RAISE NOTICE 'La columna file_search ya existe.';
    END IF;
END $$;

-- Añadir columna code_interpreter si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'agent_settings'
        AND column_name = 'code_interpreter'
    ) THEN
        ALTER TABLE public.agent_settings ADD COLUMN code_interpreter boolean DEFAULT false;
        RAISE NOTICE 'Columna code_interpreter añadida.';
    ELSE
        RAISE NOTICE 'La columna code_interpreter ya existe.';
    END IF;
END $$;

-- Añadir columna functions_enabled si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'agent_settings'
        AND column_name = 'functions_enabled'
    ) THEN
        ALTER TABLE public.agent_settings ADD COLUMN functions_enabled boolean DEFAULT false;
        RAISE NOTICE 'Columna functions_enabled añadida.';
    ELSE
        RAISE NOTICE 'La columna functions_enabled ya existe.';
    END IF;
END $$;

-- Añadir columna response_format si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'agent_settings'
        AND column_name = 'response_format'
    ) THEN
        ALTER TABLE public.agent_settings ADD COLUMN response_format text DEFAULT 'text';
        RAISE NOTICE 'Columna response_format añadida.';
    ELSE
        RAISE NOTICE 'La columna response_format ya existe.';
    END IF;
END $$;

-- Añadir columna temperature si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'agent_settings'
        AND column_name = 'temperature'
    ) THEN
        ALTER TABLE public.agent_settings ADD COLUMN temperature real DEFAULT 1.0;
        RAISE NOTICE 'Columna temperature añadida.';
    ELSE
        RAISE NOTICE 'La columna temperature ya existe.';
    END IF;
END $$;

-- Añadir columna top_p si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'agent_settings'
        AND column_name = 'top_p'
    ) THEN
        ALTER TABLE public.agent_settings ADD COLUMN top_p real DEFAULT 1.0;
        RAISE NOTICE 'Columna top_p añadida.';
    ELSE
        RAISE NOTICE 'La columna top_p ya existe.';
    END IF;
END $$;

-- Añadir columna function_definitions si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'agent_settings'
        AND column_name = 'function_definitions'
    ) THEN
        ALTER TABLE public.agent_settings ADD COLUMN function_definitions jsonb;
        RAISE NOTICE 'Columna function_definitions añadida.';
    ELSE
        RAISE NOTICE 'La columna function_definitions ya existe.';
    END IF;
END $$;

-- Añadir columna api_version si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'agent_settings'
        AND column_name = 'api_version'
    ) THEN
        ALTER TABLE public.agent_settings ADD COLUMN api_version text DEFAULT 'Latest';
        RAISE NOTICE 'Columna api_version añadida.';
    ELSE
        RAISE NOTICE 'La columna api_version ya existe.';
    END IF;
END $$;

-- Añadir columna created_at si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'agent_settings'
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.agent_settings ADD COLUMN created_at timestamp with time zone DEFAULT now();
        RAISE NOTICE 'Columna created_at añadida.';
    ELSE
        RAISE NOTICE 'La columna created_at ya existe.';
    END IF;
END $$;

-- Añadir columna updated_at si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'agent_settings'
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.agent_settings ADD COLUMN updated_at timestamp with time zone DEFAULT now();
        RAISE NOTICE 'Columna updated_at añadida.';
    ELSE
        RAISE NOTICE 'La columna updated_at ya existe.';
    END IF;
END $$;

-- Mostrar todas las columnas de la tabla agent_settings
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'agent_settings'
ORDER BY ordinal_position;