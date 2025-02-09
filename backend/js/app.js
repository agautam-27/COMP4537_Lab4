const http = require("http");
const url = require("url");
const messages = require("../lang/en.js"); 

// Function to handle CORS
function setCorsHeaders(res) {
    res.setHeader("Access-Control-Allow-Origin", "*"); 
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// In-memory dictionary storage
let dictionary = {};
let requestCount = 0;

// Create HTTP server
const server = http.createServer((req, res) => {
    setCorsHeaders(res);  // Apply CORS headers

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        return res.end();  // Handle preflight request
    }

    requestCount++;
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    if (req.method === "GET" && pathname === "/api/definitions/all") {
        return sendResponse(res, 200, {
            requestNumber: requestCount,
            totalWords: Object.keys(dictionary).length,
            dictionary: dictionary
        });
    }

    // Handle GET request for retrieving a word definition
    if (req.method === "GET" && pathname.startsWith("/api/definitions")) {
        if (!query.word) {
            return sendResponse(res, 400, { message: messages.missingWord });
        }
        const word = query.word.toLowerCase();
        if (dictionary[word]) {
            return sendResponse(res, 200, {
                requestNumber: requestCount,
                word: word,
                definition: dictionary[word]
            });
        } else {
            return sendResponse(res, 404, { 
                requestNumber: requestCount,
                message: messages.wordNotFound(word)
            });
        }
    }

    // Handle POST request to add a new word definition
    if (req.method === "POST" && pathname === "/api/definitions") {
        let body = "";
        req.on("data", chunk => { body += chunk.toString(); });

        req.on("end", () => {
            try {
                const data = JSON.parse(body);
                const word = data.word?.trim().toLowerCase();
                const definition = data.definition?.trim();

                if (!word || !definition || /\d/.test(word) || /\d/.test(definition)) {
                    return sendResponse(res, 400, { message: messages.invalidInput });
                }

                if (dictionary[word]) {
                    return sendResponse(res, 409, { 
                        requestNumber: requestCount,
                        message: messages.wordExists(word)
                    });
                }

                dictionary[word] = definition;
                return sendResponse(res, 201, { 
                    requestNumber: requestCount,
                    totalWords: Object.keys(dictionary).length,
                    message: messages.newEntry(word, definition, requestCount, Object.keys(dictionary).length)
                });

            } catch (error) {
                return sendResponse(res, 400, { message: messages.invalidJson });
            }
        });

        return;
    }

    // Handle invalid routes
    sendResponse(res, 404, { message: messages.invalidEndpoint });
});

// Helper function to send JSON responses
function sendResponse(res, statusCode, data) {
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
}

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
