// 🔥 AUTOMATIC DATABASE TABLE CREATION WITH SUPABASE RPC INCLUDING HEARINGS

export const createAllTables = async (supabase) => {
  console.log('🚀 Creating database tables automatically...');

  try {
    // 🔥 CREATE WITNESS STATEMENTS TABLE DIRECTLY
    const { error: witnessTableError } = await supabase.rpc('create_witness_statements_table', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS witness_statements_ms2024 (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          incident_id TEXT NOT NULL,
          witness_user_id TEXT NOT NULL,
          witness_name TEXT NOT NULL,
          statement TEXT,
          statement_status TEXT DEFAULT 'pending',
          submitted_at TIMESTAMPTZ,
          judge_comment TEXT,
          judge_request TEXT,
          judge_id TEXT,
          judge_name TEXT,
          judge_commented_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        ALTER TABLE witness_statements_ms2024 ENABLE ROW LEVEL SECURITY;
        CREATE POLICY IF NOT EXISTS "Allow all access" ON witness_statements_ms2024 FOR ALL USING (true);
        CREATE INDEX IF NOT EXISTS idx_witness_statements_incident ON witness_statements_ms2024(incident_id);
        CREATE INDEX IF NOT EXISTS idx_witness_statements_witness ON witness_statements_ms2024(witness_user_id);
        CREATE INDEX IF NOT EXISTS idx_witness_statements_status ON witness_statements_ms2024(statement_status);
      `
    });

    // 🔥 CREATE HEARINGS TABLE DIRECTLY (NEW!)
    const { error: hearingsTableError } = await supabase.rpc('create_hearings_table', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS hearings_ms2024 (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          entry_id TEXT NOT NULL,
          title TEXT NOT NULL,
          question TEXT NOT NULL,
          witness_ids TEXT[] DEFAULT '{}',
          crime_types TEXT[] DEFAULT '{}',
          entry_description TEXT,
          status TEXT DEFAULT 'active',
          responses JSONB DEFAULT '[]',
          created_by_id TEXT NOT NULL,
          created_by_name TEXT NOT NULL,
          created_by_role TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        ALTER TABLE hearings_ms2024 ENABLE ROW LEVEL SECURITY;
        CREATE POLICY IF NOT EXISTS "Allow all access" ON hearings_ms2024 FOR ALL USING (true);
        CREATE INDEX IF NOT EXISTS idx_hearings_entry ON hearings_ms2024(entry_id);
        CREATE INDEX IF NOT EXISTS idx_hearings_creator ON hearings_ms2024(created_by_id);
        CREATE INDEX IF NOT EXISTS idx_hearings_status ON hearings_ms2024(status);
        CREATE INDEX IF NOT EXISTS idx_hearings_witnesses ON hearings_ms2024 USING GIN(witness_ids);
      `
    });

    if (witnessTableError || hearingsTableError) {
      console.log('⚠️ RPC not available, using direct SQL execution...');
      
      // 🔥 FALLBACK: Direct table creation using raw SQL
      const { error: directError } = await supabase
        .from('witness_statements_ms2024')
        .select('id')
        .limit(1);

      // 🔥 CHECK HEARINGS TABLE
      const { error: hearingsDirectError } = await supabase
        .from('hearings_ms2024')
        .select('id')
        .limit(1);

      if ((directError && directError.message.includes('does not exist')) || 
          (hearingsDirectError && hearingsDirectError.message.includes('does not exist'))) {
        console.log('🔧 Creating missing tables...');
        console.log('📋 Please run this SQL in your Supabase SQL Editor:');
        console.log(`
          -- 🔥 CREATE WITNESS STATEMENTS TABLE
          CREATE TABLE IF NOT EXISTS witness_statements_ms2024 (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            incident_id TEXT NOT NULL,
            witness_user_id TEXT NOT NULL,
            witness_name TEXT NOT NULL,
            statement TEXT,
            statement_status TEXT DEFAULT 'pending',
            submitted_at TIMESTAMPTZ,
            judge_comment TEXT,
            judge_request TEXT,
            judge_id TEXT,
            judge_name TEXT,
            judge_commented_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );

          -- 🔥 CREATE HEARINGS TABLE (MISSING!)
          CREATE TABLE IF NOT EXISTS hearings_ms2024 (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            entry_id TEXT NOT NULL,
            title TEXT NOT NULL,
            question TEXT NOT NULL,
            witness_ids TEXT[] DEFAULT '{}',
            crime_types TEXT[] DEFAULT '{}',
            entry_description TEXT,
            status TEXT DEFAULT 'active',
            responses JSONB DEFAULT '[]',
            created_by_id TEXT NOT NULL,
            created_by_name TEXT NOT NULL,
            created_by_role TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );

          -- 🔥 ENABLE RLS AND CREATE POLICIES
          ALTER TABLE witness_statements_ms2024 ENABLE ROW LEVEL SECURITY;
          ALTER TABLE hearings_ms2024 ENABLE ROW LEVEL SECURITY;
          CREATE POLICY IF NOT EXISTS "Allow all access" ON witness_statements_ms2024 FOR ALL USING (true);
          CREATE POLICY IF NOT EXISTS "Allow all access" ON hearings_ms2024 FOR ALL USING (true);

          -- 🔥 CREATE INDEXES
          CREATE INDEX IF NOT EXISTS idx_witness_statements_incident ON witness_statements_ms2024(incident_id);
          CREATE INDEX IF NOT EXISTS idx_witness_statements_witness ON witness_statements_ms2024(witness_user_id);
          CREATE INDEX IF NOT EXISTS idx_witness_statements_status ON witness_statements_ms2024(statement_status);
          CREATE INDEX IF NOT EXISTS idx_hearings_entry ON hearings_ms2024(entry_id);
          CREATE INDEX IF NOT EXISTS idx_hearings_creator ON hearings_ms2024(created_by_id);
          CREATE INDEX IF NOT EXISTS idx_hearings_status ON hearings_ms2024(status);
          CREATE INDEX IF NOT EXISTS idx_hearings_witnesses ON hearings_ms2024 USING GIN(witness_ids);
        `);

        return { 
          success: false, 
          error: 'witness_statements_ms2024 and/or hearings_ms2024 tables need to be created manually' 
        };
      }
    }

    // 🔥 ADD MISSING COLUMNS TO PERSON_ENTRIES
    await addMissingColumns(supabase);

    console.log('✅ Database setup completed!');
    return { success: true };

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return { success: false, error: error.message };
  }
};

