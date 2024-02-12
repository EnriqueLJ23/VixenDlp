const express = require('express')
const app = express()
const cors = require('cors')
const { spawn } = require('child_process');
let fs = require('fs'); 
   


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
  
app.get('/download', (req, res) => {
  const videoUrl = req.query.url;
  const format = req.body.format || 'bv'

  // sub-proceso para ejecutar los comandos en la consola
  const ytDlpProcess = spawn('yt-dlp', ['-o', '-', videoUrl]);

  // Set Content-Type header
  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('Accept-Ranges', 'bytes');
  res.header('Content-Disposition', 'inline');
  // Send the stream of yt-dlp in the response
  ytDlpProcess.stdout.pipe(res);

 ytDlpProcess.on('error', (err) => {
   console.error('Error executing yt-dlp:', err);
   res.status(500).send('Internal Server Error');
 });

 ytDlpProcess.on('exit', (code, signal) => {
   if (code !== 0) {
     console.error(`yt-dlp process exited with code ${code} and signal ${signal}`);
   }
 });
});




  const PORT = 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })