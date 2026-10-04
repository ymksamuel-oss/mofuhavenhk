import { describe, expect, it } from "vitest";
import {
  BarcodeFormat,
  BinaryBitmap,
  DecodeHintType,
  HybridBinarizer,
  MultiFormatReader,
  RGBLuminanceSource,
} from "@zxing/library";
import { BARCODE_SCAN_FORMATS, createBarcodeReaderHints } from "../src/lib/admin/barcode-formats";

const JAN_CODE = "4976064013897";
const LEFT_ODD = ["0001101", "0011001", "0010011", "0111101", "0100011", "0110001", "0101111", "0111011", "0110111", "0001011"];
const LEFT_EVEN = ["0100111", "0110011", "0011011", "0100001", "0011101", "0111001", "0000101", "0010001", "0001001", "0010111"];
const RIGHT = ["1110010", "1100110", "1101100", "1000010", "1011100", "1001110", "1010000", "1000100", "1001000", "1110100"];
const FIRST_DIGIT_PARITY = ["LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG", "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"];

function createEan13Raster(code: string) {
  const firstDigitParity = FIRST_DIGIT_PARITY[Number(code[0])];
  let modules = "101";
  for (let index = 1; index <= 6; index += 1) {
    const table = firstDigitParity[index - 1] === "L" ? LEFT_ODD : LEFT_EVEN;
    modules += table[Number(code[index])];
  }
  modules += "01010";
  for (let index = 7; index < 13; index += 1) modules += RIGHT[Number(code[index])];
  modules += "101";

  const scale = 4;
  const quietZoneModules = 16;
  const width = (modules.length + quietZoneModules * 2) * scale;
  const height = 160;
  const pixels = new Uint8ClampedArray(width * height).fill(255);
  for (let y = 12; y < height - 12; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const moduleIndex = Math.floor(x / scale) - quietZoneModules;
      if (moduleIndex >= 0 && moduleIndex < modules.length && modules[moduleIndex] === "1") {
        pixels[y * width + x] = 0;
      }
    }
  }
  return { pixels, width, height };
}

describe("admin camera barcode formats", () => {
  it("enables EAN-13, EAN-8, and Code 128 with ZXing TRY_HARDER", async () => {
    expect(BARCODE_SCAN_FORMATS).toEqual(["EAN_13", "EAN_8", "CODE_128"]);
    const hints = await createBarcodeReaderHints();
    expect(hints.get(DecodeHintType.POSSIBLE_FORMATS)).toEqual([
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.CODE_128,
    ]);
    expect(hints.get(DecodeHintType.TRY_HARDER)).toBe(true);
  });

  it("decodes JAN 4976064013897 from the full EAN-13 raster image", async () => {
    const { pixels, width, height } = createEan13Raster(JAN_CODE);
    const bitmap = new BinaryBitmap(
      new HybridBinarizer(new RGBLuminanceSource(pixels, width, height)),
    );
    const reader = new MultiFormatReader();
    reader.setHints(await createBarcodeReaderHints());

    expect(reader.decodeWithState(bitmap).getText()).toBe(JAN_CODE);
  });
});
