const APP_ID = '518e76f2e7fe42d5b62a342a578c883f'
const TOKEN = sessionStorage.getItem('token')
const CHANNEL = sessionStorage.getItem('room')
let UID = sessionStorage.getItem('UID')

let NAME = sessionStorage.getItem('name')

//For deaf/non-deaf type
let TYPE = sessionStorage.getItem('type')
console.log(NAME)
console.log(TYPE)

const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })

let localTracks = []
let remoteUsers = {}

let joinAndDisplayLocalStream = async() => {
    document.getElementById('room-name').innerText = CHANNEL

    client.on('user-published', handleUserJoined)
    client.on('user-left', handleUserLeft)

    try {
        UID = await client.join(APP_ID, CHANNEL, TOKEN, UID)
    } catch (error) {
        console.error(error)
        window.open('/', '_self')
    }



    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()

    let member = await createMember()

    let player = `<div  class="video-container" id="user-container-${UID}">
                     <div class="video-player" id="user-${UID}"></div>
                     <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
                  </div>`

    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
    localTracks[1].play(`user-${UID}`)
    await client.publish([localTracks[0], localTracks[1]])

    //let response = await fetch('/speech_to_text/', {})
}

//join And Display Local Stream For Deaf
let joinAndDisplayLocalStreamForDeaf = async() => {
    document.getElementById('room-name').innerText = CHANNEL

    client.on('user-published', handleUserJoined)
    client.on('user-left', handleUserLeft)

    try {
        UID = await client.join(APP_ID, CHANNEL, TOKEN, UID)
    } catch (error) {
        window.open('/', '_self')
    }

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()

    let member = await createMember()

    let player = `<div  class="video-container" id="user-container-${UID}">
                             <div class="video-player" id="user-${UID}"></div>
                             <div class="username-wrapper"><span class="user-name">${member.name}</span> : Enabled Deaf mode
                             </div> 
                          </div>`

    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
    localTracks[1].play(`user-${UID}`)
    await client.publish([localTracks[0], localTracks[1]])
}

