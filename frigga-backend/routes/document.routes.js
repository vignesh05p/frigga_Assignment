const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const controller = require("../controllers/document.controller");
const supabase = require("../supabase/supabaseClient");

// --- Authenticated Routes ---
router.post("/", auth, controller.createDocument);
router.get("/", auth, controller.listDocuments);
router.put("/:id", auth, controller.updateDocument);
router.get("/search", auth, controller.searchDocuments);

// --- Public Access (no auth) ---
router.get("/public/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("kb_documents")
    .select("id, title, content, author_id, updated_at")
    .eq("id", id)
    .eq("visibility", "public")
    .single();

  if (error || !data) {
    return res.status(404).json({ error: "Public document not found" });
  }

  res.json(data);
});

// Version history for a document
router.get("/:id/versions", auth, async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("kb_document_versions")
      .select("id, document_id, title, content, modified_by, modified_at")
      .eq("document_id", id)
      .order("modified_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ versions: data });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch versions." });
  }
});


module.exports = router;
