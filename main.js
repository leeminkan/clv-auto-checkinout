const rp = require("request-promise");
const axios = require("axios");
const cheerio = require("cheerio");
const cron = require("node-cron");
require("dotenv").config();

const LOGIN_URL = "https://blueprint.cyberlogitec.com.vn/sso/login";
const CHECKINOUT_URL =
  "https://blueprint.cyberlogitec.com.vn/api/checkInOut/insert";

async function clvAutoCheckinout(username, password) {
  try {
    if (!username || !password)
      throw new Error("Username, passowrd are required");

    console.log("===Get login homepage===");
    let response;

    try {
      await axios.get(LOGIN_URL, { maxRedirects: 0 });
    } catch (error) {
      if (error.response.status !== 302) {
        throw error;
      }
      response = error.response;
    }

    const cookies = response.headers["set-cookie"];

    response = await axios.get(response.headers["location"], {
      maxRedirects: 0,
    });

    cookies.push(...response.headers["set-cookie"]);
    const $ = cheerio.load(response.data);

    // 2. Extract necessary details from the form
    const formAction = $("form#login-form").attr("action");

    // 3. Prepare the login data
    const loginData = {
      username: username,
      password: password,
    };

    console.log("===Submit the login form===", {
      formAction,
      username,
    });
    // 4. Submit the login form
    try {
      await rp({
        method: "POST",
        uri: formAction,
        form: loginData,
        headers: {
          Cookie: cookies.join("; "),
        },
      });
    } catch (error) {
      if (error.statusCode !== 302) {
        throw error;
      }
      response = error.response;
    }
    cookies.push(...response.headers["set-cookie"]);

    console.log("===Handle auth redirect 1===", response.headers["location"]);
    try {
      await axios.get(response.headers["location"], {
        maxRedirects: 0,
        headers: {
          Cookie: cookies.join("; "),
        },
      });
    } catch (error) {
      if (error.response.status !== 302) {
        throw error;
      }
      response = error.response;
    }
    cookies.push(...response.headers["set-cookie"]);

    console.log("===Handle auth redirect 2===", response.headers["location"]);
    response = await axios.get(response.headers["location"], {
      maxRedirects: 0,
      headers: {
        Cookie: cookies.join("; "),
      },
    });

    console.log("===Call checkinout===");
    // 6. Call the API with the cookies
    response = await axios.post(
      CHECKINOUT_URL,
      {},
      {
        maxRedirects: 0,
        headers: {
          Cookie: cookies.join("; "),
        },
      }
    );

    console.log("===Call API success===", response.data);
  } catch (error) {
    console.error("===Error===", error);
  }
}

(function main() {
  console.log("===START PROCESS CLV AUTO CHECKINOUT===", {
    tz: process.env.TZ,
    time: new Date(),
  });
  if (!process.env.USERNAME || !process.env.PASSWORD)
    throw new Error("Username, passowrd are required");

  // Checkin 8AM
  cron.schedule(
    "0 8 * * 1-5",
    async () => {
      console.log("===RUN CHECKIN JOB===");
      await clvAutoCheckinout(process.env.USERNAME, process.env.PASSWORD);
    },
    {
      scheduled: true,
      timezone: "Asia/Ho_Chi_Minh",
    }
  );

  // Checkout 17:40PM
  cron.schedule(
    "40 17 * * 1-5",
    async () => {
      console.log("===RUN CHECKIN JOB===");
      await clvAutoCheckinout(process.env.USERNAME, process.env.PASSWORD);
    },
    {
      scheduled: true,
      timezone: "Asia/Ho_Chi_Minh",
    }
  );
})();
