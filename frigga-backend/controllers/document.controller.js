const supabase = require("../supabase/supabaseClient");
const { v4: uuidv4 } = require("uuid");

// Create new document
exports.createDocument = async (req, res) => {
  const { title, content, visibility } = req.body;
  const author_id = req.user.id;

  const { data, error } = await supabase
    .from("kb_documents")
    .insert([{ id: uuidv4(), title, content, visibility, author_id }])
    .select();

  if (error) return res.status(400).json({ error: error.message });

  res.status(201).json({ message: "Document created", document: data[0] });
};

// List documents for a user
exports.listDocuments = async (req, res) => {
  const userId = req.user.id;

  const { data, error } = await supabase
    .from("kb_documents")
    .select("id, title, visibility, updated_at, author_id")
    .or(`visibility.eq.public,author_id.eq.${userId}`);

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
};

// Edit a document
exports.updateDocument = async (req, res) => {
  const { id } = req.params;
  const { title, content, visibility } = req.body;

  const { data, error } = await supabase
    .from("kb_documents")
    .update({ title, content, visibility, updated_at: new Date() })
    .eq("id", id)
    .select();

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "Document updated", document: data[0] });
};

// Full-text search
exports.searchDocuments = async (req, res) => {
  const { query } = req.query;
  const userId = req.user.id;

  const { data, error } = await supabase
    .from("kb_documents")
    .select()
    .or(`visibility.eq.public,author_id.eq.${userId}`)
    .ilike("title", `%${query}%`);

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
};
