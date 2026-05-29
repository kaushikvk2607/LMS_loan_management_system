import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 4000),
  mongodbUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/lms",
  jwtSecret: process.env.JWT_SECRET ?? "development-secret",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
  uploadDir: process.env.UPLOAD_DIR ?? "uploads"
};
