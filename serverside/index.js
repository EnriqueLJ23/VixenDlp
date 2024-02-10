const express = require('express')
const app = express()
const cors = require('cors')
const { spawn } = require('child_process');
const path = require('path');


app.use(express.json()); 

app.use(cors())
let title = ''
app.get('/video-info', (request, response) => {
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
  
app.post('/download', (req, res) => {
  const videoUrl = req.body.url;
  const format = req.body.format || 'bv'
  // sub-proceso para ejecutar los comandos en la consola
  const ytDlpProcess = spawn('yt-dlp', [`-f${format}+ba`,'-o', path.join(__dirname, 'VideosDescargados', `${title}.%(ext)s`)
  ,videoUrl,'-S ext:mp4:m4a']);
  ytDlpProcess.stdout.on('data', (data) => {
    // los resultados imprimir a consola
    console.log(`yt-dlp stdout: ${data}`);
  });

  ytDlpProcess.stderr.on('data', (data) => {
    // por si hay algun error durante la ejecucion 
    console.error(`yt-dlp stderr: ${data}`);
  });

  ytDlpProcess.on('close', (code) => {
    if (code === 0) {
      // video descargado de forma exitosa
      // Enviar el video al cliente
      const videoFilePath = path.join(__dirname, 'VideosDescargados',  `${title}.mp4`);
      res.sendFile(videoFilePath);
    } else {
      // La descarga falló
      res.status(500).json({ error: 'Video download failed' });
    }
  });
});




  const PORT = 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })