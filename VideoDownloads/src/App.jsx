import { useState, useEffect} from 'react';
import l1 from './assets/i1.jpg'
import l2 from './assets/ddd.webp'
import l3 from './assets/sss.jpg'
import axios from 'axios'
// import './App.css'


const App =()=> {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null); 
  const [cardSize, setCardSize] = useState(200); // Set an initial size for the .card div

  const filterBestMp4Formats = () => {
    const mp4Formats = videoInfo ? videoInfo.formats.filter((format) => format.ext === 'mp4' && format.audio_ext === 'none') : [];
    const bestFormatsMap = new Map();
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
      setCardSize(320); // Update the size of the .card div when videoInfo is available
    } catch (error) {
      console.error('Error fetching video information:', error);
    }

  }
  
  const handleChangeFormat = event => setSelectedFormat(event.target.value); 

  const handleDownload = async() => {
    try {
      const response = await axios.post(`http://localhost:3001/download`, {url: videoUrl});
      window.open(`http://localhost:3001/video/${videoInfo.id}`, '_blank');

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
        <p><strong>VideoDL</strong></p> 
    </header>

    <div className='titlecard'>
      <h1>Online Video Downloader</h1>
      <p>VideoDL download videos from 10,000 websites, and the list keeps growing!</p>
    </div>


    
    <div className="card-container">
    <div className="card" style={{ height:`${cardSize}px` }}>
      <div className='inputfield'>
      <form onSubmit={submitButton}>
          <input value={videoUrl} type="text"  placeholder="Escribe la URL aquí" 
          onChange={handleChangeInput}/>
          <button type='submit' className='search'>Buscar</button>
      </form>
      </div>
        
      {
      videoInfo !=null ? 
      (
         <div className='videoInfo'>
         <img src={videoInfo.thumbnail} alt="" />
         <div className='minimi'>
         <p>{videoInfo.title}</p>
         <p id='dura'>Duration: {videoInfo.duration_string}</p> 
         <div className='butdur'>
         <button onClick={handleDownload} className='download'>Download</button>
        <select onChange={handleChangeFormat}> 
        {bestMp4Formats.map((format, index) => (
                      <option key={index} value={format.format_id}>
                       {format.height}p - {format.ext}
                      </option>
                    ))}
        </select>
         </div>
         </div>

         
       </div>
      ) 
      : null
      }
    </div>
   

  </div>
  <footer><p>© 2024 VideoDl | The singularity is near!</p></footer>

 </>
  )
}

export default App
