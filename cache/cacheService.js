import { createClient } from "redis";

const refreshTokensSetName = "refreshTokens";

const client = await createClient()
  .on("error", (err) => console.log("Redis client error", err))
  .connect();

/**
 * save token
 * @param {*} token
 */
async function saveToken(token) {
  try {
    await client.sAdd(refreshTokensSetName, token);
  } catch (error) {
    console.error("saveTokenInRedisCache is failed. Error:" + error);
  }
}

/**
 * delete token
 * @param {*} username
 */
async function removeToken(token) {
  try {
    await client.sRem(refreshTokensSetName, token);
  } catch (error) {
    console.error("saveTokenInRedisCache is failed. Error:" + error);
  }
}

/**
 * check token validity
 * @param {*} token
 * @returns
 */
async function isTokenValid(token) {
  try {
    return await client.sIsMember(refreshTokensSetName, token);
  } catch (error) {
    console.error("isTokenValid is failed. Error: " + error);
  }
}

export { saveToken, isTokenValid, removeToken };
