import { readFileSync } from "fs";

const API_KEY = "AIzaSyAOoITgosv9fu3FFUrwUserp3G1JMkRSG4";
const PROJECT_ID = "vocabloom-d8a96";
const PASSWORD = "siswa123";

const usernames = readFileSync("src/usernameData.md", "utf-8")
  .split("\n")
  .map((l) => l.replace(/^\d+:\s*/, "").trim())
  .filter(Boolean);

async function signUp(email, password, displayName) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, displayName, returnSecureToken: true }),
    }
  );
  return res.json();
}

async function createFirestoreUser(uid, name, email, idToken) {
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${uid}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        fields: {
          uid: { stringValue: uid },
          name: { stringValue: name },
          email: { stringValue: email },
          totalXp: { integerValue: "0" },
          currentStreak: { integerValue: "0" },
          longestStreak: { integerValue: "0" },
          completedLessons: { arrayValue: { values: [] } },
          achievements: { arrayValue: { values: [] } },
          stats: {
            mapValue: {
              fields: {
                totalQuizzes: { integerValue: "0" },
                totalCorrect: { integerValue: "0" },
                totalWrong: { integerValue: "0" },
                gamesPlayed: { integerValue: "0" },
              },
            },
          },
          createdAt: { timestampValue: new Date().toISOString() },
          lastLogin: { timestampValue: new Date().toISOString() },
        },
      }),
    }
  );
  return res.json();
}

async function main() {
  let success = 0;
  let failed = 0;

  for (const username of usernames) {
    const email = `${username}@vocabloom.app`;
    process.stdout.write(`Registering ${username} (${email})... `);

    try {
      const signUpResult = await signUp(email, PASSWORD, username);

      if (signUpResult.error) {
        if (signUpResult.error.message.includes("EMAIL_EXISTS")) {
          console.log(`SKIPPED (already exists)`);
        } else {
          console.log(`FAILED: ${signUpResult.error.message}`);
          failed++;
        }
        continue;
      }

      const { localId, idToken } = signUpResult;

      await createFirestoreUser(localId, username, email, idToken);
      console.log(`OK`);
      success++;
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone! ${success} registered, ${failed} failed`);
}

main();
