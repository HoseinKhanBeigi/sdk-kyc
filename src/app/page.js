"use client";

// src/ObjectDetection.js
import React, { useEffect, useRef, useState } from "react";
// import FaceMesh from "./"
import "./index2.css";

const ObjectDetection = () => {
  const requestAnimation = useRef("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef();

  const [isFaceInCenter, setIsFaceInCenter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState("");
  const [grid, setGrid] = useState(
    Array(3)
      .fill(null)
      .map(() => Array(3).fill("0,0"))
  );

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoRef.current.srcObject = stream;
        // streamRef.current = stream;
        setIsCameraOn(true);
      } catch (err) {
        console.error("Error accessing media devices.", err);
        setError("Error accessing media devices: " + err.message);
      }
    };
    startVideo();
  }, []);

  useEffect(() => {
    const loadFaceMesh = async () => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh";
      script.async = true;
      document.body.appendChild(script);

      script.onload = async () => {
        const { FaceMesh } = window;

        const faceMesh = new FaceMesh({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        const video = videoRef.current;
        const container = containerRef.current;

        const onResults = (results) => {
          if (results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];
            const Lefteye = landmarks[33];
            const rightEyebrowEnd1 = landmarks[105]; // End of left eyebrow
            const Righteyebrow = landmarks[52];
            const leftEyebrowEnd = landmarks[105]; // End of left eyebrow
            const rightEyebrowEnd = landmarks[334]; // End of right eyebrow
            const leftNose = landmarks[4]; // Left of nose
            const noseTip = landmarks[1]; // Nose tip
            const rightNose = landmarks[278]; // Right of nose
            const leftCheek = landmarks[234]; // Left cheek
            const rightCheek = landmarks[454]; // Right cheek

            const midEyebrows = {
              x: (leftEyebrowEnd.x + rightEyebrowEnd.x) / 2,
              y: (leftEyebrowEnd.y + rightEyebrowEnd.y) / 2,
            };
            const midCheeks = {
              x: (leftCheek.x + rightCheek.x) / 2,
              y: (leftCheek.y + rightCheek.y) / 2,
            };

            const points = [
              leftEyebrowEnd,
              midEyebrows,
              rightEyebrowEnd,
              leftNose,
              noseTip,
              rightNose,
              leftCheek,
              midCheeks,
              rightCheek,
            ];

            const leftEyebrowEndX = leftEyebrowEnd.x * video.width;

            // console.log(leftEyebrowEndX, "leftEyebrowEndX");
            const leftEyebrowEndY = leftEyebrowEnd.y * video.height;
            const rightEyebrowEndX = rightEyebrowEnd.x * video.width;

            const rightEyebrowEndY = rightEyebrowEnd.y * video.height;
            const leftNoseX = leftNose.x * video.width;
            const leftNoseY = leftNose.y * video.height;
            const noseTipX = noseTip.x * video.width;
            const noseTipY = noseTip.y * video.height;
            const rightNoseX = rightNose.x * video.width;
            const rightNoseY = rightNose.y * video.height;
            const leftCheekX = leftCheek.x * video.width;
            const leftCheekY = leftCheek.y * video.height;
            const rightCheekX = rightCheek.x * video.width;
            const rightCheekY = rightCheek.y * video.height;

            const midEyebrowX = (leftEyebrowEndX + rightEyebrowEndX) / 2;
            const midEyebrowY = (leftEyebrowEndY + rightEyebrowEndY) / 2;
            const midNoseX = (leftNoseX + rightNoseX) / 2;
            const midNoseY = (leftNoseY + rightNoseY) / 2;
            const midCheekX = (leftCheekX + rightCheekX) / 2;
            const midCheekY = (leftCheekY + rightCheekY) / 2;

            const canvasCenterX = video.width / 2;
            const canvasCenterY = video.height / 2;
            const tolerance = 50; // Adjust tolerance as needed

            let headPosition = "";

            // console.log(noseTip, "noseTip");

            if (
              Math.abs(midEyebrowX - canvasCenterX) < tolerance &&
              Math.abs(midEyebrowY - canvasCenterY) < tolerance &&
              Math.abs(midNoseX - canvasCenterX) < tolerance &&
              Math.abs(midNoseY - canvasCenterY) < tolerance &&
              Math.abs(midCheekX - canvasCenterX) < tolerance &&
              Math.abs(midCheekY - canvasCenterY) < tolerance
            ) {
              headPosition = "center";
            } else {
              if (midEyebrowX < canvasCenterX - tolerance) {
                headPosition = "left";
                setDirection("left");
                container.classList.add("correct");
                container.classList.remove("wrong");
              } else if (midEyebrowX > canvasCenterX + tolerance) {
                headPosition = "right";
                setDirection("right");
                container.classList.add("correct");
                container.classList.remove("wrong");
              }
              if (midEyebrowY < canvasCenterY - tolerance) {
                headPosition += " up";
                setDirection("up");
                container.classList.add("correct");
                container.classList.remove("wrong");
              } else if (midEyebrowY > canvasCenterY + tolerance) {
                headPosition += " down";
                setDirection("down");
                container.classList.add("correct");
                container.classList.remove("wrong");
              } else {
                container.classList.remove("correct");
                container.classList.add("wrong");
              }
            }

            // console.log(headPosition);
          }
        };

        faceMesh.onResults(onResults);

        videoRef.current.addEventListener("loadeddata", async () => {
          const detect = async () => {
            await faceMesh.send({ image: videoRef.current });
            requestAnimation.current = window.requestAnimationFrame(detect);
          };
          await detect();
        });
      };
    };

    loadFaceMesh();

    return window.cancelAnimationFrame(requestAnimation.current);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const video = videoRef.current;
      // const video = canvasRef.current;
      // const container = video.parentNode;
      const containerWidth = video.offsetWidth;
      const containerHeight = video.offsetHeight;
      video.width = containerWidth;
      video.height = containerHeight;
      // canvas.width = containerWidth;
      // canvas.height = containerHeight;
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // Initial resize
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="detection-container">
      <div className="video-container" ref={containerRef}>
        <video ref={videoRef} autoPlay={true} playsInline={true} muted={true} />

        {/* <div className="crosshair">
          <div className="vertical-line"></div>
          <div className="horizontal-line"></div>
        </div> */}

        <FaceRecognize />
        {/* <canvas ref={canvasRef} /> */}
      </div>
    </div>
  );
};

