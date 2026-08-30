const upload = require("../../middleware/uploadMiddleware");
const fs = require("fs");
const path = require("path");

const uploadFiles = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No files uploaded",
            });
        }

        const uploadDir = path.join(__dirname, "../../../public/uploads");
        const uploadedFiles = [];

        for (const file of req.files) {
            // Check if file with same name and size already exists
            const existingFiles = fs.readdirSync(uploadDir);
            let duplicateFound = null;

            for (const existingFile of existingFiles) {
                const existingFilePath = path.join(uploadDir, existingFile);
                const stats = fs.statSync(existingFilePath);

                // Check if same original name and size
                if (stats.size === file.size) {
                    // Extract original name from existing filename (before timestamp)
                    const existingOriginalName = existingFile.split('-').slice(0, -2).join('-');
                    const currentOriginalName = path.basename(file.originalname, path.extname(file.originalname))
                        .toLowerCase()
                        .replace(/[^a-z0-9]/g, '-')
                        .substring(0, 40);

                    if (existingOriginalName === currentOriginalName) {
                        duplicateFound = existingFile;
                        break;
                    }
                }
            }

            if (duplicateFound) {
                // Delete the newly uploaded file since duplicate exists
                fs.unlinkSync(file.path);

                // Return the existing file's URL
                uploadedFiles.push({
                    name: file.originalname,
                    type: file.mimetype,
                    size: file.size,
                    url: `/uploads/${duplicateFound}`,
                });
            } else {
                // No duplicate, keep the new file
                uploadedFiles.push({
                    name: file.originalname,
                    type: file.mimetype,
                    size: file.size,
                    url: `/uploads/${file.filename}`,
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: "Files uploaded successfully",
            data: uploadedFiles,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    uploadFiles,
};
