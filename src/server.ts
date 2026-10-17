import "dotenv/config";
import { app } from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = Number(process.env.PORT) || 4000;

connectDB().catch((err: unknown) => console.error("Could not connect to MongoDB:", err));
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));

