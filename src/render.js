// Buttons
const videoElement = document.querySelector('video');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoSelectBtn = document.getElementById('videoSelectBtn');
videoSelectBtn.onclick = () => window.api.getVideoSources(selectSource);

let mediaRecorder; // MediaRecorder instance to capture footage
const recordedChunks = [];

startBtn.onclick = e => {
    mediaRecorder.start();
    startBtn.classList.add('is-danger');
    startBtn.innerText = 'Recording';
};

stopBtn.onclick = e => {
    mediaRecorder.stop();
    startBtn.classList.remove('is-danger');
    startBtn.innerText = 'Start';
};


// change the video source window to record
async function selectSource(source) {
    videoSelectBtn.innerText = source.name;

    const constraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }
        }
    };

    // Create stream
    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    // Preview the source in video element 
    videoElement.srcObject = stream;
    videoElement.play();

    // Create the media Recorder
    const options = { mimeType: 'video/webm; codecs=vp9' };
    mediaRecorder = new MediaRecorder(stream, options);

    // Register Event Handlers
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;
}

// Capture all recorded chunks
function handleDataAvailable(e) {
    console.log('Video data available');
    recordedChunks.push(e.data);
}

// Save the video file on stop
async function handleStop(e) {
    const blob = new Blob(recordedChunks, {
        type: 'video/webm; codecs=vp9'
    });

    const buffer = window.api.buffer(await blob.arrayBuffer());

    const filePath = await window.api.getFileFromDialog();
    
    if (filePath)
        window.api.write(filePath, buffer);
}
