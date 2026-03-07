import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NfcReader() {
  const [status, setStatus] = useState("Tap 'Start' to scan a plant tag...");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function startScan() {
    if (!("NDEFReader" in window)) {
      setError("NFC is not supported on this device/browser. Try Chrome on Android.");
      return;
    }

    try {
      const ndef = new window.NDEFReader();
      await ndef.scan();
      setStatus("Scanning... Tap your phone to a plant tag!");

      ndef.onreading = (event) => {
        const decoder = new TextDecoder();
        for (const record of event.message.records) {
          const plantId = decoder.decode(record.data);
          setStatus(`Found plant! Loading...`);
          navigate(`/?open=${plantId}`);
        }
      };

    } catch (err) {
      setError("Scan failed: " + err.message);
    }
  }

  return (
    <div style={{ textAlign: 'center', padding: '50px 20px', color: 'white' }}>
      <h1>NFC Scanner 📡</h1>
      <div style={{ fontSize: '80px', margin: '30px 0' }}>📲</div>
      <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>{status}</p>
      {error && <p style={{ color: '#ef4444', padding: '10px', border: '1px solid #ef4444' }}>{error}</p>}
      
      <button onClick={startScan} className="btn btn--primary btn--large">
        START SCANNING
      </button>
      <br/><br/>
      <button onClick={() => navigate('/')} className="btn btn--ghost">
        Back to Garden
      </button>
    </div>
  );
}