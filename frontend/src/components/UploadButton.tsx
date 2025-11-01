// src/components/UploadButton.tsx
import React, { useState } from "react";
import { getContract } from "../utils/contract";

const UploadButton: React.FC = () => {
    const [status, setStatus] = useState<string>("");

    async function handleUpload() {
        try {
            setStatus("Connecting wallet...");
            const contract = await getContract();

            setStatus("Uploading record...");
            const tx = await (contract.addRecord as any)("patient123", "bafyExampleCID", "Heart rate report 2025");
            

            setStatus(`Submitted: ${tx.hash}`);

            await tx.wait();
            setStatus("✅ Record uploaded successfully!");
        } catch (err: any) {
            console.error(err);
            setStatus(`❌ Error: ${err.message}`);
        }
    }

    // async function handleUpload() {
    //     try {
    //         setStatus("Connecting wallet...");
    //         const contract = await getContract();

    //         setStatus("Uploading record...");
    //         const tx = await (contract.uploadRecord as any)("bafyExampleCID");

    //         setStatus(`Submitted: ${tx.hash}`);

    //         await tx.wait();
    //         setStatus("✅ Record uploaded successfully!");
    //     } catch (err: any) {
    //         console.error(err);
    //         setStatus(`❌ Error: ${err.message}`);
    //     }
    // }


    return (
        <div className="p-4">
            <button
                onClick={handleUpload}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md"
            >
                Upload Record
            </button>
            {status && <p className="mt-2 text-gray-200 text-sm">{status}</p>}
        </div>
    );
};

export default UploadButton;
