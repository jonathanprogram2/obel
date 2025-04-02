import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getFirestore, collection, addDoc, getDocs, doc, getDoc } from "firebase/firestore";
import { app } from "./firebase";

dotenv.config();
const db = getFirestore(app);
const appServer = express();

appServer.use(cors());
appServer.use(express.json()); // Allows JSON request bodies

appServer.use((req, res, next) => {
    console.log(`➡️  Incoming request: ${req.method} ${req.url}`);
    next()
})

// ✅ Add new content
appServer.post("/content", async (req, res) => {
    try {
        const { title, body, author } = req.body;
        if (!title || !body || !author) return res.status(400).json({ error: "Missing fields" });

        const docRef = await addDoc(collection(db, "content"), { title, body, author, createdAt: new Date() });
        res.status(201).json({ message: "Content added", id: docRef.id });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "An unknown error occurred" });
    }
});

// ✅ Fetch content by ID
appServer.get("/content/:id", async (req, res) => {
    try {
        const docRef = doc(db, "content", req.params.id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return res.status(404).json({ error: "Content not found" });

        res.status(200).json({ id: docSnap.id, ...docSnap.data()});
    } catch (error: any) {
        res.status(500).json({ error: error.message || "An unknown error occured" });
    }
});

appServer.get("/content", async (req, res) => {
    try {
        const querySnapshot = await getDocs(collection(db, "content"));
        const contentList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json(contentList);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
})

// Start the server
const PORT = process.env.PORT || 5000;
appServer.listen(PORT, () => console.log(`🔥 API running on http://localhost:${PORT}`));
