const supabase = require("../supabase/supabaseClient");

// Get version history
exports.getVersions = async (req, res) => {
  const { docId } = req.params;

  const { data, error } = await supabase
    .from("kb_document_versions")
    .select("version_number, modified_at, modified_by")
    .eq("document_id", docId)
    .order("version_number", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
};

// Compare specific version with current
exports.compareVersion = async (req, res) => {
  const { docId, versionNumber } = req.params;

  // Get current
  const { data: current, error: err1 } = await supabase
    .from("kb_documents")
    .select("title, content")
    .eq("id", docId)
    .single();

  if (err1 || !current) {
    return res.status(404).json({ error: "Current document not found" });
  }

  // Get historical
  const { data: version, error: err2 } = await supabase
    .from("kb_document_versions")
    .select("title, content")
    .eq("document_id", docId)
    .eq("version_number", versionNumber)
    .single();

  if (err2 || !version) {
    return res.status(404).json({ error: "Version not found" });
  }

  res.json({
    current,
    version,
    changes: {
      title_changed: current.title !== version.title,
      content_changed: current.content !== version.content,
    },
  });
};
