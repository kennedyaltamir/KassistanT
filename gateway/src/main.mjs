import { createHttpServer } from "./http.mjs";

const port = Number(process.env.PORT ?? 8787);
const server = createHttpServer();
server.listen(port, "127.0.0.1", () => {
  console.log(`KassisT Gateway skeleton listening on ${port}`);
});
