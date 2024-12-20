import http from "http";
import { query } from "./services/query.js";

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const params = new URLSearchParams(body);
      const question = params.get("question");
      const article = params.get("article");
      console.log('query', question, article, body);
      body = JSON.parse(body);
      query(body.question, body.article).then(({answer, context}) => {
        const response = {
            question: question,
            article: article,
            answer: answer,
            context: context,
          };
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(response));
      });
     
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

server.listen(3100, () => {
  console.log("Server listening on http://localhost:3100");
});
