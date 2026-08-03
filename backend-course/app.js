const http = require("http");

const server = http.createServer((req, res) => {

    if (req.url === "/") {

        res.statusCode = 200;

        res.end("Home");

    } else if (req.url === "/products") {

        const products = [

            { id: 1, name: "Laptop" },

            { id: 2, name: "Phone" }

        ];

        res.setHeader("Content-Type", "application/json");

        res.statusCode = 200;

        res.end(JSON.stringify(products));

    } else {

        res.statusCode = 404;

        res.end("Route Not Found");

    }

});

server.listen(3000);

const math = require("./math");
const math = require("./math");
const math = require("./math");