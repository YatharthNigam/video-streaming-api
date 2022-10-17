const express = require('express');
const bodyParser = require('body-parser');
const upload = require('express-fileupload');

const app = express();
const fs = require('fs');

let filepath = '';

const PORT = process.env.port || 5000;

app.use(upload());
app.use(bodyParser.urlencoded({ extended: false }));

app.listen(PORT, () => {
  console.log('listening on port ' + PORT);
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/', (req, res) => {
  // console.log(req, req.body);
  if (req.files) {
    console.log(req.files);
    var file = req.files.file;
    var filename = file.name;
    console.log(filename);

    file.mv('./uploads/' + filename, (err) => {
      if (err) res.send(err);
      else {
        console.log('file uploaded');
        filepath = './uploads/' + filename;
        // sendVideo('./uploads/' + filename);
      }
    });
  }
});

app.get('/video', (req, res) => {
  const range = req.headers.range;
  // video path
  let videoPath = filepath;
  console.log(videoPath);
  //video size
  const videoSize = fs.statSync(videoPath).size;
  console.log(videoSize);

  const chucksize = 1 * 1e6;
  const start = Number(range.replace(/\D/g, ''));
  const end = Math.min(start + chucksize, videoSize - 1);
  const contentLength = end - start + 1;

  // Header for playing video
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': 'mp4',
  };

  res.writeHead(206, headers);

  const stream = fs.createReadStream(videoPath, { start, end });

  stream.pipe(res);
});
