// import React, { useState } from "react";
// import { getContract } from "../utils/contract";

// const UploadButton: React.FC = () => {
//   const [status, setStatus] = useState<string>("");
//   const [loading, setLoading] = useState(false);

//   async function handleUpload() {
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     async function upload(): Promise<any> {
//       setLoading(true);
//       setStatus("Uploading...");

//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       const contract: any = await getContract();
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
//       const tx: any = await contract.addRecord(
//         "patient123",
//         "bafyExampleCID",
//         "Heart rate report 2025",
//       );

//       // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
//       setStatus(`Submitted: ${tx.hash}`);
//       // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
//       await tx.wait();
//       setStatus("✅ Success!");
//     }

//     try {
//       await upload();
//     } catch (error) {
//       const err = error as Error;
//       setStatus(`❌ ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="p-4">
//       <button
//         onClick={handleUpload}
//         disabled={loading}
//         className="rounded-lg bg-blue-600 px-4 py-2 text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
//       >
//         {loading ? "Uploading..." : "Upload Record"}
//       </button>
//       {status && <p className="mt-2 text-sm text-gray-200">{status}</p>}
//     </div>
//   );
// };

// export default UploadButton;
