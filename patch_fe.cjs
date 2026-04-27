const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

c = c.replace(
  `<table style={{ fontSize:12, marginTop:8, borderCollapse:"collapse", width:"100%" }}>
                <tbody>
                  {[
                    ["Location",   d.city],
                    ["Website",    d.url],
                    ["Established",d.since],
                    ["Rating",     \`\${d.rating}/5.0 (\${d.reviewCount?.toLocaleString()} Google reviews)\`],
                    ["Shipping",   d.shipping],
                  ].map(([label, val]) => (
                    <tr key={label}>
                      <td style={{ color:MUTED, paddingRight:16, paddingBottom:5, whiteSpace:"nowrap", verticalAlign:"top", width:90 }}>{label}</td>
                      <td style={{ color:SLATE, paddingBottom:5, verticalAlign:"top" }}>{label === "Website" ? <a href={d.url} target="_blank" rel="noreferrer" style={{ color:NAVY, textDecoration:"none" }}>{val}</a> : val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>`,
  `<table style={{ fontSize:12, marginTop:8, borderCollapse:"collapse", width:"auto", textAlign:"left" }}>
                <tbody>
                  {[
                    ["📍","Location",   d.city],
                    ["🌐","Website",    d.url],
                    ["📅","Established",String(d.since)],
                    ["⭐","Rating",     \`\${d.rating}/5.0 (\${d.reviewCount?.toLocaleString()} Google reviews)\`],
                    ["🚚","Shipping",   d.shipping],
                  ].map(([emoji, label, val]) => (
                    <tr key={label}>
                      <td style={{ color:MUTED, paddingRight:6, paddingBottom:4, verticalAlign:"top", textAlign:"left" }}>{emoji}</td>
                      <td style={{ color:MUTED, paddingRight:14, paddingBottom:4, whiteSpace:"nowrap", verticalAlign:"top", textAlign:"left" }}>{label}</td>
                      <td style={{ color:SLATE, paddingBottom:4, verticalAlign:"top", textAlign:"left" }}>
                        {label === "Website"
                          ? <a href={d.url} target="_blank" rel="noreferrer" style={{ color:NAVY, textDecoration:"none" }}>{val}</a>
                          : val}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>`
);

fs.writeFileSync('src/App.jsx', c, 'utf8');
console.log('✓ Done');