import { createClient } from "redis";

const client = await createClient()
  .on("error", (err) => console.log("Redis client error", err))
  .connect();

async function saveToken(username, token) {
  try {
    await client.set(username, token);
  } catch (error) {
    console.log("saveTokenInRedisCache is failed. Error:" + error);
  }
}

async function isTokenValid(username, token) {
  try {
    const storedToken = await client.get(username);
    if (storedToken && token === storedToken) {
      return true;
    }
    return false;
  } catch (error) {
    console.log("isTokenInRedisCache is failed. Error: " + error);
  }
}

// async function isTokenDeleted(username) {
//   try {
//     const a = await client.del()
//   } catch (error) {
    
//   }
// }

export { saveToken, isTokenValid };
