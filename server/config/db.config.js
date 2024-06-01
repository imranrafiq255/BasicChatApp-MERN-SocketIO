const mongoose = require("mongoose");

const dbConnection = (MONGO_URI) => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then((con) =>
      console.log(`MongoDB is connected on: ${con.connection.host}`)
    )
    .catch((error) => console.log(`MongoDB error occurred: ${error}`));
};
module.exports = dbConnection;
