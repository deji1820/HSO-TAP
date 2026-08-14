import { useEffect, useRef, useState } from "react";
import WelcomeScreen from "./screens/WelcomeScreen.jsx";
import ManualEntryScreen from "./screens/ManualEntryScreen.jsx";
import ConfirmScreen from "./screens/ConfirmScreen.jsx";
import ServiceSelectScreen from "./screens/ServiceSelectScreen.jsx";
import ConsultationTypeScreen from "./screens/ConsultationTypeScreen.jsx";
import OtherServicesTypeScreen from "./screens/OtherServicesTypeScreen.jsx";
import RequestTextScreen from "./screens/RequestTextScreen.jsx";
import CheckedInScreen from "./screens/CheckedInScreen.jsx";
import ScreeningOptionsScreen from "./screens/ScreeningOptionsScreen.jsx";
import CapturingScreen from "./screens/CapturingScreen.jsx";
import ResultScreen from "./screens/ResultScreen.jsx";
import { connectDeviceBridge } from "./services/deviceBridge.js";
import { lookupStudent, submitIntake } from "./services/api.js";

const IDLE_TIMEOUT_MS = 20_000;
const isMock = import.meta.env.VITE_MOCK_HARDWARE === "true";

// Which readings each screening mode needs before we can move to the result screen
const REQUIRED_FIELDS = {
  complete: ["temperatureC", "heightCm", "weightKg"],
  temperature: ["temperatureC"],
  physical: ["heightCm", "weightKg"],
};

