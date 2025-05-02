-- Script para añadir la columna api_version a la tabla agent_settings si no existe

-- Verificar si la columna api_version ya existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'agent_settings'
        AND column_name = 'api_version'
    ) THEN
        -- Añadir la columna api_version
        ALTER TABLE public.agent_settings ADD COLUMN api_version text DEFAULT 'Latest';
        
        -- Actualizar los registros existentes
        UPDATE public.agent_settings SET api_version = 'Latest' WHERE api_version IS NULL;
        
        RAISE NOTICE 'Columna api_version añadida correctamente.';
    ELSE
        RAISE NOTICE 'La columna api_version ya existe.';
    END IF;
END $$;

-- Verificar si hay otras columnas faltantes
DO $$
DECLARE
    required_columns text[] := ARRAY[
        'id', 'agent_type', 'assistant_id', 'system_instructions', 'model',
        'file_search', 'code_interpreter', 'functions_enabled', 'response_format',
        'temperature', 'top_p', 'function_definitions', 'api_version',
        'created_at', 'updated_at'
    ];
    col text;
    missing_columns text[] := '{}';
BEGIN
    FOREACH col IN ARRAY required_columns
    LOOP
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'agent_settings'
            AND column_name = col
        ) THEN
            missing_columns := array_append(missing_columns, col);
        END IF;
    END LOOP;
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE NOTICE 'Columnas faltantes: %', missing_columns;
        RAISE NOTICE 'Por favor, añade estas columnas manualmente.';
    ELSE
        RAISE NOTICE 'Todas las columnas requeridas están presentes.';
    END IF;
END $$;