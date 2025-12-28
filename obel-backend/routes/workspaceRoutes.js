const express = require("express");
const multer = require("multer");
const {
    uploadWorkspaceDoc,
    listWorkspaceDocs,
} = require("../utils/workspaceStorage");
// const auth = require("../middleware/auth"); later if needed

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/workspace/docs
 * Upload a new document directly to S3, return metadata.
 */
router.post(
    "/docs",
    // auth
    upload.single("file"),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }

            // Later swap this for req.user.id
            const userId  = req.user?.id || req.body.userId || "demo-user";

            const doc = await uploadWorkspaceDoc(req.file, userId);

            return res.status(201).json(doc);
        } catch (err) {
            console.error("Workspace upload error:", err);
            return res
                .status(500)
                .json({ message: "Failed to upload workspace document" });
        }
    }
);

/**
 * GET /api/workspace/docs?userId=
 * List all docs for a user from S3.
 */
router.get("/docs", /* auth, */ async (req, res) => {
    try {
        const userId = req.user?.id || req.query.userId || "demo-user";

        const docs = await listWorkspaceDocs(userId);

        return res.json(docs);
    } catch (err) {
        console.error("Workspace list docs error:", err);
        return res
            .status(500)
            .json({ message: "Failed to fetch workspace documents" });
    }
});

module.exports = router;