export default function App() {
  const [step, setStep] = useState("welcome");
  const [student, setStudent] = useState(null);
  const [captureMode, setCaptureMode] = useState(null); // "complete" | "temperature" | "physical"
  const [readings, setReadings] = useState({});
  const [overrideTriggered, setOverrideTriggered] = useState(false);

  // Which multi-step flow is currently in progress — determines what
  // finishCapture() submits and where it routes afterwards. Only relevant
  // once capture starts; "screening" for Quick Health Screening, or
  // "consultation" for the mandatory pre-consultation temp check.
  const [flowType, setFlowType] = useState(null);
  const [consultSubType, setConsultSubType] = useState(null); // "Medical" | "Dental"
  const [otherServiceSubType, setOtherServiceSubType] = useState(null); // "Prescription/OTC" | "General Inquiry"
  const [checkInInfo, setCheckInInfo] = useState(null); // shown on CheckedInScreen

  const bridgeRef = useRef(null);
  const idleTimer = useRef(null);
  const stepRef = useRef(step);
  const submittingRef = useRef(false); // guards against double-submit

  useEffect(() => { stepRef.current = step; }, [step]);

  useEffect(() => {
    bridgeRef.current = connectDeviceBridge(handleDeviceEvent);
    if (isMock) window.hsotapBridge = bridgeRef.current; // dev console access
    return () => bridgeRef.current?.close();
  }, []);

  // Watches `readings` (the real source of truth, not a ref) and fires the
  // submit once every required field for the current capture mode has
  // arrived. Using an effect here — rather than checking completeness
  // inside the event handler — avoids the stale-ref race that drops a
  // reading when two sensor events land in the same tick (e.g. height +
  // weight fired together by one button, or two ESP32 lines sent close
  // together over serial).
  useEffect(() => {
    if (step !== "capturing" || submittingRef.current) return;
    const required = REQUIRED_FIELDS[captureMode] || [];
    const isComplete = required.length > 0 && required.every((field) => readings[field] != null);
    if (isComplete) finishCapture(readings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readings, step, captureMode]);

  function resetIdleTimer() {
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => resetSession(), IDLE_TIMEOUT_MS);
  }

  function resetSession() {
    submittingRef.current = false;
    setStudent(null);
    setCaptureMode(null);
    setReadings({});
    setOverrideTriggered(false);
    setFlowType(null);
    setConsultSubType(null);
    setOtherServiceSubType(null);
    setCheckInInfo(null);
    setStep("welcome");
  }

  async function handleDeviceEvent(evt) {
    resetIdleTimer();

    if (evt.type === "rfid_tap") {
      if (stepRef.current !== "welcome") return; // ignore stray taps mid-flow
      try {
        const found = await lookupStudent(evt.uid);
        setStudent(found);
        setStep("confirm");
      } catch {
        alert(`Card not recognized (looked up "${evt.uid}"). Please try Manual Entry, or seed a matching student.`);
      }
      return;
    }

    if (stepRef.current !== "capturing") return; // sensor readings only matter mid-capture

    const fieldMap = {
      temperature_reading: { temperatureC: evt.celsius },
      height_reading: { heightCm: evt.cm },
      weight_reading: { weightKg: evt.kg },
    };
    const patch = fieldMap[evt.type];
    if (!patch) return;

    // Functional update — always merges onto the LATEST state, so two
    // events fired in the same tick both land correctly.
    setReadings((prev) => ({ ...prev, ...patch }));
  }

  // Called by ManualEntryScreen with the typed-in student ID. Deliberately
  // does NOT catch errors here — ManualEntryScreen awaits this call itself
  // so it can show an inline "not found" message without losing what the
  // student typed (unlike the RFID path, which just re-shows the welcome
  // screen via an alert).
  async function handleManualSubmit(studentId) {
    const found = await lookupStudent(studentId);
    setStudent(found);
    setStep("confirm");
  }

  function handleConfirmYes() {
    setStep("service");
  }

  function handleConfirmNo() {
    // Assumption: a mismatch is treated as "start over" rather than retry,
    // since we don't want to silently keep the wrong student record around.
    resetSession();
  }

  function handleServiceSelect(label) {
    if (label === "Quick Health Screening") {
      setFlowType("screening");
      setStep("screeningOptions");
    } else if (label === "Medical Consultation") {
      setStep("consultationType");
    } else if (label === "Medical Clearance") {
      setStep("otherServicesType");
    } else {
      // Defensive fallback — shouldn't happen given the current SERVICES list.
      submitIntake({ studentId: student.studentId, serviceType: label, source: "kiosk" }).finally(resetSession);
    }
  }

  function handleConsultTypeSelect(subType) {
    setFlowType("consultation");
    setConsultSubType(subType);
    setReadings({});
    setCaptureMode("temperature"); // reuses the existing temp-only capture screen/mode
    setStep("capturing");
  }

  function handleOtherServiceTypeSelect(subType) {
    setOtherServiceSubType(subType);
    setStep("requestText");
  }

  // Called by RequestTextScreen with the typed request. Deliberately does
  // NOT catch errors here, same reasoning as handleManualSubmit — the
  // screen awaits this itself so it can show an inline error without
  // losing what the student typed.
  //
  // NOTE: QueueEntry.serviceType enum expects "Prescription/OTC Pickup" OR
  // "General Inquiry" as distinct values — same pattern as the consultation
  // fix above. Also: there's currently no server-side field that stores the
  // full request text long-term (QueueEntry.reason is a short display
  // label, not a full record) — only a truncated preview survives. If the
  // full text needs to be retained for staff review, QueueEntry (or a new
  // model) needs a field added server-side; flagging this rather than
  // silently losing data without mention.
  async function handleRequestTextSubmit(text) {
    const serviceType = otherServiceSubType === "Prescription/OTC" ? "Prescription/OTC Pickup" : "General Inquiry";
    const reason = text.length > 60 ? `${text.slice(0, 57)}...` : text;
    const result = await submitIntake({
      studentId: student.studentId,
      serviceType,
      reason,
      source: "kiosk",
    });
    setCheckInInfo({ serviceType, queueNumber: result?.queueEntry?.queueNumber });
    setStep("checkedIn");
  }

  function handleScreeningOptionSelect(mode) {
    setCaptureMode(mode);
    setReadings({});
    setStep("capturing");
  }

  async function finishCapture(finalReadings) {
    submittingRef.current = true;
    try {
      if (flowType === "consultation") {
        // QueueEntry.serviceType enum expects "Medical Consultation" OR
        // "Dental Consultation" as distinct values — the sub-choice IS the
        // serviceType, not a separate field (schema has no room for one).
        const serviceType = consultSubType === "Dental" ? "Dental Consultation" : "Medical Consultation";
        const result = await submitIntake({
          studentId: student.studentId,
          serviceType,
          source: "kiosk",
          temperatureC: finalReadings.temperatureC,
        });
        setCheckInInfo({ serviceType, queueNumber: result?.queueEntry?.queueNumber });
        setStep("checkedIn");
        return;
      }

      const result = await submitIntake({
        studentId: student.studentId,
        serviceType: "Quick Health Screening",
        source: "kiosk",
        temperatureC: finalReadings.temperatureC,
        heightCm: finalReadings.heightCm,
        weightKg: finalReadings.weightKg,
      });
      setOverrideTriggered(!!result.overrideTriggered);
      setStep("result");
    } catch {
      alert("Something went wrong saving your reading. Please try again or see the front desk.");
      resetSession();
    }
  }

  return (
    <div onClick={resetIdleTimer}>
      {step === "welcome" && <WelcomeScreen onManualEntry={() => setStep("manual")} />}

      {step === "manual" && (
        <ManualEntryScreen onSubmit={handleManualSubmit} onCancel={resetSession} />
      )}

      {step === "confirm" && (
        <ConfirmScreen student={student} onConfirm={handleConfirmYes} onNotMe={handleConfirmNo} />
      )}

      {step === "service" && (
        <ServiceSelectScreen onSelect={handleServiceSelect} onCancel={resetSession} />
      )}

      {step === "consultationType" && (
        <ConsultationTypeScreen onSelect={handleConsultTypeSelect} onBack={() => setStep("service")} />
      )}

      {step === "otherServicesType" && (
        <OtherServicesTypeScreen onSelect={handleOtherServiceTypeSelect} onBack={() => setStep("service")} />
      )}

      {step === "requestText" && (
        <RequestTextScreen onSubmit={handleRequestTextSubmit} onBack={() => setStep("otherServicesType")} />
      )}

      {step === "checkedIn" && (
        <CheckedInScreen info={checkInInfo} onDone={resetSession} />
      )}

      {step === "screeningOptions" && (
        <ScreeningOptionsScreen onSelect={handleScreeningOptionSelect} onBack={() => setStep("service")} />
      )}

      {step === "capturing" && (
        <CapturingScreen
          mode={captureMode}
          readings={readings}
          isMock={isMock}
          bridge={bridgeRef.current}
          onCancel={resetSession}
        />
      )}

      {step === "result" && (
        <ResultScreen readings={readings} overrideTriggered={overrideTriggered} onDone={resetSession} />
      )}
    </div>
  );
}