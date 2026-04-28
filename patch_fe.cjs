// patch_fe.cjs
const fs = require("fs");
let c = fs.readFileSync("src/App.jsx", "utf8").replace(/\r\n/g, "\n");

const OLD = `import { BrowserRouter, Routes, Route, useNavigate, useParams } from "react-router-dom";`;
const NEW = `import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation } from "react-router-dom";`;

if (!c.includes(OLD)) { console.error("❌ import not found"); process.exit(1); }
c = c.replace(OLD, NEW);
fs.writeFileSync("src/App.jsx", c);
console.log("✅ useLocation imported — run: npm run dev");