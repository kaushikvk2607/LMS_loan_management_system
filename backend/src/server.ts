import { app } from "./app.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";

await connectDb();

app.listen(env.port, () => {
  console.log(`API running on http://localhost:${env.port}`);
});
