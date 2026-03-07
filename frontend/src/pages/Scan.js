import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ScannerStyles.css"; // We will make this simple CSS next

export default function Scan() {
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
          // We assume we wrote the Plant ID as plain text
          const plantId = decoder.decode(record.data);
          setStatus(`Found plant! Loading...`);
          
          // Redirect to the dashboard with the plant ID in the URL query
          // We will update Home.js to look for this ID and open the modal automatically
          navigate(`/?open=${plantId}`);
        }
      };

    } catch (err) {
      setError("Scan failed: " + err.message);
    }
  }

  return (
    <div className="scan-container">
      <h1>NFC Scanner 📡</h1>
      <div className="scan-circle">
        <span style={{fontSize: '50px'}}>📲</span>
      </div>
      <p className="scan-status">{status}</p>
      {error && <p className="scan-error">{error}</p>}
      
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