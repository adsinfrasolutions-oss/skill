SELECT 'CREATE DATABASE skill_quantproc OWNER skill_quantproc'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'skill_quantproc')\gexec

GRANT ALL PRIVILEGES ON DATABASE skill_quantproc TO skill_quantproc;
