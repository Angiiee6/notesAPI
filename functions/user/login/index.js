const { sendResponse } = require("../../../responses");
const bcrypt = require("bcryptjs");
const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient();

const jwt = require("jsonwebtoken");

async function getUser(email) {
  try {
    const user = await db
      .get({
        TableName: "userTable",
        Key: {
          email: email,
        },
      })
      .promise();

    if (user?.Item) return user.Item;
    else return false;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function login(email, password) {
  const user = await getUser(email);

  if (!user) return { success: false, message: "Incorrect email or password" };

  const correctPassword = await bcrypt.compare(password, user.password);

  if (!correctPassword)
    return { success: false, message: "Incorrect email or password" };

  const token = jwt.sign({ id: user.userId, email: user.email }, "aabbcc", {
    // expiresIn: 3600,
  });

  return { success: true, token: token };
}

exports.handler = async (event) => {
  const { email, password } = JSON.parse(event.body);

  const result = await login(email, password);

  if (result.success) return sendResponse(200, result);
  else return sendResponse(400, result);
};

// 200 (OK) - Om servern lyckats med att göra det som resursen motsvarar.

// 400 (Bad request) - Om requestet är felaktigt gjort, så att servern inte kan fortsätta. Exempel: Att frontend skickar med felaktig data i body till servern.

// 401 (Unauthorized) - Om giltig inloggning inte finns
//Om ej token skickas med i requestet eller om token är ogiltig.

// 404 (Not found) - Om resursen eller objektet som efterfrågas inte finns.
// Exempel: Om en användare försöker hämta en anteckning som inte finns i databasen.

// 500 (internal server error) - Om ett fel inträffar på servern. Använd catch för att fånga det.
// Exempel: Om databasen är nere eller om ett oväntat fel inträffar i koden.
