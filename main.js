const rp = require("request-promise");
const axios = require("axios");
const cheerio = require("cheerio");

const loginUrl = "https://blueprint.cyberlogitec.com.vn/sso/login";
const apiUrl =
  "https://blueprint.cyberlogitec.com.vn/api/checkInOut/searchDailyAttendanceCheckInOut"; // Replace with the actual API URL

async function autoLoginAndCallApi(username, password) {
  try {
    console.log("START 1");
    // 1. Get the login form
    let response;
    let cookies;
    try {
      await axios.get(loginUrl, { maxRedirects: 0 });
    } catch (error) {
      if (error.response.status !== 302) {
        throw error;
      }
      response = error.response;
    }
    cookies = response.headers["set-cookie"];

    response = await axios.get(response.headers["location"], {
      maxRedirects: 0,
      withCredentials: true,
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

    console.log("START 2");
    // 4. Submit the login form
    try {
      await rp({
        method: "POST",
        uri: formAction,
        form: loginData,
        resolveWithFullResponse: true, // Get the full response for cookie handling
        headers: {
          Cookie: cookies.join("; "), // Set the cookies in the header
        },
      });
    } catch (error) {
      if (error.statusCode !== 302) {
        throw error;
      }
      response = error.response;
    }
    cookies.push(...response.headers["set-cookie"]);

    try {
      await axios.get(response.headers["location"], {
        maxRedirects: 0,
        withCredentials: true,
        headers: {
          Cookie: cookies.join("; "), // Set the cookies in the header
        },
      });
    } catch (error) {
      if (error.response.status !== 302) {
        throw error;
      }
      response = error.response;
    }
    cookies.push(...response.headers["set-cookie"]);

    response = await axios.get(response.headers["location"], {
      maxRedirects: 0,
      withCredentials: true,
      headers: {
        Cookie: cookies.join("; "), // Set the cookies in the header
      },
    });

    // 6. Call the API with the cookies
    response = await axios.post(
      apiUrl,
      {
        wrkDt: "20240801",
        fmtD: "",
        wrkT: "",
        timeZone: 420,
        checkMonthFlg: "Y",
      },
      {
        maxRedirects: 0,
        withCredentials: true,
        headers: {
          Cookie: cookies.join("; "), // Set the cookies in the header
        },
      }
    );

    // 7. Process the API response
    console.log(response.data);
  } catch (error) {
    console.error("Error:", error);
  }
}

autoLoginAndCallApi("phuchoangnguyen", "");
