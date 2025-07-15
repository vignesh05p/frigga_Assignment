require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const documentRoutes = require("./routes/document.routes");
const shareRoutes = require("./routes/share.routes");
const versionRoutes = require("./routes/version.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);              // 🔐 Authentication
app.use("/api/documents", documentRoutes);     // 📄 Document CRUD & Public Access
app.use("/api/share", shareRoutes);            // 👥 Sharing & Permissions
app.use("/api/versions", versionRoutes);       // 🕓 Version history & diff
app.use("/api/versions", require("./routes/version.routes"));

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