//join And Display Local Stream For Non deaf
let joinAndDisplayLocalStreamForNonDeaf = async() => {
    document.getElementById('room-name').innerText = CHANNEL

    client.on('user-published', handleUserJoined)
    client.on('user-left', handleUserLeft)

    try {
        UID = await client.join(APP_ID, CHANNEL, TOKEN, UID)
    } catch (error) {
        console.error(error)
        window.open('/', '_self')
    }

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()

    let member = await createMember()

    let player = `<div  class="video-container" id="user-container-${UID}">
                             <div class="video-player" id="user-${UID}"></div>
                             <div class="username-wrapper"><span class="user-name">${member.name}</span> : Enabled Non Deaf mode</div>
                          </div>`

    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
    localTracks[1].play(`user-${UID}`)
    await client.publish([localTracks[0], localTracks[1]])

    //Speech Recognition
    var speech = true;
    window.SpeechRecognition = window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    const words = document.querySelector('.words');
    words.appendChild(p);

    //remove async
    recognition.addEventListener('result', async e => {
        const transcript = Array.from(e.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('')

        document.getElementById("p").innerHTML = transcript;
        console.log(transcript);

        let response = await fetch(`/speech_to_text/?UID=${UID}&room_name=${CHANNEL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 'transcript': transcript })
        })

        console.log(response)

    });

    if (speech == true) {
        recognition.start();
        recognition.addEventListener('end', recognition.start);
    }




}

let handleUserJoined = async(user, mediaType) => {

    remoteUsers[user.uid] = user
    await client.subscribe(user, mediaType)

    // const base64Data = user.audioTrack
    // console.log(base64Data)

    //let infomationForSpeechToText = await speechToText(convertedAudio)

    if (mediaType === 'video') {
        let player = document.getElementById(`user-container-${user.uid}`)
        if (player != null) {
            player.remove()
        }

        let member = await getMember(user)
        let user_type = member.type
        console.log(user_type)

        player = `<div  class="video-container" id="user-container-${user.uid}">
            <div class="video-player" id="user-${user.uid}"></div>
            <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
        </div>`

        playerForDeaf = `<div  class="video-container" id="user-container-${user.uid}">
        <div class="video-player" id="user-${user.uid}"></div>
        <div class="username-wrapper"><span class="user-name">${member.name}</span>:Deaf person</div>
        </div>`

        playerForNonDeaf = `<div  class="video-container" id="user-container-${user.uid}">
        <div class="video-player" id="user-${user.uid}"></div>
        <div class="username-wrapper"><span class="user-name">${member.name}</span>:Non deaf person</div>
        <div style=" position: absolute;top: 440px; left: 110px; z-index: 9999;background-color: rgba(255, 0, 0, 0.3);width: fit-content;padding: 10px;border-radius: 5px;color: #fff;font-size: 14px;"> ${member.transcript} </div>
        </div>`

        if (user_type === 'deaf') {
            document.getElementById('video-streams').insertAdjacentHTML('beforeend', playerForDeaf)
        } else if (user_type === 'nDeaf') {
            document.getElementById('video-streams').insertAdjacentHTML('beforeend', playerForNonDeaf)
        } else {
            document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
        }
        user.videoTrack.play(`user-${user.uid}`)
    }

    if (mediaType === 'audio') {
        user.audioTrack.play()
    }

    var speech = true;
    window.SpeechRecognition = window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.interimResults = true;
    const words = document.querySelector('.words');
    words.appendChild(p);

    recognition.addEventListener('result', e => {
        const transcript = Array.from(e.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('')

        document.getElementById("p").innerHTML = transcript;
        console.log(transcript);
    });

    if (speech == true) {
        recognition.start();
        recognition.addEventListener('end', recognition.start);
    }

}

let handleUserLeft = async(user) => {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
}

let leaveAndRemoveLocalStream = async() => {
    for (let i = 0; localTracks.length > i; i++) {
        localTracks[i].stop()
        localTracks[i].close()
    }

    await client.leave()
        //This is somewhat of an issue because if user leaves without actaull pressing leave button, it will not trigger
    deleteMember()
    window.open('/', '_self')
}

let toggleCamera = async(e) => {
    console.log('TOGGLE CAMERA TRIGGERED')
    if (localTracks[1].muted) {
        await localTracks[1].setMuted(false)
        e.target.style.backgroundColor = '#fff'
    } else {
        await localTracks[1].setMuted(true)
        e.target.style.backgroundColor = 'rgb(255, 80, 80, 1)'
    }
}

let toggleMic = async(e) => {
    console.log('TOGGLE MIC TRIGGERED')
    if (localTracks[0].muted) {
        await localTracks[0].setMuted(false)
        e.target.style.backgroundColor = '#fff'
    } else {
        await localTracks[0].setMuted(true)
        e.target.style.backgroundColor = 'rgb(255, 80, 80, 1)'
    }
}

let createMember = async() => {
    let response = await fetch('/create_member/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'name': NAME, 'room_name': CHANNEL, 'UID': UID, 'type': TYPE })
    })
    let member = await response.json()
    return member
}

let getMember = async(user) => {
    let response = await fetch(`/get_member/?UID=${user.uid}&room_name=${CHANNEL}`)
    let member = await response.json()
    return member
}

let deleteMember = async() => {
    let response = await fetch('/delete_member/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'name': NAME, 'room_name': CHANNEL, 'UID': UID })
    })
    let member = await response.json()
}













let binaryToBase64 = async(audioFile) => {

    var decodedImageData = btoa(audioFile); // the actual conversion of data from binary to base64 format
    return decodedImageData

}


let speechToText = async(convertedAudio) => {
    let response = await fetch('/speech_to_text/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'mydata': convertedAudio })
    })


    //let subtitle = await response.json()
    //return subtitle
}











window.addEventListener("beforeunload", deleteMember);

if (TYPE === 'deaf') {
    joinAndDisplayLocalStreamForDeaf()
} else if (TYPE === 'nDeaf') {
    joinAndDisplayLocalStreamForNonDeaf()
} else {
    joinAndDisplayLocalStream()
}

document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream)
document.getElementById('camera-btn').addEventListener('click', toggleCamera)
document.getElementById('mic-btn').addEventListener('click', toggleMic)