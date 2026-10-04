"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { createBarcodeReaderHints } from "@/lib/admin/barcode-formats";
import type { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";

type BarcodeScannerProps = {
  onDetected: (code: string) => void | Promise<void>;
  onClose: () => void;
};

function cameraErrorMessage(error: unknown) {
  const name = typeof error === "object" && error !== null && "name" in error
    ? String((error as { name?: unknown }).name ?? "")
    : "";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "請允許 Safari 使用相機；亦可使用下方手動輸入條碼。";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "找不到可用相機，請使用下方手動輸入條碼。";
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return "相機目前無法使用，請關閉其他正在使用相機的程式後重試。";
  }
  return "無法啟動相機掃描，請確認使用 HTTPS 並允許相機權限，或改用手動輸入。";
}

export function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const onDetectedRef = useRef(onDetected);
  const handledRef = useRef(false);
  const [scannerError, setScannerError] = useState("");
  const [scannerStatus, setScannerStatus] = useState("正在啟動相機…");
  const [manualCode, setManualCode] = useState("");

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  const completeDetection = useCallback((rawCode: string, scanControls?: IScannerControls) => {
    const code = rawCode.trim();
    if (!code || handledRef.current) return;

    handledRef.current = true;
    try {
      navigator.vibrate?.(100);
    } catch {
      // iOS Safari may not expose vibration; decoding and lookup still proceed.
    }
    setManualCode(code);
    setScannerStatus("已辨識條碼，正在查詢…");

    try {
      (scanControls ?? controlsRef.current)?.stop();
    } catch {
      // The decoder callback may have already stopped its video stream.
    }
    controlsRef.current = null;

    try {
      void Promise.resolve(onDetectedRef.current(code)).catch(() => {
        setScannerStatus("條碼已辨識，但查詢未完成；請確認網絡後重試。");
      });
    } catch {
      setScannerStatus("條碼已辨識，但查詢未完成；請確認網絡後重試。");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function startScanner() {
      const video = videoRef.current;
      if (!video || !navigator.mediaDevices?.getUserMedia) {
        setScannerError("此裝置無法使用相機掃描，請使用下方手動輸入條碼。");
        setScannerStatus("");
        return;
      }

      try {
        const [{ BrowserMultiFormatReader }, hints] = await Promise.all([
          import("@zxing/browser"),
          createBarcodeReaderHints(),
        ]);
        if (cancelled) return;

        const reader: BrowserMultiFormatReader = new BrowserMultiFormatReader(hints);
        const controls = await reader.decodeFromConstraints(
          {
            audio: false,
            video: {
              facingMode: "environment",
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
          },
          video,
          (result, _error, callbackControls) => {
            if (cancelled || !result) return;
            completeDetection(result.getText(), callbackControls);
          },
        );

        if (cancelled || handledRef.current) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
        setScannerError("");
        setScannerStatus("掃描中，請將條碼完整放入相機畫面並保持清晰。");
      } catch (error) {
        if (!cancelled) {
          setScannerError(cameraErrorMessage(error));
          setScannerStatus("");
        }
      }
    }

    void startScanner();
    return () => {
      cancelled = true;
      try {
        controlsRef.current?.stop();
      } catch {
        // The camera may already be released by a successful decode.
      }
      controlsRef.current = null;
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
    };
  }, [completeDetection]);

  function submitManualCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = manualCode.trim();
    if (!code || handledRef.current) return;
    completeDetection(code);
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/60 p-3 sm:items-center">
      <section className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="barcode-scanner-title">
        <div className="flex items-center justify-between">
          <h2 id="barcode-scanner-title" className="text-xl font-semibold">掃描 JAN／Code 128</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-[#8b7c70] hover:bg-[#FFFFFF]" aria-label="關閉"><X className="h-5 w-5" /></button>
        </div>
        <video ref={videoRef} autoPlay muted playsInline className="mt-4 block max-h-[55vh] w-full rounded-2xl bg-black object-contain" aria-label="完整相機畫面" />
        <p className="mt-3 text-sm text-[#806b5d]" aria-live="polite">{scannerStatus}</p>
        {scannerError && <p className="mt-2 rounded-lg bg-[#FFFFFF] p-3 text-sm text-[#a34d32]" role="status">{scannerError}</p>}
        <form className="mt-4 flex gap-2" onSubmit={submitManualCode}>
          <input value={manualCode} onChange={(event) => setManualCode(event.target.value)} inputMode="text" autoComplete="off" maxLength={128} placeholder="手動輸入條碼" aria-label="手動輸入條碼" className="min-w-0 flex-1 rounded-xl border border-[#ded5cc] px-3 py-3" />
          <button type="submit" disabled={!manualCode.trim()} className="rounded-xl bg-[#2f4a3c] px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">查詢</button>
        </form>
      </section>
    </div>
  );
}
