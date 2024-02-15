const express = require('express')
const app = express()
const cors = require('cors')
const { spawn } = require('child_process');
const YTDlpWrap = require('yt-dlp-wrap').default;
const path = require('path');
const fs = require('fs')
app.use(express.json()); 
const ytDlpWrap = new YTDlpWrap('C:\\Users\\jasso\\AppData\\Local\\Programs\\Python\\Python312\\Scripts\\yt-dlp.exe');

app.use(cors())
let title = ''
let videoId = ''
app.get('/video-info', async (request, response) => {
  const videoUrl = request.query.url;
  let dataBuffer = '';

  // sub-proceso para buscar la informacion del URL
  const DlProcess = spawn('yt-dlp', ['--dump-json', videoUrl]);

  DlProcess.stdout.on('data', (data) => {
      // acumula todo en un string para despues parsearlo
      dataBuffer += data;
      console.log(`yt-dlp stdout: ${data}`);
  });

  DlProcess.stderr.on('data', (data) => {
      console.error(`yt-dlp stderr: ${data}`);
  });

  DlProcess.on('close', (code) => {
      if (code === 0) {
          try {
              // Parsea la wea 
              const jsonData = JSON.parse(dataBuffer);
              console.log(jsonData.title)
              title = jsonData.title
              videoId = jsonData.id
              response.json(jsonData);
          } catch (error) {
              console.error('Error parsing JSON:', error);
              response.status(500).json({ error: 'Internal Server Error' });
          }
      } else {
          console.error(`yt-dlp process exited with code ${code}`);
          response.status(500).json({ error: 'Internal Server Error' });
      }
  });
});
  
app.post('/download',  (req, res) => {
  const videoUrl = req.body.url;

let ytDlpEventEmitter = ytDlpWrap
.exec([
    videoUrl,
    '-f',
    'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
    '-o',
    path.join(__dirname, 'VideosDescargados', `${title}.mp4`),
])
.on('progress', (progress) =>
    console.log(
        progress.percent,
        progress.totalSize,
        progress.currentSpeed,
        progress.eta
    )
)
.on('ytDlpEvent', (eventType, eventData) =>
    console.log(eventType, eventData)
)
.on('error', (error) => console.error(error))
.on('close', () => res.redirect(`/video/${videoId}`));

console.log(ytDlpEventEmitter.ytDlpProcess.pid);
});

app.get('/video/:id', (req, res) => {
    const videoPath =  path.join(__dirname, 'VideosDescargados', `${title}.mp4`)
console.log(videoPath);
    if (!fs.existsSync(videoPath)) {
        return res.status(404).send('Video not found!')
    }

    const stat = fs.statSync(videoPath)
    const fileSize = stat.size
    const range = req.headers.range

    if (range) {
        const parts = range.replace(/bytes=/, '').split('-')
        const start = parseInt(parts[0], 10)
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
        const chunkSize = (end - start) + 1
        const file = fs.createReadStream(videoPath, { start, end })
        const headers = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video/mp4'
        }
        res.writeHead(206, headers)
        file.pipe(res)
    } else {
        const headers = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4'
        }
        res.writeHead(200, headers)
        fs.createReadStream(videoPath).pipe(res)
    }
})


  const PORT = 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })