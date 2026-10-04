"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { BARCODE_SCAN_FORMATS } from "@/lib/admin/barcode-formats";
import type { Html5Qrcode as Html5QrcodeInstance } from "html5-qrcode";

type BarcodeScannerProps = {
  onDetected: (code: string) => void | Promise<void>;
  onClose: () => void;
};

function cameraErrorMessage(error: unknown) {
  const name = error instanceof DOMException ? error.name : "";
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
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const scannerElementId = `barcode-scanner-${id}`;
  const scannerRef = useRef<Html5QrcodeInstance | null>(null);
  const onDetectedRef = useRef(onDetected);
  const handledRef = useRef(false);
  const [scannerError, setScannerError] = useState("");
  const [scannerStatus, setScannerStatus] = useState("正在啟動相機…");
  const [manualCode, setManualCode] = useState("");

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  useEffect(() => {
    let cancelled = false;
    let instance: Html5QrcodeInstance | null = null;

    const stopAndClear = async (scanner: Html5QrcodeInstance) => {
      if (scanner.isScanning) {
        try {
          await scanner.stop();
        } catch {
          // Camera may already have stopped after a successful decode.
        }
      }
      try {
        scanner.clear();
      } catch {
        // The modal is being removed; clearing is best-effort after stopping.
      }
      if (scannerRef.current === scanner) scannerRef.current = null;
    };

    const completeDetection = async (rawCode: string) => {
      const code = rawCode.trim();
      if (!code || cancelled || handledRef.current) return;
      handledRef.current = true;
      setScannerStatus("已辨識條碼，正在查詢…");
      try {
        await stopAndClear(instance!);
      } finally {
        if (!cancelled) await onDetectedRef.current(code);
      }
    };

    async function startScanner() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setScannerError("此裝置無法使用相機掃描，請使用下方手動輸入條碼。");
        setScannerStatus("");
        return;
      }

      try {
        const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");
        if (cancelled) return;
        const formatsToSupport = BARCODE_SCAN_FORMATS.map((format) => Html5QrcodeSupportedFormats[format]);
        instance = new Html5Qrcode(scannerElementId, {
          verbose: false,
          formatsToSupport,
          // Always use html5-qrcode's ZXing decoder, including on browsers with partial native support.
          useBarCodeDetectorIfSupported: false,
        });
        scannerRef.current = instance;
        await instance.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: (viewfinderWidth, viewfinderHeight) => ({
              width: Math.max(180, Math.floor(viewfinderWidth * 0.94)),
              height: Math.max(110, Math.floor(viewfinderHeight * 0.58)),
            }),
            disableFlip: true,
          },
          (decodedText) => {
            if (cancelled || handledRef.current) return;
            try {
              navigator.vibrate?.(100);
            } catch {
              // Vibration is not implemented by every iOS browser; scanning still succeeds.
            }
            void completeDetection(decodedText);
          },
          () => {
            // No decode in this frame is expected while the camera is scanning.
          },
        );
        if (cancelled) {
          await stopAndClear(instance);
          return;
        }
        setScannerStatus("掃描中，請將 JAN／Code 128 條碼放入畫面框內。");
      } catch (error) {
        if (instance) await stopAndClear(instance);
        if (!cancelled) {
          setScannerError(cameraErrorMessage(error));
          setScannerStatus("");
        }
      }
    }

    void startScanner();
    return () => {
      cancelled = true;
      if (instance?.isScanning) void stopAndClear(instance);
    };
  }, [scannerElementId]);

  function submitManualCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = manualCode.trim();
    if (!code || handledRef.current) return;
    handledRef.current = true;
    setScannerStatus("正在查詢條碼…");
    const scanner = scannerRef.current;
    if (scanner) {
      void (async () => {
        if (scanner.isScanning) {
          try {
            await scanner.stop();
          } catch {
            // Continue to the manual lookup even if camera shutdown fails.
          }
        }
        onDetectedRef.current(code);
      })();
    } else {
      void onDetectedRef.current(code);
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/60 p-3 sm:items-center">
      <section className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="barcode-scanner-title">
        <div className="flex items-center justify-between">
          <h2 id="barcode-scanner-title" className="text-xl font-semibold">掃描 JAN／Code 128</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-[#8b7c70] hover:bg-[#FFFFFF]" aria-label="關閉"><X className="h-5 w-5" /></button>
        </div>
        <div id={scannerElementId} className="mt-4 aspect-video w-full overflow-hidden rounded-2xl bg-black" aria-label="條碼相機畫面" />
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
