const express = require('express');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const app = express();
const rootDir = path.join(__dirname, '../');

app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(rootDir, 'public')));

app.use('/api', require('./routes/api'));

app.get('/*', (req, res) => {
    const query = req.query.toString();

    if (query === '/' && query === '/#') {
        res.sendFile(path.join(rootDir, 'public/index.html'));
    } else if (fs.existsSync(path.join(rootDir, 'public', query))) {
        res.sendFile(path.join(rootDir, 'public', query));
    } else {
        res.sendFile(path.join(rootDir, 'public/404.html'));
    }
})

const IP = process.env.IP || 'localhost';
const PORT = process.env.PORT || 3000;

app.set('ip', IP);
app.set('port', PORT);
app.set('host', `${IP}:${PORT}`);

app.listen(PORT, () => {
    console.log(`Running on http://${IP}:${PORT}`);
});