export default ObjectDetection;

const UpIcon = () => {
  return (
    <svg
      className="UpIcon"
      height="512px"
      version="1.1"
      viewBox="0 0 512 512"
      width="512px"
      xmlSpace="preserve"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <style type="text/css"></style>
      <g class="st2" id="layer">
        <g class="st0">
          <polyline class="st1" points="256,101 105,252 256,101 407,252   " />
          <polyline class="st1" points="256,260 105,411 256,260 407,411   " />
        </g>
      </g>
      <g id="layer_copy">
        <g>
          <g>
            <path
              fill="white"
              d="M407,260c-2.048,0-4.095-0.781-5.657-2.343L256,112.314L110.657,257.657c-3.124,3.123-8.189,3.123-11.313,0     C97.781,256.095,97,254.047,97,252s0.781-4.095,2.343-5.657l151-151c3.125-3.124,8.19-3.123,11.314,0l151,151     c3.124,3.124,3.124,8.189,0,11.314C411.095,259.219,409.048,260,407,260z"
            />
          </g>
          <g>
            <path
              fill="white"
              d="M407,419c-2.048,0-4.095-0.781-5.657-2.343L256,271.313L110.657,416.657c-3.124,3.123-8.189,3.123-11.313,0     C97.781,415.095,97,413.048,97,411s0.781-4.095,2.343-5.657l151-151c3.125-3.124,8.19-3.124,11.314,0l151,151     c3.124,3.125,3.124,8.189,0,11.314C411.095,418.219,409.048,419,407,419z"
            />
          </g>
        </g>
      </g>
    </svg>
  );
};

const DownIcon = () => {
  return (
    <svg
      className="DownIcon"
      height="512px"
      version="1.1"
      viewBox="0 0 512 512"
      width="512px"
      color="red"
      xmlSpace="preserve"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <g class="st2" id="layer">
        <g class="st0">
          <polyline class="st1" points="256,411 105,260 256,411 407,260   " />
          <polyline class="st1" points="256,252 105,101 256,252 407,101   " />
        </g>
      </g>
      <g id="layer_copy">
        <g>
          <path
            fill="white"
            d="M256,419c-2.047,0-4.095-0.781-5.657-2.343l-151-151C97.781,264.095,97,262.048,97,260s0.781-4.095,2.343-5.657    c3.124-3.124,8.189-3.124,11.313,0L256,399.687l145.343-145.343c3.125-3.124,8.189-3.124,11.314,0    c3.124,3.125,3.124,8.189,0,11.314l-151,151C260.095,418.219,258.048,419,256,419z"
          />
        </g>
        <g>
          <path
            fill="white"
            d="M256,260c-2.047,0-4.095-0.781-5.657-2.343l-151-151C97.781,105.095,97,103.047,97,101s0.781-4.095,2.343-5.657    c3.124-3.124,8.189-3.124,11.313,0L256,240.686L401.343,95.343c3.125-3.124,8.189-3.124,11.314,0    c3.124,3.124,3.124,8.189,0,11.313l-151,151C260.095,259.219,258.048,260,256,260z"
          />
        </g>
      </g>
    </svg>
  );
};

