"use client";
// src/VideoRecorder.js
import React, { useState, useRef, useMemo, useEffect } from "react";

import ObjectDetection from "./objectDetection";

import "./index.css";
import Input from "./Input/input";
import getEpoch from "./epoch";

const Kyc = () => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const removeToggle1 = useRef("");
  const boxRef = useRef([]);

  const [actionss, setActionss] = useState("");
  const [videoBlob, setVideoBlob] = useState(null);
  const [actions, setActions] = useState("");
  const [dataVideo, setDateVideo] = useState();
  const [orderId, setOrderId] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setIsCameraOn(true);
    } catch (err) {
      console.error("Error accessing media devices.", err);
      setError("Error accessing media devices: " + err.message);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      streamRef.current = null;
      setIsCameraOn(false);
    }
  };

  const handleStartRecording = () => {
    recordedChunks.current = [];
    const stream = videoRef.current.srcObject;
    if (stream) {
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "video/mp4",
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: "video/mp4" });
        setVideoBlob(blob);
        stopCamera();
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } else {
      setError("No media stream available.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const getToken = async (e) => {
    try {
      const response = await fetch(
        `https://uat.kian.digital/api-proxy/v1/auth/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: "api-client-levant",
            client_secret: "59c24382-18ac-41e5-9141-ef2dbcd2e8de",
            grant_type: "client_credentials",
            scope: "roles",
          }),
        }
      );

      // Check if the response is okay
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const json = await response.json();
      setToken(json.access_token);
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };

  useEffect(async () => {
    await getToken();
  }, []);

  const [defaultDate, setDefaultDate] = useState({
    date1: "1996-01-10",
  });

  const handleSendVideo = async (file) => {
    console.log(file);
    // if (file) {
    //   console.log(file);
    //   const formData = new FormData();
    //   formData.append("file", file, "recorded-video.mp4");
    //   const config = {
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //       "Content-Type": "multipart/form-data",
    //       charset: "utf-8",
    //     },
    //   };
    //   return await axios
    //     .post(
    //       `https://uat.kian.digital/api-proxy/v2/kyc/submit/${orderId}`,
    //       formData,
    //       config
    //     )
    //     .then((res) => {
    //       setDateVideo(res.data);
    //     });
    // }
  };

  const handleGetActios = async (id) => {
    const response = await fetch(
      `https://uat.kian.digital/api-proxy/v2/kyc/random/action/${id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const json = await response.json();
    console.log(json, "json");
  };

  const toggleCamera = () => {
    if (isCameraOn) {
      stopCamera();
    } else {
      startCamera();
    }
  };
  const isActiveRef = useRef(false);
  useEffect(() => {
    let start;
    const toggleClass = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;

      if (elapsed >= 500) {
        // Toggle class
        isActiveRef.current = !isActiveRef.current;
        if (boxRef.current[0]) {
          boxRef.current[0].className = isActiveRef.current
            ? "chip active"
            : "chip inactive";
        }
        start = timestamp; // Reset the start time
      }

      // Request the next frame
      removeToggle1.current = requestAnimationFrame(toggleClass);
    };

    // Start the animation
    removeToggle1.current = requestAnimationFrame(toggleClass);

    // Cleanup function to cancel the animation frame
    return () => {
      removeToggle1.current = cancelAnimationFrame(toggleClass);
    };
  }, []);

  const startAnimation = (id) => {
    let start;
    const toggleClass = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      if (elapsed >= 500) {
        isActiveRef.current = !isActiveRef.current;
        if (boxRef.current[id]) {
          boxRef.current[id].className = isActiveRef.current
            ? "chip active"
            : "chip inactive";
        }
        start = timestamp; // Reset the start time
      }

      // Request the next frame
      removeToggle1.current = requestAnimationFrame(toggleClass);
    };

    // Start the animation
    removeToggle1.current = requestAnimationFrame(toggleClass);
  };

  const stopAnimation = (id) => {
    if (removeToggle1.current) {
      console.log(id);
      cancelAnimationFrame(removeToggle1.current);
      boxRef.current[id].className = "chip active";
    }
  };

  const stopBtn = useMemo(() => {
    return (
      <>
        {isRecording && (
          <button onClick={handleStopRecording}>Stop Recording</button>
        )}
      </>
    );
  }, [isRecording]);

  const startRecord = useMemo(() => {
    return (
      <>
        {isCameraOn && !isRecording && (
          <button onClick={handleStartRecording}>Start Recording</button>
        )}
      </>
    );
  }, [isRecording, isCameraOn]);

  const [filterInputs, setFilterInput] = React.useState({
    nationalCode: "",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
  });

  const onChangeInput = (name) => (e) => {
    setFilterInput({ ...filterInputs, [name]: e.target.value });
  };

  const handleNext = async () => {
    console.log(token);
    const date1 = getEpoch(
      filterInputs.birthYear,
      filterInputs.birthMonth,
      filterInputs.birthDay
    );

    try {
      const response = await fetch(
        `https://uat.kian.digital/api-proxy/v2/kyc/init/HEAD_POSITIONING/${filterInputs.nationalCode}/${date1}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Check if the response is okay
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const json = await response.json();
      setOrderId(json.kycId);
      // console.log(json.action);

      const actionsArray = json.action.split(",");
      setActionss(json.action);

      // Step 2: Create a dictionary for mapping
      const actionMappings = {
        c: "center",
        l: "left",
        u: "up",
        d: "down",
        r: "right",
      };

      // Step 3: Map array to corresponding meanings
      const mappedActions = actionsArray.map(
        (action) => actionMappings[action]
      );

      console.log(mappedActions);
      setActions(mappedActions);
      // handleGetActios(json.orderId);
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };

  const [isGreen, setIsGreen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);

  useEffect(() => {
    console.log(boxRef);
  }, []);

  return (
    <div style={{ display: "flex" }}>
      {/* <div style={{ width: "500px" }}>
        <div>veryfication response:</div>
        <div>
          alivenessVerified:{dataVideo?.alivenessVerified ? "true" : "false"}
        </div>
        <div>desc: {dataVideo?.desc}</div>
        <div>
          faceVerified:{dataVideo?.faceVerified === true ? "true" : "false"}
        </div>
        <div>processTime:{dataVideo?.processTime}</div>
      </div> */}

      <div className="main">
        {orderId && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              width: "500px",
              direction: "rtl",
            }}
          >
            <Input
              title={"شماره ملي"}
              required={true}
              maxlength={10}
              onChange={onChangeInput("nationalCode")}
              value={filterInputs.nationalCode}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                gap: "12px",
              }}
            >
              <Input
                title={"روز تولد"}
                required={true}
                maxlength={2}
                onChange={onChangeInput("birthDay")}
                value={filterInputs.birthDay}
              />
              <Input
                title={"ماه تولد"}
                required={true}
                maxlength={2}
                onChange={onChangeInput("birthMonth")}
                value={filterInputs.birthMonth}
              />

              <Input
                title={"سال تولد"}
                required={true}
                maxlength={4}
                onChange={onChangeInput("birthYear")}
                value={filterInputs.birthYear}
              />
            </div>
            {/*<DatePickerInput*/}
            {/*  value={filterInputs.birthDate}*/}
            {/*  label={"تاریخ تولد"}*/}
            {/*  onChange={handleChangeBrithDate}*/}
            {/*  defaultValue={new Date("1996-01-10")}*/}
            {/*/>*/}
            <button fullWidth variant="outlined" onClick={handleNext}>
              بعدی
            </button>
          </div>
        )}

        <div className="container">
          {error && <p className="error">{error}</p>}
          <div
            style={{
              marginBottom: "30px",
              display: "flex",
              justifyContent: "center",
              marginTop: "30px",
            }}
          >
            {" "}
            حرکت های مورد انتظار
          </div>
          <div className="chipContainer">
            <div className="chip" ref={(el) => (boxRef.current[0] = el)}>
              <div class="chip-content"> center</div>
            </div>
            <div class="chip" ref={(el) => (boxRef.current[1] = el)}>
              <div class="chip-content">{actions[1]}</div>
            </div>
            <div class="chip" ref={(el) => (boxRef.current[2] = el)}>
              <div class="chip-content">{actions[2]}</div>
            </div>
            <div class="chip" ref={(el) => (boxRef.current[3] = el)}>
              <div class="chip-content">{actions[3]}</div>
            </div>
          </div>

          <ObjectDetection
            handleSendVideo={handleSendVideo}
            setVideoBlob={setVideoBlob}
            actions={actionss}
            stopAnimation={stopAnimation}
            startAnimation={startAnimation}
          />
        </div>
      </div>
    </div>
  );
};

export default Kyc;
