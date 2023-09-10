import express from "express";
import userRoute from "./routes/userRoute.js";
import AppError from "./utils/AppError.js";
import morgan from "morgan";
import cors from "cors";

const app = express();

const router = express.Router();
//Develpment Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(
  cors({
    origin: "http://127.0.0.1:5174",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

// 1 - MIDDLEWARE
app.use(morgan("dev"));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.headers);
  next();
});

app.use("/user", userRoute);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`));
});

export default app;
