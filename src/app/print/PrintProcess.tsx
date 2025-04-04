"use client";
import { useState } from "react";

declare global {
  interface Window {
    snap: {
      embed: (token: string, options: {
        embedId: string;
        onSuccess?: (result: any) => void;
        onPending?: (result: any) => void;
        onError?: (result: any) => void;
        onClose?: () => void;
      }) => void;
    };
  }
}
import PrintForm from "@/components/ui/printForm";
import { Button } from "@/components/ui/button";
import axios from "axios";

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

  const uploadFileToServer = async () => {
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const apiUrl = "http://localhost:5000/api/v1/upload";
      const response = await axios.post(apiUrl, formData);

      if (response && response.data && response.data.data) {
        const fileData = response.data.data;
        console.log(fileData);

        sessionStorage.setItem("idfiles", fileData.id);
        alert("File uploaded successfully!");
        debugger;
        // Optionally, redirect or update UI here
      } else {
        throw new Error("Unexpected response format.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file. Please try again later.");
    }
  };

  const getPayment = async () => {
    const idFiles = sessionStorage.getItem("idfiles");
    const idForms = sessionStorage.getItem("idForm");
    if (!idFiles || !idForms) {
      alert("Mulai dari awal");
      return;
    }
    console.log(idFiles, idForms);
    const apiUrl = "http://localhost:5000/api/v1/token";
    const {data} = await axios.post(apiUrl, {
      idFiles,
      idForms,
    });
    const token = data.token;
    const transactionId = data.dataInsertTransaction?.id;
    if (!token) {
      throw new Error("Token Midtrans tidak ditemukan.");
    }
    const updateTransaction = async (status: string) => {
      try {
        await axios.put("http://localhost:5000/api/v1/token", {
          idTransaction: transactionId,
          status,
        });
        console.log(`Transaksi diperbarui ke status: ${status}`);
      } catch (error) {
        console.error("Gagal memperbarui transaksi:", error);
      }
    };
    window.snap.embed(token, {
      embedId: "snap-embed-container",
      onSuccess: async (result:any) => {
        await updateTransaction("paid");
        console.log("Pembayaran berhasil:", result);
        alert("Pembayaran berhasil!");
        sessionStorage.clear();
      },
      onPending: (result:any) => {
        console.log("Menunggu pembayaran:", result);
        alert("Pembayaran masih dalam proses.");
      },
      onError: (result:any) => {
        console.error("Pembayaran gagal:", result);
        alert("Pembayaran gagal. Silakan coba lagi.");
      },
      onClose: () => {
        console.warn("Popup ditutup tanpa menyelesaikan pembayaran.");
        alert("Anda belum menyelesaikan pembayaran.");
      },
    });
  }
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">PrintEZ</h1>

      <div className="flex flex-col items-center">
        {/* Sidebar Navigation */}
        <div className="w-2xl flex flex-row justify-between text-blue-950 p-4">
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
        <div className="w-2xl p-4">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl mb-2">Unggah filemu</h2>
              <input
                id ="file-upload"
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
              <Button onClick={async() => {await uploadFileToServer();setStep(2)}}>Selanjutnya</Button>
            </div>
          )}

          {step === 2 && (
            <PrintForm onNext={() => setStep(3)} onBack={() => setStep(1)} />
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl mb-2">Pembayaran</h2>
              <button
                className="bg-green-500 text-white p-2"
                //onClick={() => alert("Payment Successful!")}
                onClick={async() => {await getPayment()}}
              >
                Konfirmasi Pembayaran
              </button>
              <button
                className="bg-gray-500 text-white p-2 ml-2"
                onClick={() => setStep(2)}
              >
                Kembali
              </button>
              <div id="snap-embed-container" className="mt-4 w-full h-full"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrintProcess;
