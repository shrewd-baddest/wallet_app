const path = require("path");

require("ts-node/register");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });

module.exports = require("./src/db/knexfile").default;
