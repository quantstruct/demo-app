
# Media Processing and Call Handling

This document provides a technical overview of media processing capabilities, SIP signaling, and advanced call handling features within our platform. It is intended for developers and VoIP engineers who need to implement complex call flows and media processing logic.

## Table of Contents

1.  [Media Formats](#media-formats)
2.  [SIP Protocol Details](#sip-protocol-details)
3.  [Call Recording](#call-recording)
4.  [DTMF Handling](#dtmf-handling)
5.  [Voice Processing](#voice-processing)
6.  [Related Endpoints](#related-endpoints)

## 1. Media Formats

Our platform supports a variety of audio and video codecs to ensure compatibility and flexibility.

**Supported Audio Codecs:**

| Codec  | Description                               | Sample Rate (kHz) | Bitrate (kbps) |
| ------ | ----------------------------------------- | ----------------- | -------------- |
| PCMU   | G.711 u-law                               | 8                 | 64             |
| PCMA   | G.711 A-law                               | 8                 | 64             |
| G.722  | Wideband voice codec                      | 16                | 64             |
| G.729  | Low bitrate voice codec                   | 8                 | 8              |
| Opus   | Highly versatile audio codec              | 8, 12, 16, 24, 48 | 6-510          |

**Supported Video Codecs:**

| Codec  | Description                               | Resolution        | Frame Rate (fps) |
| ------ | ----------------------------------------- | ----------------- | -------------- |
| H.264  | Advanced Video Coding                     | CIF, VGA, 720p    | 15, 30         |
| VP8    | Open and royalty-free video codec         | CIF, VGA, 720p    | 15, 30         |

**Example Configuration (SIP SDP):**

```
m=audio 5000 RTP/AVP 0 8 101
a=rtpmap:0 PCMU/8000
a=rtpmap:8 PCMA/8000
a=rtpmap:101 telephone-event/8000
a=fmtp:101 0-15
```

This SDP snippet indicates support for PCMU, PCMA, and DTMF (telephone-event) audio codecs.

## 2. SIP Protocol Details

Our platform utilizes the Session Initiation Protocol (SIP) for call signaling. Understanding the SIP message flow is crucial for debugging and implementing advanced call features.

**Key SIP Messages:**

*   **INVITE:** Initiates a new call.
*   **ACK:** Acknowledges a 2xx response to an INVITE.
*   **BYE:** Terminates a call.
*   **CANCEL:** Cancels a pending INVITE request.
*   **OPTIONS:** Queries the capabilities of a SIP endpoint.
*   **REGISTER:** Registers a user agent with a SIP server.

**Example SIP INVITE Message:**

```
INVITE sip:user2@example.com SIP/2.0
Via: SIP/2.0/UDP 192.168.1.100:5060;branch=z9hG4bK776asdhds
From: "User1" <sip:user1@example.com>;tag=49583
To: <sip:user2@example.com>
Call-ID: b892uiasdhfiuehfd89
CSeq: 1 INVITE
Contact: <sip:user1@192.168.1.100:5060>
Content-Type: application/sdp
Content-Length: ...

v=0
o=user1 5365423 2353687637 IN IP4 192.168.1.100
s=SIP Call
c=IN IP4 192.168.1.100
t=0 0
m=audio 5000 RTP/AVP 0 8 101
a=rtpmap:0 PCMU/8000
a=rtpmap:8 PCMA/8000
a=rtpmap:101 telephone-event/8000
a=fmtp:101 0-15
```

This example shows a basic SIP INVITE message with SDP payload describing the media capabilities of the caller.

## 3. Call Recording

Our platform allows you to record calls for compliance, training, or quality assurance purposes.

**API Endpoint:** `/api/v1/Calls/{callId}/record`

**Request Parameters:**

*   `callId`: The unique identifier of the call to record.
*   `action`: `start` or `stop` to begin or end recording.

**Example Code (Python):**

```python
import requests

call_id = "your_call_id"
api_key = "your_api_key"
action = "start"

url = f"https://api.example.com/api/v1/Calls/{call_id}/record?action={action}"
headers = {"Authorization": f"Bearer {api_key}"}

response = requests.post(url, headers=headers)

if response.status_code == 200:
    print("Call recording started successfully.")
else:
    print(f"Error starting call recording: {response.status_code} - {response.text}")
```

**Recording Format:**  Recordings are typically stored in MP3 format.  The specific format can be configured in your account settings.

## 4. DTMF Handling

Our platform supports both in-band and out-of-band DTMF (Dual-Tone Multi-Frequency) signaling.

**DTMF Methods:**

*   **In-band:** DTMF tones are transmitted as audio within the media stream.
*   **Out-of-band (RFC 2833/4733):** DTMF tones are transmitted as RTP events.

**Configuration:**

The preferred DTMF method can be configured in the SIP SDP using the `telephone-event` payload type.

**Example (RFC 2833):**

```
m=audio 5000 RTP/AVP 0 101
a=rtpmap:0 PCMU/8000
a=rtpmap:101 telephone-event/8000
a=fmtp:101 0-15
```

**Receiving DTMF Events:**

DTMF events are typically received as RTP packets with the payload type specified in the `rtpmap` attribute (e.g., 101 in the example above).  Your application needs to parse these RTP packets to extract the DTMF digit.

## 5. Voice Processing

Our platform offers various voice processing capabilities, including:

*   **Text-to-Speech (TTS):** Convert text into spoken audio.
*   **Automatic Speech Recognition (ASR):** Convert spoken audio into text.
*   **Voice Activity Detection (VAD):** Detect the presence or absence of speech in an audio stream.

**Example (TTS API):**

```
POST /api/v1/MediaFiles/tts

{
  "text": "Hello, welcome to our service.",
  "voice": "en-US-Standard-A",
  "outputFormat": "mp3"
}
```

This API call converts the text "Hello, welcome to our service." into an MP3 audio file using the "en-US-Standard-A" voice.  The API returns the URL of the generated media file.

## 6. Related Endpoints

*   **/api/v1/Calls:**  Used for initiating and managing calls.
*   **/api/v1/CallStatus:**  Provides real-time status information about active calls.
*   **/api/v1/MediaFiles:**  Used for managing media files, including recordings and TTS output.
