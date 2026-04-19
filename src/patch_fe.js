// patch_fe.js — fixes JSX parse error
// Run with: node patch_fe.js

const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "src", "App.jsx");
let code = fs.readFileSync(file, "utf8");

// Fix &nbsp; in JSX — not valid, replace with a space
code = code.replace(
  "<PulseDot/> &nbsp;Live",
  "<PulseDot/>{\" \"}Live"
);

fs.writeFileSync(file, code, "utf8");
console.log("✓ Fixed — refresh your browser");