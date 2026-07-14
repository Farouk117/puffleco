"use client";

export default function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn-brand print:hidden">
      Print receipt
    </button>
  );
}
