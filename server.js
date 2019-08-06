const express = require('express')
const app = express()
const log = require('morgan')
const multer = require('multer')
const cors = require('cors')
const path = require('path')

app.use(log('dev'));
app.use(cors());
/*
.doc      application/msword
.dot      application/msword

.docx     application/vnd.openxmlformats-officedocument.wordprocessingml.document
.dotx     application/vnd.openxmlformats-officedocument.wordprocessingml.template
.docm     application/vnd.ms-word.document.macroEnabled.12
.dotm     application/vnd.ms-word.template.macroEnabled.12
*/
const checkFileType = function (req, file, cb) {
    if (!file.originalname.match(/\.(doc|docx)$/)) {
        return cb(new Error('Only document files are allowed!'), false);
    }
    if (file.mimetype != 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return cb(new Error('Only docx files are accepted'));
    }
    cb(null, true)
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './upload')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})
const upload = multer({
    fileFilter: checkFileType,
    storage: storage,
    limits: { fileSize: 1000000 } // in bytes = 1 MB
})

// TODO: check if author role and valid token
app.post('/upload', upload.single('book'), function (req, res) {
    res.json({ filename: req.file.filename, mimetype: req.file.mimetype, originalname: req.file.originalname, size: req.file.size })
})
app.get('/getfile/:filename', function (req, res) {
    // TODO: filename => file_id and rename to original name
    res.download(path.join(__dirname, 'upload', req.params.filename), 'test.docx')
})

app.listen(3000, _ => console.log(`Listening on 3000`))