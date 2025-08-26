-- Create SQL executor function for financial analysis
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  -- Only allow SELECT queries for security
  IF NOT (TRIM(UPPER(sql_query)) LIKE 'SELECT%' OR TRIM(UPPER(sql_query)) LIKE 'WITH%') THEN
    RAISE EXCEPTION 'Only SELECT queries are allowed';
  END IF;
  
  -- Execute the query and return results as JSON
  EXECUTE 'SELECT array_to_json(array_agg(row_to_json(t))) FROM (' || sql_query || ') t' INTO result;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;