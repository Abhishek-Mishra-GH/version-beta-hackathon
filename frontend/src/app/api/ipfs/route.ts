import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const pinataJwt = process.env.PINATA_JWT;
    const pinataGateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY;

    if (!pinataJwt) {
      return NextResponse.json(
        { error: "PINATA_JWT not configured" },
        { status: 500 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const metadata = formData.get("metadata") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Prepare metadata
    let fileName = file.name;
    if (metadata) {
      const parsedMetadata = JSON.parse(metadata) as {
        fileName?: string;
        fileSize?: number;
        uploadedAt?: string;
      };
      fileName = parsedMetadata.fileName ?? file.name;
    }

    // Upload to Pinata using their Files API
    const pinataFormData = new FormData();
    pinataFormData.append("file", file);
    pinataFormData.append(
      "pinataMetadata",
      JSON.stringify({
        name: fileName,
      }),
    );
    pinataFormData.append(
      "pinataOptions",
      JSON.stringify({
        cidVersion: 1,
      }),
    );

    let uploadResponse;
    try {
      uploadResponse = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${pinataJwt}`,
          },
          body: pinataFormData,
        },
      );
    } catch (fetchError) {
      const err = fetchError as Error;
      console.error("Network error connecting to Pinata:", err.message);
      return NextResponse.json(
        {
          error:
            "Failed to connect to IPFS service. Please check your internet connection and try again.",
        },
        { status: 503 },
      );
    }

    if (!uploadResponse.ok) {
      const errorData = (await uploadResponse.json()) as { error: string };
      throw new Error(errorData.error ?? "Failed to upload to Pinata");
    }

    const uploadData = (await uploadResponse.json()) as {
      IpfsHash: string;
      PinSize: number;
      Timestamp: string;
    };

    return NextResponse.json({
      success: true,
      ipfsHash: uploadData.IpfsHash,
      ipfsUrl: `https://${pinataGateway ?? "gateway.pinata.cloud"}/ipfs/${uploadData.IpfsHash}`,
      pinSize: uploadData.PinSize,
      timestamp: uploadData.Timestamp,
    });
  } catch (error) {
    console.error("IPFS upload error:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message ?? "Failed to upload to IPFS" },
      { status: 500 },
    );
  }
}
