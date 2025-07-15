const supabase = require("../supabase/supabaseClient");

// Get all users shared on a document
exports.getSharedUsers = async (req, res) => {
  const { documentId } = req.params;

  const { data, error } = await supabase
    .from("kb_shared_documents")
    .select("user_id, access_level, kb_users:kb_users(id, username, email)")
    .eq("document_id", documentId);

  if (error) return res.status(400).json({ error: error.message });

  res.json(data.map(item => ({
    user_id: item.user_id,
    username: item.kb_users.username,
    email: item.kb_users.email,
    access_level: item.access_level
  })));
};

// Add user access
exports.shareDocument = async (req, res) => {
  const { documentId } = req.params;
  const { username, access_level } = req.body; // view/edit

  const { data: user, error: userError } = await supabase
    .from("kb_users")
    .select("id")
    .eq("username", username)
    .single();

  if (userError || !user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Upsert permission
  const { error } = await supabase
    .from("kb_shared_documents")
    .upsert({
      document_id: documentId,
      user_id: user.id,
      access_level
    });

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: `Shared with @${username} as ${access_level}` });
};

// Remove user access
exports.revokeAccess = async (req, res) => {
  const { documentId } = req.params;
  const { user_id } = req.body;

  const { error } = await supabase
    .from("kb_shared_documents")
    .delete()
    .match({ document_id: documentId, user_id });

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "Access revoked" });
};