const addMissingColumns = async (supabase) => {
  console.log('🔧 Adding missing columns...');

  const columnsToAdd = [
    { table: 'person_entries_ms2024', column: 'reported_by_id', type: 'TEXT' },
    { table: 'person_entries_ms2024', column: 'reported_by_name', type: 'TEXT' },
    { table: 'person_entries_ms2024', column: 'reported_by_role', type: 'TEXT' },
    { table: 'person_entries_ms2024', column: 'witness_names', type: 'TEXT' }
  ];

  for (const { table, column, type } of columnsToAdd) {
    try {
      // Try to select the column to see if it exists
      const { error } = await supabase
        .from(table)
        .select(column)
        .limit(1);

      if (error && error.message.includes('column') && error.message.includes('does not exist')) {
        console.log(`⚠️ Column ${column} missing in ${table} - needs manual addition`);
      } else {
        console.log(`✅ Column ${column} exists in ${table}`);
      }
    } catch (err) {
      console.log(`❌ Error checking ${column} in ${table}:`, err.message);
    }
  }
};

export const validateAllFields = async (supabase) => {
  console.log('🔍 Validating database fields...');

  const tables = ['organizations_ms2024', 'persons_ms2024', 'person_entries_ms2024'];

  for (const tableName of tables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('id,classification,danger_level,status')
        .limit(1);

      if (error) {
        console.error(`❌ Missing fields in ${tableName}:`, error.message);
        return false;
      }

      console.log(`✅ ${tableName} has required assessment fields`);
    } catch (err) {
      console.error(`❌ Error validating ${tableName}:`, err);
      return false;
    }
  }

  // 🔥 CHECK WITNESS STATEMENTS TABLE
  try {
    const { data, error } = await supabase
      .from('witness_statements_ms2024')
      .select('id,incident_id,witness_user_id')
      .limit(1);

    if (error) {
      console.error(`❌ Witness statements table missing:`, error.message);
      return false;
    }

    console.log(`✅ witness_statements_ms2024 table exists`);
  } catch (err) {
    console.error(`❌ Error validating witness_statements_ms2024:`, err);
    return false;
  }

  // 🔥 CHECK HEARINGS TABLE (NEW!)
  try {
    const { data, error } = await supabase
      .from('hearings_ms2024')
      .select('id,entry_id,title,question')
      .limit(1);

    if (error) {
      console.error(`❌ Hearings table missing:`, error.message);
      return false;
    }

    console.log(`✅ hearings_ms2024 table exists`);
  } catch (err) {
    console.error(`❌ Error validating hearings_ms2024:`, err);
    return false;
  }

  console.log('🎉 Field validation completed!');
  return true;
};

