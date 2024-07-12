// lib/faceMesh.js

const loadFaceMesh = () => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh";
    script.async = true;
    script.onload = () => {
      resolve(window.FaceMesh);
    };
    script.onerror = (error) => {
      reject(new Error(`Failed to load MediaPipe Face Mesh: ${error.message}`));
    };
    document.body.appendChild(script);
  });
};

export default loadFaceMesh;
