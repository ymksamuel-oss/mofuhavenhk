export const BARCODE_SCAN_FORMATS = ["EAN_13", "EAN_8", "CODE_128"] as const;

export async function createBarcodeReaderHints() {
  const { BarcodeFormat, DecodeHintType } = await import("@zxing/library");
  const hints = new Map();
  hints.set(
    DecodeHintType.POSSIBLE_FORMATS,
    BARCODE_SCAN_FORMATS.map((format) => BarcodeFormat[format]),
  );
  hints.set(DecodeHintType.TRY_HARDER, true);
  return hints;
}
