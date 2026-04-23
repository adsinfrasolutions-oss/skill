DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'skill_quantproc') THEN
    CREATE ROLE skill_quantproc LOGIN PASSWORD 'SkillQuantproc@2026!Db';
  ELSE
    ALTER ROLE skill_quantproc WITH LOGIN PASSWORD 'SkillQuantproc@2026!Db';
  END IF;
END
$$;
