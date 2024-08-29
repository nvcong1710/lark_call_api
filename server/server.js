const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const NodeCache = require("node-cache");

const app = express();
const appCache = new NodeCache();
const PORT = 3001;
let app_access_token = "";
var token = "";
var user_access_token;
var user_id = "";
var refresh_token;
const APPID = "cli_a63863adcb39d010";
const APPSECRET = "l4jTJ1jScEJ6TnXgNwgwkJiNl3ZquCSQ";

app.use(cors());
app.use(express.json());

//================GET APP ACCESS TOKEN===========
const getAppAccessToken = async () => {
  try {
    const response = await axios.post(
      "https://open.larksuite.com/open-apis/auth/v3/app_access_token/internal",
      {
        app_id: APPID,
        app_secret: APPSECRET,
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

//=================GET USER ACCESS TOKEN==============
app.get("/api/get-user-access-token", async (req, res) => {
  const larkOAuthUrl = `https://open.larksuite.com/open-apis/authen/v1/authorize?app_id=${APPID}&redirect_uri=http://localhost:3000/&scope=bitable:app&state=RANDOMSTATE`;
  res.redirect(larkOAuthUrl);
});

//===================================================
app.post("/api/auth/callback", (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }

  axios
    .post("https://open.larksuite.com/open-apis/authen/v1/access_token", {
      code: code,
      grant_type: "authorization_code",
      app_id: APPID,
      app_secret: APPSECRET,
    })
    .then((response) => {
      user_access_token = "Bearer " + response.data.data.access_token;
      user_id = response.data.data.open_id;
      refresh_token = response.data.data.refresh_token;
      appCache.set("user_access_token", user_access_token, 10);
      console.log("user id: " + user_id);
      console.log("refresh token: " + refresh_token);
      console.log("access token : " + user_access_token);
      res.json(response.data);
    })
    .catch((error) => {
      res.status(500).json({ error: "Failed to fetch access token" });
    });
});
//===============GET CACHE================
const getUserAccessToken = () => {
  return appCache.get("user_access_token");
};
//===============GET ALL RECORDS============
app.get("/api/records", async (req, res) => {
  try {
    const tokenValid = await ensureValidUserToken();
    const response = await axios.get(
      "https://open.larksuite.com/open-apis/bitable/v1/apps/U3uSbIXSXaPUC1sB7FBlyOqqgNh/tables/tbl5VfIwxti0fKno/records",
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: tokenValid,
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
  const tokenValid = await ensureValidUserToken();
  try {
    const response = await axios.get(
      `https://open.larksuite.com/open-apis/bitable/v1/apps/U3uSbIXSXaPUC1sB7FBlyOqqgNh/tables/tbl5VfIwxti0fKno/records/${id}`,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: tokenValid,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching records" });
  }
});

//================TOKEN VALIDATION============
const ensureValidUserToken = async () => {
  if (!getUserAccessToken() || getUserAccessToken() === "") {
    return refreshAccessToken();
  } else {
    return getUserAccessToken();
  }
};

//===============REFRESH USER ACCESS TOKEN==========
const refreshAccessToken = async () => {
  try {
    const response = await axios.post(
      "https://open.larksuite.com/open-apis/authen/v1/oidc/refresh_access_token",
      {
        grant_type: "refresh_token",
        refresh_token: refresh_token,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: app_access_token,
        },
      }
    );

    user_access_token = `Bearer ${response.data.data.access_token}`;
    refresh_token = response.data.data.refresh_token;

    console.log("Access token refreshed successfully: " + user_access_token);
    appCache.set("user_access_token", user_access_token, 10);
    return user_access_token;
  } catch (error) {
    console.error("Error refreshing access token:", error);
  }
};
//===============CREATE RECORD============
app.post("/api/records/create", async (req, res) => {
  const fields = req.body;
  fields.fields.Person = [{ id: user_id }];
  console.log(fields);
  const myUUID = uuidv4();
  const tokenValid = await ensureValidUserToken();

  try {
    const response = await axios.post(
      "https://open.larksuite.com/open-apis/bitable/v1/apps/U3uSbIXSXaPUC1sB7FBlyOqqgNh/tables/tbl5VfIwxti0fKno/records",
      fields,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: tokenValid,
        },
      }
    );

    await axios.post(
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
    res.status(201).json(response.data);
  } catch (error) {
    console.error("Error creating record:", error);
    res.status(500).json("Error creating record");
  }
});

//===============UPDATE RECORD============
app.put("/api/records/update/:id", async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  updatedData.Person = [{ id: user_id }];
  const myUUID = uuidv4();

  const tokenValid = await ensureValidUserToken();

  try {
    const response = await axios.put(
      `https://open.larksuite.com/open-apis/bitable/v1/apps/U3uSbIXSXaPUC1sB7FBlyOqqgNh/tables/tbl5VfIwxti0fKno/records/${id}`,
      updatedData,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: tokenValid,
        },
      }
    );

    await axios.post(
      "https://open.larksuite.com/open-apis/im/v1/messages?receive_id_type=open_id",
      {
        receive_id: user_id,
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
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error updating record" });
  }
});

//===============DELETE RECORD============
app.delete("/api/records/delete/:id", async (req, res) => {
  const { id } = req.params;
  const myUUID = uuidv4();
  const tokenValid = await ensureValidUserToken();

  try {
    const response = await axios.delete(
      `https://open.larksuite.com/open-apis/bitable/v1/apps/U3uSbIXSXaPUC1sB7FBlyOqqgNh/tables/tbl5VfIwxti0fKno/records/${id}`,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: tokenValid,
        },
      }
    );
    // res.json(response);

    await axios.post(
      "https://open.larksuite.com/open-apis/im/v1/messages?receive_id_type=open_id",
      {
        receive_id: user_id,
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
