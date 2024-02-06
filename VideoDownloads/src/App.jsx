import { useState, useEffect} from 'react';
import logo from './assets/logo.jpg'
import axios from 'axios'
// import './App.css'

const App =()=> {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);

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

  const handleDownload = async () => {
    try {
      const response = await axios.post('http://localhost:3001/download', { url: videoUrl }, { responseType: 'blob' });
      
      const blob = new Blob([response.data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'downloaded-video.webm';
      link.click();
    } catch (error) {
      console.error('Error initiating video download:', error);
    }
  };



  const handleChangeInput = (event) => {
    console.log(event.target.value)
    setVideoUrl(event.target.value)
  }
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
           <p>duration: {videoInfo.duration}</p> 
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