const LeftIcon = () => {
  return (
    <svg
      className="LeftIcon"
      height="512px"
      version="1.1"
      viewBox="0 0 512 512"
      width="512px"
      xmlSpace="preserve"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXssslink="http://www.w3.org/1999/xlink"
    >
      <style type="text/css"></style>
      <g class="st2" id="layer">
        <g class="st0">
          <polyline class="st1" points="101,256 252,407 101,256 252,105   " />
          <polyline class="st1" points="260,256 411,407 260,256 411,105   " />
        </g>
      </g>
      <g id="layer_copy">
        <g>
          <path d="M252,415c-2.047,0-4.095-0.781-5.657-2.343l-151-151C93.781,260.095,93,258.048,93,256c0-2.047,0.781-4.095,2.343-5.657    l151-151c3.124-3.124,8.189-3.124,11.314,0c3.124,3.124,3.124,8.189,0,11.313L112.314,256l145.343,145.343    c1.562,1.563,2.343,3.609,2.343,5.657s-0.781,4.095-2.343,5.657C256.095,414.219,254.047,415,252,415z" />
        </g>
        <g>
          <path d="M411,415c-2.048,0-4.095-0.781-5.657-2.343l-151-151C252.781,260.095,252,258.048,252,256    c0-2.047,0.781-4.095,2.343-5.657l151-151c3.125-3.124,8.189-3.124,11.314,0c3.124,3.124,3.124,8.189,0,11.313L271.313,256    l145.344,145.343c1.562,1.563,2.343,3.609,2.343,5.657s-0.781,4.095-2.343,5.657C415.095,414.219,413.048,415,411,415z" />
        </g>
      </g>
    </svg>
  );
};

const RightIcon = () => {
  return (
    <svg
      className="RightIcon"
      height="512px"
      version="1.1"
      viewBox="0 0 512 512"
      width="512px"
      xmlSpace="preserve"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <style type="text/css"></style>
      <g class="st2" id="layer">
        <g class="st0">
          <polyline class="st1" points="411,256 260,407 411,256 260,105   " />
          <polyline class="st1" points="252,256 101,407 252,256 101,105   " />
        </g>
      </g>
      <g id="layer_copy">
        <g>
          <path d="M260,415c-2.048,0-4.095-0.781-5.657-2.343C252.781,411.095,252,409.048,252,407s0.781-4.095,2.343-5.657L399.687,256    L254.343,110.657c-3.125-3.124-3.125-8.189,0-11.313c3.124-3.124,8.189-3.124,11.314,0l151,151    c1.562,1.562,2.343,3.609,2.343,5.657c0,2.048-0.781,4.095-2.343,5.657l-151,151C264.095,414.219,262.048,415,260,415z" />
        </g>
        <g>
          <path d="M101,415c-2.047,0-4.095-0.781-5.657-2.343C93.781,411.095,93,409.048,93,407s0.781-4.095,2.343-5.657L240.686,256    L95.343,110.657c-3.125-3.124-3.125-8.189,0-11.313c3.124-3.124,8.189-3.124,11.313,0l151,151    c1.562,1.562,2.343,3.609,2.343,5.657c0,2.048-0.781,4.095-2.343,5.657l-151,151C105.095,414.219,103.047,415,101,415z" />
        </g>
      </g>
    </svg>
  );
};

const FaceRecognize = () => {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "80%",
        maxWidth: "450px",
      }}
    >
      <svg
        style={{
          width: "100%",
          height: "auto",
        }}
        width="400"
        height="400"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1="30" y1="30" x2="70" y2="30" stroke="black" stroke-width="1" />
        <line x1="30" y1="30" x2="30" y2="70" stroke="black" stroke-width="1" />

        <line
          x1="170"
          y1="30"
          x2="130"
          y2="30"
          stroke="black"
          stroke-width="1"
        />
        <line
          x1="170"
          y1="30"
          x2="170"
          y2="70"
          stroke="black"
          stroke-width="1"
        />

        <line
          x1="30"
          y1="170"
          x2="70"
          y2="170"
          stroke="black"
          stroke-width="1"
        />
        <line
          x1="30"
          y1="170"
          x2="30"
          y2="130"
          stroke="black"
          stroke-width="1"
        />

        <line
          x1="170"
          y1="170"
          x2="130"
          y2="170"
          stroke="black"
          stroke-width="1"
        />
        <line
          x1="170"
          y1="170"
          x2="170"
          y2="130"
          stroke="black"
          stroke-width="1"
        />
      </svg>
    </div>
  );
};
