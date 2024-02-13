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
    } catch (error) {
      console.error('Error fetching video information:', error);
    }

  }
  
  const handleChangeFormat = event => setSelectedFormat(event.target.value); 

  const handleDownload = async () => {
    try {
        window.open(`http://localhost:3001/download?url=${videoUrl}`, '_blank');


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
      <p>VixenDL.io download videos from more than 10,000 websites</p>
    </div>


    
    <div className="card-container">
    <div className="card">
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
      <div className='aboutPa'>
        <h1 id='free'>Free Online Video Downloader</h1>
        <p id='onlinet'>An online tool where you can download videos from Youtube, Facebook, Twitter(X), etc. From the same place.</p>
        
        <div className='ddd'>
          <div>
          <h2 id='downl1'>Download videos from 10,000</h2>
          <p id='downl2'>Download Video from 10,000 Sites Capture online videos fast & easily from YouTube, Facebook, Vimeo, Dailymotion, Twitch, LiveLeak, Veoh, local and more sites. The list is consistently updated! Get clips, videos, films, TV shows, series, movies, how-to's, gameplays, cartoons, reviews, etc. from the Internet.</p>
          </div>
        <img src={l1} alt="" />
        </div>
        <div className='ddd'>
          <img src={l2} alt="" />
          <div>
          <h2 id='downl1'>Download Youtube videos in any Format</h2>
          <p id='downl2'>This services enables users to download YouTube videos in a variety of formats such as MP4, WebM, 3GP, Flash FLV, AVI, MKV, WMV, PSP, iPhone, Android, Amazon Kindle Fire, and more. <s>You can save multiple videos or files simultaneously.</s> . The original video quality is maintained throughout the download process.</p>
          </div>
        
        </div>
        <div className='ddd'>
          <div>
          <h2 id='downl1'>Lorem Ipsum it shta</h2>
          <p id='downl2'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae nisi in nisi ornare maximus efficitur ac orci. Sed erat dolor, pharetra et pulvinar dictum, auctor a mauris. Praesent eros lorem, consectetur sollicitudin nunc ut, congue vehicula felis. Vestibulum a ultricies erat.</p>
          </div>
        <img src={l3} alt="" />
        </div>

        <h2 id='yout'></h2>
        <p id='yt'></p>

      </div>

  </div>
  <footer><p>© 2024 VideoDl | The singularity is near!</p></footer>

 </>
  )
}

export default App
