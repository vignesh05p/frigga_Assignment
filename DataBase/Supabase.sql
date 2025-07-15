-- USERS TABLE
CREATE TABLE kb_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE kb_users ENABLE ROW LEVEL SECURITY;

-- DOCUMENTS TABLE
CREATE TABLE kb_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  author_id UUID REFERENCES kb_users(id) ON DELETE CASCADE,
  visibility TEXT CHECK (visibility IN ('public', 'private')) DEFAULT 'private',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE kb_documents ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_documents_author ON kb_documents(author_id);
CREATE INDEX idx_documents_visibility ON kb_documents(visibility);

-- SHARED DOCUMENTS TABLE
CREATE TABLE kb_shared_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES kb_documents(id) ON DELETE CASCADE,
  shared_with UUID REFERENCES kb_users(id) ON DELETE CASCADE,
  permission TEXT CHECK (permission IN ('view', 'edit')) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (document_id, shared_with)
);

ALTER TABLE kb_shared_docs ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_shared_docs_doc_id ON kb_shared_docs(document_id);
CREATE INDEX idx_shared_docs_user_id ON kb_shared_docs(shared_with);

-- VERSIONS TABLE
CREATE TABLE kb_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES kb_documents(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  content TEXT,
  updated_by UUID REFERENCES kb_users(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE kb_versions ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_versions_doc_id ON kb_versions(document_id);

-- MENTIONS TABLE
CREATE TABLE kb_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES kb_documents(id) ON DELETE CASCADE,
  mentioned_user_id UUID REFERENCES kb_users(id) ON DELETE CASCADE,
  mentioned_by UUID REFERENCES kb_users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE kb_mentions ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_mentions_doc_id ON kb_mentions(document_id);
CREATE INDEX idx_mentions_user_id ON kb_mentions(mentioned_user_id);

-- PASSWORD RESETS TABLE (Optional)
CREATE TABLE kb_password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES kb_users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE kb_password_resets ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_password_resets_user ON kb_password_resets(user_id);
CREATE INDEX idx_password_resets_token ON kb_password_resets(token);
