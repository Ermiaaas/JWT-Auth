const config = require("./knexfile.js");
const db = require("knex")(config)


module.exports = db;