import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function getFallbackImage() {
  try {
    const fallbackPath = path.join(process.cwd(), "public", "images", "universities", "rupp.jpg");
    if (fs.existsSync(fallbackPath)) {
      const buffer = fs.readFileSync(fallbackPath);
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": "image/jpeg",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }
  } catch {
    // ignore
  }
  return new NextResponse("Image not found", { status: 404 });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  console.log("[proxy-image] incoming targetUrl:", targetUrl);

  if (!targetUrl) {
    console.log("[proxy-image] missing targetUrl -> fallback");
    return getFallbackImage();
  }

  // If it's already a relative local URL
  if (targetUrl.startsWith("/")) {
    console.log("[proxy-image] relative URL -> local file");
    try {
      const localPath = path.join(process.cwd(), "public", targetUrl);
      if (fs.existsSync(localPath)) {
        const buffer = fs.readFileSync(localPath);
        const ext = path.extname(localPath).toLowerCase();
        const contentType =
          ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
          },
        });
      }
    } catch {
      return getFallbackImage();
    }
  }

  try {
    const parsed = new URL(targetUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      console.log("[proxy-image] invalid protocol -> fallback");
      return getFallbackImage();
    }

    console.log("[proxy-image] fetching remote:", targetUrl);
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FuteraImageProxy/1.0)",
        Accept: "image/*,*/*;q=0.8",
      },
    });

    console.log("[proxy-image] remote fetch status:", res.status, res.statusText);

    if (!res.ok) {
      console.log("[proxy-image] remote fetch not ok -> fallback");
      return getFallbackImage();
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await res.arrayBuffer();
    console.log("[proxy-image] success, bytes:", arrayBuffer.byteLength);

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.warn(`[proxy-image] Failed to proxy image: ${targetUrl}`, err);
    return getFallbackImage();
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}
