import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { saveToken, isTokenValid, removeToken } from "./cache/cacheService.js";
import {
  fetchHashedPassowrd,
  isUsernameExists,
  saveLogin,
} from "./loginService.js";

dotenv.config();
const app = express();
app.use(express.json());

/**
 * create new access token
 */
app.post("/token", (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  if (!isTokenValid(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken });
  });
});

/**
 * delete refresh token
 */
app.delete("/logout", async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.sendStatus(400);
  }
  try {
    await removeToken(token);
    res.sendStatus(204);
  } catch (error) {
    res.sendStatus(500);
  }
});

/**
 * handle user signup
 */
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("Either username or password is missing");
  }

  try {
    if (await isUsernameExists(username)) {
      return res.status(400).send("Username already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await saveLogin(username, hashedPassword);
    res.status(201).send("Signup successful");
  } catch (error) {
    console.error("Sigup failed. " + error);
    res.status(500).send("Signup failed");
  }
});

/**
 * handle user login(Authentication & Authorization)
 */
app.post("/login", async (req, res) => {
  //Authenticate user
  const { username, password } = req.body;
  const user = { name: username };

  if (!username || !password) {
    return res.status(400).send("Either username or password is missing");
  }

  try {
    const hashedPassword = await fetchHashedPassowrd(username);
    const isPasswordMatch = await bcrypt.compare(password, hashedPassword);
    if (!isPasswordMatch) {
      return res.status(400).send("Password is wrong");
    }

    // Authorization - create access token and send back
    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);

    await saveToken(refreshToken);
    return res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error("Login failed. " + error);
    return res.status(500).send("Login is failed");
  }
});

/**
 * Generate access token
 * @param {*} user
 * @returns string
 */
function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "30s" });
}

app.listen(3001, () => {
  console.log("Server is listening at http://127.0.0.1:3001");
});
