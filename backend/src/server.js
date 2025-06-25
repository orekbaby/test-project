const { app } = require("./app.js");
const { env } = require("./config");

const PORT = env.PORT;

console.log('PORT from env:', PORT);
console.log('Starting server...');

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});