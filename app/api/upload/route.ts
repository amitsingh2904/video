// import { NextResponse } from 'next/server';

// // Simulate processing delay and return a mock result
// async function processVideo(videoFile: File, targetLanguage: string) {
//   // Simulate API processing time
//   await new Promise(resolve => setTimeout(resolve, 2000));
  
//   // Mock response with a sample video URL
//   return {
//     originalVideo: URL.createObjectURL(videoFile),
//     dubbedVideo: "https://storage.googleapis.com/webfundamentals-assets/videos/chrome.mp4", // Sample video for demo
//     downloadUrl: "https://storage.googleapis.com/webfundamentals-assets/videos/chrome.mp4", // URL for download
//     fileName: "dubbed_video.mp4",
//     captions: [
//       { start: 0, end: 2, text: "नमस्ते, मैं एक AI डब्ड वीडियो हूं" },
//       { start: 2, end: 4, text: "यह एक डेमो वीडियो है" },
//     ]
//   };
// }

// export async function POST(request: Request) {
//   try {
//     const formData = await request.formData();
//     const video = formData.get('video') as File;
//     console.log("video",video);
//     const sourceLanguage = formData.get('sourceLanguage') as string;
//     const targetLanguage = formData.get('targetLanguage') as string;
//     const voiceStyle = formData.get('voiceStyle') as string;
//     const generateCaptions = formData.get('generateCaptions') as string;

//     // Process the video and get result
//     const result = await processVideo(video, targetLanguage);
//     console.log("result",result);

//     return NextResponse.json({
//       success: true,
//       message: 'Video processed successfully',
//       data: result,
//       jobId: Math.random().toString(36).substring(7),
//     });
//   } catch (error) {
//     return NextResponse.json(
//       { success: false, message: 'Processing failed' },
//       { status: 500 }
//     );
//   }
// }
export const dynamic = "force-dynamic"; // Ensures the API runs as a server function

import { NextResponse } from "next/server";

// Simulated video processing function
async function processVideo(videoFile: File, targetLanguage: string) {
  try {
    console.log("Processing video:", videoFile?.name || "No file");
    console.log("Target Language:", targetLanguage);

    // Simulate API processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (!videoFile) {
      throw new Error("Invalid video file");
    }

    return {
      originalVideo: "Video processing simulated", // No createObjectURL (server issue)
      dubbedVideo:
        "https://storage.googleapis.com/webfundamentals-assets/videos/chrome.mp4",
      downloadUrl:
        "https://storage.googleapis.com/webfundamentals-assets/videos/chrome.mp4",
      fileName: "dubbed_video.mp4",
      captions: [
        { start: 0, end: 2, text: "नमस्ते, मैं एक AI डब्ड वीडियो हूं" },
        { start: 2, end: 4, text: "यह एक डेमो वीडियो है" },
      ],
    };
  } catch (error) {
    console.error("Error in processVideo:", error);
    throw error; // Let API route handle the error
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const video = formData.get("video") as File;
    const sourceLanguage = formData.get("sourceLanguage") as string;
    const targetLanguage = formData.get("targetLanguage") as string;
    const voiceStyle = formData.get("voiceStyle") as string;
    const generateCaptions = formData.get("generateCaptions") as string;

    console.log("Received video file:", video?.name || "No file received");
    console.log("Form Data:", {
      sourceLanguage,
      targetLanguage,
      voiceStyle,
      generateCaptions,
    });

    // Check if video file is missing
    if (!video) {
      return NextResponse.json(
        { success: false, message: "No video file uploaded" },
        { status: 400 }
      );
    }

    // Process the video and get the result
    const result = await processVideo(video, targetLanguage);

    return NextResponse.json({
      success: true,
      message: "Video processed successfully",
      data: result,
      jobId: Math.random().toString(36).substring(7),
    });
  } catch (error: any) {
    console.error("API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Processing failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
