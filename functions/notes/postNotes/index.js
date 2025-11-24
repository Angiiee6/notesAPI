const { sendResponse } = require("../../../responses");
const AWS = require("aws-sdk");
const { nanoid } = require("nanoid");
const db = new AWS.DynamoDB.DocumentClient();

async function postNotes(title, text) {
  try {
    const timestamp = new Date().toISOString();

    await db
      .put({
        TableName: "notesTable",
        Item: {
          noteId: nanoid(),
          title: title.substring(0, 50),
          text: text.substring(0, 300),
          createdAt: timestamp,
          // modifiedAt: timestamp,
        },
      })
      .promise();

    return { success: true, message: "Note created" };
  } catch (error) {
    console.log("Database error:", error);
    return {
      success: false,
      message: "Could not create note: " + error.message,
    };
  }
}

exports.handler = async (event) => {
  try {
    const { title, text } = JSON.parse(event.body);

    // Validera input
    if (!title?.trim()) {
      return sendResponse(400, {
        success: false,
        message: "Title is required",
      });
    }

    if (!text?.trim()) {
      return sendResponse(400, { success: false, message: "Text is required" });
    }

    const result = await postNotes(title, text);

    return sendResponse(result.success ? 200 : 500, result);
  } catch (error) {
    console.log("Handler error:", error);
    return sendResponse(500, {
      success: false,
      message: "Server error: " + error.message,
    });
  }
};
