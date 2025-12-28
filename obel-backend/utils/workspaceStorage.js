const {
    S3Client,
    PutObjectCommand,
    ListObjectsV2Command,
} = require("@aws-sdk/client-s3");


const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const BUCKET = process.env.AWS_BUCKET_NAME;

// If you have CloudFront/CDN, set AWS_PUBLIC_BUCKET_URL in env
const PUBLIC_BASE_URL =
    process.env.AWS_PUBLIC_BUCKET_URL ||
    `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`;

/**
 * Upload a file buffer to S3 under workspace/{userId}...
 */
async function uploadWorkspaceDoc(file, userId = "demo-user") {
    // You can swap demo-user for real auth later
    const safeName = encodeURIComponent(file.originalname);
    const key = `workspace/${userId}/${Date.now()}-${safeName}`;

    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    });

    await s3.send(command);

    const url = `${PUBLIC_BASE_URL}/${key}`;

    return {
        key,
        url,
        title: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        lastModified: new Date().toISOString(),
    };
}

/**
 * List all docs for a user from S3
 */

async function listWorkspaceDocs(userId = "demo-user") {
    const prefix = `workspace/${userId}/`;

    const command = new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: prefix,
    });

    const res = await s3.send(command);
    const objects = res.Contents || [];

    // newest first
    objects.sort(
        (a, b) => new Date(b.LastModified) - new Date(a.LastModified)
    );

    return objects.map((obj) => {
        const key = obj.Key;
        const url = `${PUBLIC_BASE_URL}/${key}`;

        // Extract original filename from key
        const lastSegment = key.split("/").pop() || "";
        // stored as `${timestamp}-${encodeURIComponent(originalName)}`
        const afterTimestamp = lastSegment.split("-").slice(1).join("-");
        const title = decodeURIComponent(afterTimestamp || lastSegment);

        return {
            key,
            url,
            title,
            size: obj.Size,
            mimeType: "application/octet-stream", // S3 doesnt return content-type here by default
            lastModified: obj.LastModified,
        };
    });
}

module.exports = {
    uploadWorkspaceDoc,
    listWorkspaceDocs,
};