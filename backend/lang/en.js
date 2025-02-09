const messages = {
    missingWord: "Missing 'word' query parameter.",
    wordNotFound: word => `Word '${word}' not found!`,
    invalidInput: "Invalid input: words and definitions must be non-empty strings without numbers.",
    wordExists: word => `Warning! '${word}' already exists.`,
    newEntry: (word, definition) => `New entry recorded: '${word} : ${definition}'`,
    invalidJson: "Invalid JSON format.",
    invalidEndpoint: "Invalid API endpoint."
};

module.exports = messages;
