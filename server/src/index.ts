import express from "express"
import cors from "cors"
import authRouter from "./routes/auth"
import dotenv from "dotenv"

dotenv.config({ path: process.env.DOTENV_PATH || ".env" })

const app = express()
app.use(cors({ origin: "*", credentials: false }))
app.use(express.json())

app.use("/auth", authRouter)

app.get("/health", (_, res) => res.json({ status: "ok" }))

const port = Number(process.env.PORT || 4000)
app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`)
})
