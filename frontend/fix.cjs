const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if(file.endsWith('.jsx')) results.push(file);
        }
    });
    return results;
}

const files = walk('src');
let changed = 0;
files.forEach(file => {
    let original = fs.readFileSync(file, 'utf8');
    let content = original;

    // We saw characters like â”€ instead of ─
    content = content.replace(/â”€/g, '─');
    content = content.replace(/â€“/g, '–');
    content = content.replace(/â€¢/g, '•');
    content = content.replace(/â€”/g, '—');
    content = content.replace(/Â·/g, '·');
    content = content.replace(/â• /g, '═');
    
    // Sometimes it's encoded differently in ISO-8859-1. Handled by exact string replacements above.

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed encoding issues in ' + file);
        changed++;
    }
});
console.log('Total files changed: ' + changed);
