import { config } from "dotenv";
import app from "app";
import startup from "startup";

config();

const port = process.env.PORT || 3000;

startup(app)
  .then(() => {
    app.listen(port, () => {
      console.log("Server running on %s", port);
    });
  })
  .catch((e) => {
    console.error("Failed to start server\n %s", e);
    process.exit(1);
  });
