import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
const app = express();
const port = 3000;
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "Ramram@1",
  port: 5432,
});
db.connect();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
async function checkVisited() {
  const result = await db.query("SELECT country_code FROM visited_countries");
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}
app.get("/", async (req, res) => {
  //Write your code here.
  const countries = await checkVisited();
  console.log(countries);
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
  });
});
app.post("/add", async (req, res) => {
  const addCountry = req.body["country"];
  try {
    const newCode = await db.query(
      "SELECT country_code FROM countries WHERE LOWER (country_name) LIKE '%'||$1||'%';",
      [addCountry.toLowerCase()]
    );
    const data = newCode.rows[0];
    const countryCode = data.country_code;
    try {
      await db.query(
        "INSERT INTO visited_countries (country_code) VALUES ($1)",
        [countryCode]
      );
      res.redirect("/");
    } catch (error) {
      console.log(error);
      const countries = await checkVisited();
      res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        error: "Country already visited",
      });
    }
  } catch (error) {
    console.log(error);
    const countries = await checkVisited();
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      error: "Country name does not exist",
    });
  }
});
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
