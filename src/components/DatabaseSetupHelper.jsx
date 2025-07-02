import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiDatabase, FiCopy, FiCheck, FiAlertTriangle } = FiIcons;

const DatabaseSetupHelper = () => {
  const [copied, setCopied] = useState(false);

  const sqlScript = `-- 🔥 COMPLETE DATABASE SETUP INCLUDING HEARINGS SYSTEM
-- Run this SQL in your Supabase SQL Editor

-- 1. CREATE WITNESS STATEMENTS TABLE
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

-- 2. 🔥 CREATE HEARINGS TABLE (MISSING!)
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

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE witness_statements_ms2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE hearings_ms2024 ENABLE ROW LEVEL SECURITY;

-- 4. CREATE POLICIES (Allow all access for now)
CREATE POLICY IF NOT EXISTS "Allow all access" ON witness_statements_ms2024 FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all access" ON hearings_ms2024 FOR ALL USING (true);

-- 5. ADD MISSING COLUMNS TO PERSON ENTRIES (if they don't exist)
ALTER TABLE person_entries_ms2024 
ADD COLUMN IF NOT EXISTS reported_by_id TEXT,
ADD COLUMN IF NOT EXISTS reported_by_name TEXT,
ADD COLUMN IF NOT EXISTS reported_by_role TEXT,
ADD COLUMN IF NOT EXISTS witness_names TEXT;

-- 6. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_witness_statements_incident ON witness_statements_ms2024(incident_id);
CREATE INDEX IF NOT EXISTS idx_witness_statements_witness ON witness_statements_ms2024(witness_user_id);
CREATE INDEX IF NOT EXISTS idx_witness_statements_status ON witness_statements_ms2024(statement_status);
CREATE INDEX IF NOT EXISTS idx_person_entries_reporter ON person_entries_ms2024(reported_by_id);

-- 🔥 NEW: HEARINGS INDEXES
CREATE INDEX IF NOT EXISTS idx_hearings_entry ON hearings_ms2024(entry_id);
CREATE INDEX IF NOT EXISTS idx_hearings_creator ON hearings_ms2024(created_by_id);
CREATE INDEX IF NOT EXISTS idx_hearings_status ON hearings_ms2024(status);
CREATE INDEX IF NOT EXISTS idx_hearings_witnesses ON hearings_ms2024 USING GIN(witness_ids);

-- 7. CREATE ROLE IMAGES TABLE (if it doesn't exist)
CREATE TABLE IF NOT EXISTS role_images_ms2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id TEXT UNIQUE NOT NULL,
  image_url TEXT NOT NULL,
  uploaded_by_id TEXT,
  uploaded_by_name TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ENABLE RLS FOR ROLE IMAGES
ALTER TABLE role_images_ms2024 ENABLE ROW LEVEL SECURITY;

-- 9. CREATE POLICY FOR ROLE IMAGES
CREATE POLICY IF NOT EXISTS "Allow all access" ON role_images_ms2024 FOR ALL USING (true);

-- 10. CREATE STORAGE BUCKET FOR ROLE IMAGES (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('role-images', 'role-images', true) 
ON CONFLICT (id) DO NOTHING;

-- 11. CREATE STORAGE POLICY FOR ROLE IMAGES
CREATE POLICY IF NOT EXISTS "Allow all operations on role images" 
ON storage.objects FOR ALL USING (bucket_id = 'role-images');

-- ✅ SUCCESS MESSAGE
SELECT 'Database setup including HEARINGS completed! 🎉' as status;`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy SQL:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-midnight-900 rounded-xl p-6 border border-midnight-700 max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <SafeIcon icon={FiDatabase} className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-semibold text-white">Database Setup Required</h3>
        </div>
        <button
          onClick={copyToClipboard}
          className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
            copied ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <SafeIcon icon={copied ? FiCheck : FiCopy} className="w-4 h-4" />
          <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
        </button>
      </div>

      <div className="mb-4 p-4 bg-red-900/30 border border-red-500 rounded-lg">
        <div className="flex items-start space-x-3">
          <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-red-400 mt-0.5" />
          <div>
            <p className="text-red-200 font-medium mb-2">Missing Database Tables</p>
            <p className="text-red-200 text-sm">
              The hearings_ms2024 table and witness_statements_ms2024 table are missing. 
              Please run the SQL script below in your Supabase SQL Editor.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Steps to Fix:</h4>
        <ol className="list-decimal list-inside space-y-2 text-midnight-300">
          <li>Copy the SQL script below (click "Copy SQL" button)</li>
          <li>Go to your Supabase Dashboard → SQL Editor</li>
          <li>Paste and run the SQL script</li>
          <li>Refresh this page to verify the connection</li>
        </ol>

        <div className="bg-midnight-800 rounded-lg p-4 border border-midnight-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-midnight-300 text-sm font-medium">SQL Script:</span>
            <span className="text-midnight-400 text-xs">Click to copy</span>
          </div>
          <pre
            className="text-midnight-300 text-xs overflow-x-auto cursor-pointer hover:bg-midnight-700 p-2 rounded transition-colors"
            onClick={copyToClipboard}
          >
            <code>{sqlScript}</code>
          </pre>
        </div>

        <div className="flex items-center space-x-3 text-sm">
          <div className="flex items-center space-x-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Creates witness_statements_ms2024 table</span>
          </div>
          <div className="flex items-center space-x-2 text-orange-400">
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            <span>Creates hearings_ms2024 table</span>
          </div>
          <div className="flex items-center space-x-2 text-blue-400">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Adds missing columns to existing tables</span>
          </div>
          <div className="flex items-center space-x-2 text-purple-400">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>Sets up role images storage</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DatabaseSetupHelper;