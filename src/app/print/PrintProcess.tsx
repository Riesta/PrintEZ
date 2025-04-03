"use client";
import { useState } from "react";
import PrintForm from "@/components/ui/printForm";

const PrintProcess = () => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      // Jika file adalah gambar atau PDF, tampilkan preview
      if (
        selectedFile.type.includes("image") ||
        selectedFile.type === "application/pdf"
      ) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null); // Tidak menampilkan preview jika bukan gambar/PDF
      }
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">PrintEZ</h1>

      <div className="flex flex-col items-center">
        {/* Sidebar Navigation */}
        <div className="w-2/4 flex flex-row justify-between bg-blue-900 text-white p-4">
          <div className={`py-2 ${step === 1 ? "font-bold" : ""}`}>
            1. Unggah File
          </div>
          <div className={`py-2 ${step === 2 ? "font-bold" : ""}`}>
            2. Form Pemesanan
          </div>
          <div className={`py-2 ${step === 3 ? "font-bold" : ""}`}>
            3. Pembayaran
          </div>
        </div>

        {/* Step Content */}
        <div className="w-3/4 p-4">
          {step === 1 && (
            <div>
              <h2 className="text-xl mb-2">Unggah filemu</h2>
              <input
                type="file"
                onChange={handleFileUpload}
                className="border p-2 w-full"
              />

              {/* Tampilkan Preview File */}
              {preview ? (
                <div className="mt-4">
                  {file?.type.includes("image") ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-40 h-auto border p-2"
                    />
                  ) : file?.type === "application/pdf" ? (
                    <iframe
                      src={preview}
                      className="w-full h-56 border p-2"
                    ></iframe>
                  ) : null}
                </div>
              ) : file ? (
                <p className="mt-4 text-gray-600">{file.name}</p>
              ) : null}

              <button
                className="bg-blue-500 text-white p-2 mt-4"
                disabled={!file}
                onClick={() => setStep(2)}
              >
                Selanjutnya
              </button>
            </div>
          )}

          {step === 2 && <PrintForm />}

          {step === 3 && (
            <div>
              <h2 className="text-xl mb-2">Pembayaran</h2>
              <button
                className="bg-green-500 text-white p-2"
                onClick={() => alert("Payment Successful!")}
              >
                KKonfirmasi Pembayaran
              </button>
              <button
                className="bg-gray-500 text-white p-2 ml-2"
                onClick={() => setStep(2)}
              >
                Kembali
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrintProcess;
