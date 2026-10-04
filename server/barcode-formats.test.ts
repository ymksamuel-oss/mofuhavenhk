import { describe, expect, it } from "vitest";
import { Html5QrcodeSupportedFormats } from "html5-qrcode";
import { BARCODE_SCAN_FORMATS } from "../src/lib/admin/barcode-formats";

describe("admin camera barcode formats", () => {
  it("enables JAN/EAN-13 and Code 128 in the html5-qrcode decoder", () => {
    expect(BARCODE_SCAN_FORMATS).toEqual(["EAN_13", "CODE_128"]);
    expect(BARCODE_SCAN_FORMATS.map((format) => Html5QrcodeSupportedFormats[format])).toEqual([
      Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.CODE_128,
    ]);
  });
});
