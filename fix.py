with open('src/App.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Fix missing <a tag
c = c.replace(
    '        \n          href="https://www.tradingview.com"',
    '        <a\n          href="https://www.tradingview.com"'
)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(c)

print('fixed')