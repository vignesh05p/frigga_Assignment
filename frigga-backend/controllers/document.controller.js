const supabase = require("../supabase/supabaseClient");
const { v4: uuidv4 } = require("uuid");
const { extractMentions } = require("../utils/mentionUtils");

// --- Create new document ---
exports.createDocument = async (req, res) => {
  const { title, content, visibility } = req.body;
  const author_id = req.user.id;

  const { data, error } = await supabase
    .from("kb_documents")
    .insert([{ id: uuidv4(), title, content, visibility, author_id }])
    .select();

  if (error) return res.status(400).json({ error: error.message });

  const doc = data[0];

  // 🚀 Auto-share if @mentions exist
  const mentionedUsernames = extractMentions(content);
  for (const username of mentionedUsernames) {
    const { data: user } = await supabase
      .from("kb_users")
      .select("id")
      .eq("username", username)
      .single();

    if (user) {
      const { count } = await supabase
        .from("kb_shared_documents")
        .select("*", { count: "exact", head: true })
        .eq("document_id", doc.id)
        .eq("user_id", user.id);

      if (count === 0) {
        await supabase.from("kb_shared_documents").insert({
          document_id: doc.id,
          user_id: user.id,
          access_level: "view",
        });
      }
    }
  }

  res.status(201).json({ message: "Document created", document: doc });
};

// --- List accessible documents (author, public, or shared) ---
exports.listDocuments = async (req, res) => {
  const userId = req.user.id;

  const { data: sharedDocs } = await supabase
    .from("kb_shared_documents")
    .select("document_id")
    .eq("user_id", userId);

  const sharedDocIds = sharedDocs.map(doc => doc.document_id);
  const sharedIdString = sharedDocIds.length ? `,id.in.(${sharedDocIds.join(",")})` : "";

  const { data, error } = await supabase
    .from("kb_documents")
    .select("id, title, visibility, updated_at, author_id")
    .or(`visibility.eq.public,author_id.eq.${userId}${sharedIdString}`);

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
};

// --- Update document (and track version) ---
exports.updateDocument = async (req, res) => {
  const { id } = req.params;
  const { title, content, visibility } = req.body;
  const userId = req.user.id;

  // Check access
  const { data: docInfo, error: err1 } = await supabase
    .from("kb_documents")
    .select("*")
    .eq("id", id)
    .single();

  if (err1 || !docInfo) {
    return res.status(404).json({ error: "Document not found" });
  }

  let hasEditAccess = docInfo.author_id === userId;

  if (!hasEditAccess) {
    const { data: sharedAccess } = await supabase
      .from("kb_shared_documents")
      .select("access_level")
      .eq("document_id", id)
      .eq("user_id", userId)
      .maybeSingle();

    hasEditAccess = sharedAccess?.access_level === "edit";
  }

  if (!hasEditAccess) {
    return res.status(403).json({ error: "Permission denied: Cannot edit" });
  }

  // 📦 Save old version
  const { count: versionCount } = await supabase
    .from("kb_document_versions")
    .select("*", { count: "exact", head: true })
    .eq("document_id", id);

  await supabase.from("kb_document_versions").insert({
    id: uuidv4(),
    document_id: id,
    title: docInfo.title,
    content: docInfo.content,
    version_number: (versionCount || 0) + 1,
    modified_by: userId,
    modified_at: new Date(),
  });

  // ✏️ Update current doc
  const { data, error } = await supabase
    .from("kb_documents")
    .update({ title, content, visibility, updated_at: new Date() })
    .eq("id", id)
    .select();

  if (error) return res.status(400).json({ error: error.message });

  const doc = data[0];

  // 🚀 Handle @mentions again
  const mentionedUsernames = extractMentions(content);
  for (const username of mentionedUsernames) {
    const { data: user } = await supabase
      .from("kb_users")
      .select("id")
      .eq("username", username)
      .single();

    if (user) {
      const { count } = await supabase
        .from("kb_shared_documents")
        .select("*", { count: "exact", head: true })
        .eq("document_id", doc.id)
        .eq("user_id", user.id);

      if (count === 0) {
        await supabase.from("kb_shared_documents").insert({
          document_id: doc.id,
          user_id: user.id,
          access_level: "view",
        });
      }
    }
  }

  res.json({ message: "Document updated", document: doc });
};

// --- Full-text search (on accessible docs) ---
exports.searchDocuments = async (req, res) => {
  const { query } = req.query;
  const userId = req.user.id;

  const { data: sharedDocs } = await supabase
    .from("kb_shared_documents")
    .select("document_id")
    .eq("user_id", userId);

  const sharedDocIds = sharedDocs.map(doc => doc.document_id);
  const sharedIdString = sharedDocIds.length ? `,id.in.(${sharedDocIds.join(",")})` : "";

  const { data, error } = await supabase
    .from("kb_documents")
    .select()
    .or(`visibility.eq.public,author_id.eq.${userId}${sharedIdString}`)
    .ilike("title", `%${query}%`);

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
};
