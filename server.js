import express from "express";
import fs from "fs";
import { marked } from "marked";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3000;
const NOTES_DIR = path.join(__dirname, "notes");

app.get("/", (req, res) => {
    res.send("API des notes de cours");
});

app.get("/notes", (req, res) => {
    if (!fs.existsSync(NOTES_DIR)) {
        return res.status(500).send("Dossier notes introuvable");
    }
    const files = fs.readdirSync(NOTES_DIR);
    const notes = files
        .filter((file) => file.endsWith(".md"))
        .map((file) => file.replace(".md", ""));
    res.json(notes);
});

app.get("/notes/:slug", (req, res) => {
    const slug = req.params.slug;
    const filePath = path.join(NOTES_DIR, slug + ".md");
    if (!fs.existsSync(filePath)) {
        return res.status(404).send("Note non trouvée");
    }
    const markdownContent = fs.readFileSync(filePath, "utf-8");
    const htmlContent = marked(markdownContent);
    res.send(htmlContent);
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
