"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

export default function RecordViewer() {
  const { cid } = useParams();
  const [fileContent, setFileContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log(cid)
    const fetchFromIPFS = async () => {
      try {
        console.log(cid)
        const res = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
        if (!res.ok) throw new Error("Failed to fetch IPFS content");
        console.log(res)

        const contentType = res.headers.get("Content-Type");

        if (contentType?.includes("application/json")) {
          const data = await res.json();
          setFileContent(JSON.stringify(data, null, 2));
        } else if (contentType?.includes("text")) {
          const text = await res.text();
          setFileContent(text);
        } else {
          // Non-text (e.g. PDF, image, etc.)
          setFileContent("non-text");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (cid) fetchFromIPFS();
  }, [cid]);

  if (loading) return <p className="p-10 text-gray-600">⏳ Loading record...</p>;
  if (error) return <p className="p-10 text-red-600">❌ {error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <Card className="max-w-4xl mx-auto shadow-md border-0">
        <CardContent className="p-6">
          <h1 className="text-2xl font-semibold mb-4">Record Details</h1>
          {fileContent === "non-text" ? (
            <iframe
              src={`https://gateway.pinata.cloud/ipfs/${cid}`}
              className="w-full h-[600px] rounded-lg border"
            />
          ) : (
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm whitespace-pre-wrap">
              {fileContent}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
