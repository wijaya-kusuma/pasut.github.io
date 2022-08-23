const fs = require('fs');

// directory path
const dir = '../../data/data_stasiun_pasut/2019/0079SITO01/foto/Bangunan';

// list all files in the directory
try {
    const files = fs.readdirSync(dir);
    // files object contains all files names
    // log them on console
    let dirUrl = [];
    files.forEach(file => {
        dir
        console.log(dir+file);
    });

} catch (err) {
    console.log(err);
}