const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 3001;
let app_access_token = "";
var token = "";

app.use(cors());
app.use(express.json());

//================GET TENANT TOKEN===========
const getAppAccessToken = async () => {
  try {
    const response = await axios.post(
      "https://open.larksuite.com/open-apis/auth/v3/app_access_token/internal",
      {
        app_id: "cli_a63863adcb39d010",
        app_secret: "l4jTJ1jScEJ6TnXgNwgwkJiNl3ZquCSQ",
      }
    );

    app_access_token = `Bearer ${response.data.app_access_token}`;
    token = app_access_token;
    console.log(
      "Token obtained successfully: " + response.data.app_access_token
    );
  } catch (error) {
    console.error("Error fetching token:", error);
  }
};
getAppAccessToken();
//===============GET ALL RECORDS============
app.get("/api/records", async (req, res) => {
  try {
    const response = await axios.get(
      "https://open.larksuite.com/open-apis/bitable/v1/apps/U3uSbIXSXaPUC1sB7FBlyOqqgNh/tables/tbl5VfIwxti0fKno/records",
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: token,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching records" });
  }
});

//===============GET RECORD BY ID============
app.get("/api/records/getbyid/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(
      `https://open.larksuite.com/open-apis/bitable/v1/apps/U3uSbIXSXaPUC1sB7FBlyOqqgNh/tables/tbl5VfIwxti0fKno/records/${id}`,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: token,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching records" });
  }
});

//===============CREATE RECORD============
app.post("/api/records/create", async (req, res) => {
  const fields = req.body;
  const myUUID = uuidv4();

  try {
    const response = await axios.post(
      "https://open.larksuite.com/open-apis/bitable/v1/apps/U3uSbIXSXaPUC1sB7FBlyOqqgNh/tables/tbl5VfIwxti0fKno/records",
      fields,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: token,
        },
      }
    );

    res.status(201).json(response.data);

    const messageResponse = await axios.post(
      "https://open.larksuite.com/open-apis/im/v1/messages?receive_id_type=open_id",
      {
        receive_id: "ou_ed890b72079144456a7d006f954e17d9",
        msg_type: "text",
        content: JSON.stringify({ text: "new record" }),
        uuid: myUUID,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: token,
        },
      }
    );
  } catch (error) {
    console.error("Error creating record:", error);
    res.status(500).json("Error creating record");
  }
});

//===============UPDATE RECORD============
app.put("/api/records/update/:id", async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  const myUUID = uuidv4();
  try {
    const response = await axios.put(
      `https://open.larksuite.com/open-apis/bitable/v1/apps/U3uSbIXSXaPUC1sB7FBlyOqqgNh/tables/tbl5VfIwxti0fKno/records/${id}`,
      updatedData,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: token,
        },
      }
    );
    res.json(response.data);

    const messageResponse = await axios.post(
      "https://open.larksuite.com/open-apis/im/v1/messages?receive_id_type=open_id",
      {
        receive_id: "ou_ed890b72079144456a7d006f954e17d9",
        msg_type: "text",
        content: JSON.stringify({ text: "update record" }),
        uuid: myUUID,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: token,
        },
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Error updating record" });
  }
});

//===============DELETE RECORD============
app.delete("/api/records/delete/:id", async (req, res) => {
  const { id } = req.params;
  const myUUID = uuidv4();
  try {
    const response = await axios.delete(
      `https://open.larksuite.com/open-apis/bitable/v1/apps/U3uSbIXSXaPUC1sB7FBlyOqqgNh/tables/tbl5VfIwxti0fKno/records/${id}`,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: token,
        },
      }
    );
    // res.json(response);

    const messageResponse = await axios.post(
      "https://open.larksuite.com/open-apis/im/v1/messages?receive_id_type=open_id",
      {
        receive_id: "ou_ed890b72079144456a7d006f954e17d9",
        msg_type: "text",
        content: JSON.stringify({ text: "delete record" }),
        uuid: myUUID,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: token,
        },
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Error deleting record" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
