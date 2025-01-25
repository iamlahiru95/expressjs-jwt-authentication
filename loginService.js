import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGODB_URL);

const dbName = process.env.MONGODB_DATABASE_NAME;
const collectionName = "loginCredentials";

/**
 * save username and hashe password
 * @param {*} username
 * @param {*} hashedPassword
 * @returns boolean
 */
async function saveLogin(username, hashedPassword) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const result = await collection.find({ username }).toArray();

    if (result.length === 0) {
      await collection.insertOne({ username, hashedPassword });
      return;
    } else {
      throw new Error("User already exists");
    }
  } catch (error) {
    console.log(`saveLogin is failed. ${error}`);
  }
}

/**
 * fetch hashed password by username
 * @param {*} username
 * @returns string
 */
async function fetchHashedPassowrd(username) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const result = await collection.find({ username }).toArray();

    if (result.length === 0) {
      throw new Error("User does not exists");
    } else {
      return result[0].hashedPassword;
    }
  } catch (error) {
    console.log(`saveLogin is failed. ${error}`);
  }
}

/**
 * check whether a username already exists
 * @param {*} username
 * @returns boolean
 */
async function isUsernameExists(username) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const result = await collection.find({ username }).toArray();

    if (result.length === 0) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    console.log(`isLoginExists is failed. ${error}`);
  }
}

export { saveLogin, fetchHashedPassowrd, isUsernameExists };
