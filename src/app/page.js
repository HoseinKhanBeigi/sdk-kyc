"use client";
// src/VideoRecorder.js
import React, { useState, useRef, useMemo, useEffect } from "react";

// import axios from "axios";
import ObjectDetection from "./objectDetection";

import "./index.css";
import Input from "./Input/input";
import getEpoch from "./epoch";

const Kyc = () => {
  const baseUrl = "https://api.levants.io";
  const [actions, setActions] = useState([]);
  const [dataVideo, setDateVideo] = useState();
  const [orderId, setOrderId] = useState("");
  const [token, setToken] = useState("");

  const getToken = async (e) => {
    try {
      const response = await fetch(`${baseUrl}/v1/auth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: "api-client-demo",
          client_secret: "21ba7936-ea0c-45ce-996d-887712f79799",
          grant_type: "client_credentials",
          scope: "roles",
        }),
      });

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

  const handleSendVideo = async (file) => {
    if (file) {
      const formData = new FormData();
      formData.append("file", file, "recorded-video.mp4");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
          charset: "utf-8",
        },
      };

      return await fetch(`${baseUrl}/v2/kyc/submit/${orderId}`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
          charset: "utf-8",
        },
      }).then((res) => {
        setDateVideo(res.data);
      });

      // return await axios
      //   .post(`${baseUrl}/v2/kyc/submit/${orderId}`, formData, config)
      //   .then((res) => {
      //     setDateVideo(res.data);
      //   });
    }
  };

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
    const birthDate = getEpoch(
      filterInputs.birthYear,
      filterInputs.birthMonth,
      filterInputs.birthDay
    );
    try {
      const response = await fetch(
        `${baseUrl}/v2/kyc/init/HEAD_POSITIONING/${filterInputs.nationalCode}/${birthDate}`,
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
      const actionsArray = json.action.split(",");
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
      setActions(mappedActions);
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      {orderId && (
        <div style={{ width: "500px", position: "absolute" }}>
          <div>veryfication response:</div>
          <div>
            alivenessVerified:{dataVideo?.alivenessVerified ? "true" : "false"}
          </div>
          <div>desc: {dataVideo?.desc}</div>
          <div>
            faceVerified:{dataVideo?.faceVerified === true ? "true" : "false"}
          </div>
          <div>processTime:{dataVideo?.processTime}</div>
        </div>
      )}

      <div className="main">
        {!orderId && (
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

            <button fullWidth variant="outlined" onClick={handleNext}>
              بعدی
            </button>
          </div>
        )}
        {orderId && (
          <div className="container">
            <ObjectDetection
              handleSendVideo={handleSendVideo}
              actions={actions}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Kyc;
