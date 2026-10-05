"use client";

export function InvoiceDownload({ number }: { number: string }) {
  return (
    <button
      className="btn btn-gold"
      type="button"
      onClick={() => {
        const previous = document.title;
        document.title = `Invoice ${number}`;
        const restore = () => {
          document.title = previous;
          window.removeEventListener("afterprint", restore);
        };
        window.addEventListener("afterprint", restore);
        window.print();
      }}
    >
      Download invoice
    </button>
  );
}
