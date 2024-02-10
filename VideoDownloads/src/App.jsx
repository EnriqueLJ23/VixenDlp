import { useState, useEffect} from 'react';
import logo from './assets/logo3.png'
import axios from 'axios'
// import './App.css'


const App =()=> {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null); 

  const filterBestMp4Formats = () => {
    const mp4Formats = videoInfo ? videoInfo.formats.filter((format) => format.ext === 'mp4' && format.audio_ext === 'none') : [];
    
    // Create a map to store the best format for each resolution
    const bestFormatsMap = new Map();

    // Iterate through each MP4 format and update the map with the best format for each resolution
    mp4Formats.forEach((format) => {
      const resolution = format.resolution;
      if (!bestFormatsMap.has(resolution) || format.tbr > bestFormatsMap.get(resolution).tbr) {
        bestFormatsMap.set(resolution, format);
      }
    });
    return Array.from(bestFormatsMap.values());
  };
  const submitButton =  async (event) => {
    event.preventDefault()
    var urlvideo = videoUrl
    try {
      const response = await axios.get(`http://localhost:3001/video-info?url=${urlvideo}`);
      console.log(response.data);
      const data = response.data
      console.log("titulo: ",data.title);
      setVideoInfo(response.data);
    } catch (error) {
      console.error('Error fetching video information:', error);
    }

  }
  
  const handleChangeFormat = event => setSelectedFormat(event.target.value); 

  const handleDownload = async () => {
    try {
      const response = await axios.post('http://localhost:3001/download', { url: videoUrl, format: selectedFormat}, { responseType: 'blob' });
      
      const blob = new Blob([response.data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = videoInfo.title+'.mp4';
      link.click();
    } catch (error) {
      console.error('Error initiating video download:', error);
    }
  };



  const handleChangeInput = (event) => {
    console.log(event.target.value)
    setVideoUrl(event.target.value)
  }
  const bestMp4Formats = filterBestMp4Formats();
  bestMp4Formats.reverse()
  console.log("this is the selected format: ",selectedFormat);
  return (
    <>

    <header>
      <div className='flexy'>
      <img src={logo} className="logo" alt="React logo" />
        <div >
        <h1>VixenDL</h1>
        <p>Download videos or audio from urls</p>
        </div>
      </div>
        <form onSubmit={submitButton}>
          <input value={videoUrl} type="text"  placeholder="Escribe la URL aquí" 
          onChange={handleChangeInput}/>
          <button type='submit' className='search'>Buscar</button>
        </form>
    </header>

    <div className="card-container">
    <div className="card">
      {
      videoInfo !=null ? 
      (
         <div className='videoInfo'>
         <img src={videoInfo.thumbnail} alt="" />
         <div className='minimi'>
         <p>{videoInfo.title}</p>
         <div className='butdur'>
           <p>duration: {videoInfo.duration_string}</p> 
        <select onChange={handleChangeFormat}> 
        {bestMp4Formats.map((format, index) => (
                      <option key={index} value={format.format_id}>
                       {format.height}p - {format.ext}
                      </option>
                    ))}
        </select>
         <button onClick={handleDownload} className='download'>Download</button>
         </div>
         </div>
         
       </div>
      ) 
      : null
      }
    </div>
  </div>

    <footer>
      <p>The singularity is near!</p>
    </footer>
 </>
  )
}

export default App
