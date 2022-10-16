import React, { createRef, useEffect, useMemo, useState } from 'react';
import { saveAs } from 'file-saver';
import './style.css'

function App() {
  const [stream, setStream] = useState(null as null|MediaStream)
  const [data, setData] = useState([] as Blob[])
  const mediaRecorder = useMemo(()=> stream
   ? new MediaRecorder(stream, {
    audioBitsPerSecond: 128000,
    videoBitsPerSecond: 6000000,
    mimeType: "video/webm"
  })
   : null, [stream])

  const videoElement = createRef<HTMLVideoElement>()

  useEffect(()=>{
    if(!videoElement.current || !stream) return
    videoElement.current.src = ""
    videoElement.current.srcObject = stream
  },[stream])

  useEffect(()=>{
    if(!mediaRecorder) return
    mediaRecorder.start()
    mediaRecorder.ondataavailable = e => {
      setData(data=>[...data, e.data])
    }
    mediaRecorder.onstop = e => {
      stopRecording()
      if(!videoElement.current) return
      videoElement.current.srcObject = null
      setData(data=>{
        if(!videoElement.current) return data
        videoElement.current.src = URL.createObjectURL(new Blob(data, {type: data[0].type}))
        return data
      })
    }
  },[mediaRecorder])

  const startRecording = async ()=>{
    const s = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    })
    if(!s) return
    setStream(s)
    document.title = "Recording - QuikCap"
    setData([])
  }

  const stopRecording = () => {
    document.title = "QuikCap"
    if(!stream) return
    stream.getTracks().forEach(track => {
      track.stop();
    });
  }

  const saveFile = () => {
    console.log(data[0].type)
    const blob = new Blob(data, {type: data[0].type})
    new MediaMetadata()
    saveAs(blob, `QuikCap ${new Date().valueOf()}.webm`)
  }

  return (
    <div className="App">
      <header>
        <h1>QuikCap</h1>
        <span>Screen Capture on the web</span>
      </header>
      <main>
        {mediaRecorder 
          ? <video ref={videoElement} autoPlay={stream?.active} muted={stream?.active} controls={!stream?.active}></video>
          : <div className="vidHelper">
            <h1>Start recording using the 🔴 button!</h1>
          </div>
        }
        <div className="statusBar">
          {stream?.active
            ? <input type="button" value="⬜" onClick={stopRecording}/>
            : <input type="button" value="🔴" onClick={startRecording}/>
          }
          <input type="button" value="⭳" disabled={stream?.active || !mediaRecorder} onClick={saveFile}  />
        </div>
      </main>
      
    </div>
  );
}

export default App;
