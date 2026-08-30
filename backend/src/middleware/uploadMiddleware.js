const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../../public/uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        // Sanitize original name for the slug part
        const baseName = path.basename(file.originalname, ext)
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .substring(0, 40);
        // Use a hash based on original name + size to avoid duplicate saves of the same file
        // The size is added to the fieldname string; exact dedup needs file hashing (too slow here)
        // As a simpler approach: keep unique per-session timestamp but check if a file with same
        // sanitized name exists from this session via the request storage tracking
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e5);
        cb(null, `${baseName}-${uniqueSuffix}${ext}`);
    },
});

// File filter (optional, to restrict types)
const fileFilter = (req, file, cb) => {
    // accept image and common document formats
    const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "application/pdf",
        "text/plain",
        "text/csv",
        "application/json",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Unsupported file type: " + file.mimetype), false);
    }
};

// Initialize upload (20MB max file size)
const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB limit
    fileFilter: fileFilter,
});

module.exports = upload;