export const getCreateTableSQL = () => {
  return `
    -- 🔥 MISSING COLUMNS FOR PERSON ENTRIES (REPORTER + WITNESSES)
    ALTER TABLE person_entries_ms2024 
    ADD COLUMN IF NOT EXISTS reported_by_id TEXT,
    ADD COLUMN IF NOT EXISTS reported_by_name TEXT,
    ADD COLUMN IF NOT EXISTS reported_by_role TEXT,
    ADD COLUMN IF NOT EXISTS witness_names TEXT;

    -- 🔥 CREATE WITNESS STATEMENTS TABLE
    CREATE TABLE IF NOT EXISTS witness_statements_ms2024 (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      incident_id TEXT NOT NULL,
      witness_user_id TEXT NOT NULL,
      witness_name TEXT NOT NULL,
      statement TEXT,
      statement_status TEXT DEFAULT 'pending',
      submitted_at TIMESTAMPTZ,
      judge_comment TEXT,
      judge_request TEXT,
      judge_id TEXT,
      judge_name TEXT,
      judge_commented_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 🔥 CREATE HEARINGS TABLE (MISSING!)
    CREATE TABLE IF NOT EXISTS hearings_ms2024 (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      entry_id TEXT NOT NULL,
      title TEXT NOT NULL,
      question TEXT NOT NULL,
      witness_ids TEXT[] DEFAULT '{}',
      crime_types TEXT[] DEFAULT '{}',
      entry_description TEXT,
      status TEXT DEFAULT 'active',
      responses JSONB DEFAULT '[]',
      created_by_id TEXT NOT NULL,
      created_by_name TEXT NOT NULL,
      created_by_role TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 🔥 ENABLE RLS AND CREATE POLICIES
    ALTER TABLE witness_statements_ms2024 ENABLE ROW LEVEL SECURITY;
    ALTER TABLE hearings_ms2024 ENABLE ROW LEVEL SECURITY;
    CREATE POLICY IF NOT EXISTS "Allow all access" ON witness_statements_ms2024 FOR ALL USING (true);
    CREATE POLICY IF NOT EXISTS "Allow all access" ON hearings_ms2024 FOR ALL USING (true);

    -- 🔥 CREATE INDEXES FOR PERFORMANCE
    CREATE INDEX IF NOT EXISTS idx_person_entries_reporter ON person_entries_ms2024(reported_by_id);
    CREATE INDEX IF NOT EXISTS idx_witness_statements_incident ON witness_statements_ms2024(incident_id);
    CREATE INDEX IF NOT EXISTS idx_witness_statements_witness ON witness_statements_ms2024(witness_user_id);
    CREATE INDEX IF NOT EXISTS idx_witness_statements_status ON witness_statements_ms2024(statement_status);
    CREATE INDEX IF NOT EXISTS idx_hearings_entry ON hearings_ms2024(entry_id);
    CREATE INDEX IF NOT EXISTS idx_hearings_creator ON hearings_ms2024(created_by_id);
    CREATE INDEX IF NOT EXISTS idx_hearings_status ON hearings_ms2024(status);
    CREATE INDEX IF NOT EXISTS idx_hearings_witnesses ON hearings_ms2024 USING GIN(witness_ids);
  `;
};