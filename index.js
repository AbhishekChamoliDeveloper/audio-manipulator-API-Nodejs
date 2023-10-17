const express = require("express");
const cors = require("cors");

require("dotenv").config();

const apiRoutes = require("./routes/apiRoutes");

const PORT = process.env.PORT;

const app = express();

app.use(cors());

app.use("/", apiRoutes);

app.listen(PORT, () => {
  console.log(`Server Running on ${PORT}`);
});
