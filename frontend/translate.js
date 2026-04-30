import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, 'src');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const UI_REPLACEMENTS = [
    { regex: /Showing \{/g, replacement: 'Menampilkan {' },
    { regex: /\} to \{/g, replacement: '} hingga {' },
    { regex: /\} of \{/g, replacement: '} dari {' },
    { regex: /\} records/g, replacement: '} data' },
    { regex: /\} entries/g, replacement: '} data' },
    { regex: />\s*Next\s*</g, replacement: '>Selanjutnya<' },
    { regex: />\s*Previous\s*</g, replacement: '>Sebelumnya<' },
    { regex: />\s*Cancel\s*</g, replacement: '>Batal<' },
    { regex: />\s*Save\s*</g, replacement: '>Simpan<' },
    { regex: />\s*Delete\s*</g, replacement: '>Hapus<' },
    { regex: />\s*Close\s*</g, replacement: '>Tutup<' },
    { regex: />\s*Action\s*</g, replacement: '>Aksi<' },
    { regex: />\s*Status\s*</g, replacement: '>Status<' },
    { regex: /placeholder="Search\.\.\."/gi, replacement: 'placeholder="Cari..."' },
    { regex: /placeholder="Search"/gi, replacement: 'placeholder="Cari..."' },
    { regex: /'Active'/g, replacement: "'Aktif'" },
    { regex: /'Pending'/g, replacement: "'Menunggu'" },
    { regex: /'Completed'/g, replacement: "'Selesai'" },
    { regex: /'Resigned'/g, replacement: "'Nonaktif'" },
    { regex: />\s*Success\s*</g, replacement: '>Sukses<' },
    { regex: />\s*Error\s*</g, replacement: '>Gagal<' },
];

let translatedFiles = 0;

walkDir(srcDir, function(filePath) {
    if (!filePath.endsWith('.jsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    for (let {regex, replacement} of UI_REPLACEMENTS) {
        content = content.replace(regex, replacement);
    }
    
    // Custom specific
    content = content.replace(/'Out of Stock'/g, "'Habis'");
    content = content.replace(/'Low Stock'/g, "'Menipis'");
    content = content.replace(/'In Stock'/g, "'Tersedia'");
    content = content.replace(/>\s*Out of Stock\s*</g, '>Habis<');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        translatedFiles++;
        console.log('Translated:', filePath);
    }
});

console.log(`Finished translating ${translatedFiles} files.`);
