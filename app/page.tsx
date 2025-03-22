"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Globe2, Volume2, Subtitles, Play, Pause, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ProcessedResult {
  originalVideo: string;
  dubbedVideo: string;
  downloadUrl: string;
  fileName: string;
  captions: Array<{ start: number; end: number; text: string }>;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("hi");
  const [voiceStyle, setVoiceStyle] = useState("natural");
  const [generateCaptions, setGenerateCaptions] = useState(true);
  const [processedResult, setProcessedResult] = useState<ProcessedResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-download when processing is complete
  useEffect(() => {
    if (processedResult) {
      handleDownload();
    }
  }, [processedResult]);

  const handleDownload = async () => {
    if (!processedResult) return;

    try {
      const response = await fetch(processedResult.downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = processedResult.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Video download started!");
    } catch (error) {
      toast.error("Download failed. Please try again.");
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setFile(acceptedFiles[0]);
      toast.success("Video selected successfully!");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi']
    },
    maxSize: 500 * 1024 * 1024 // 500MB
  });

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setProcessedResult(null);

    const formData = new FormData();
    formData.append('video', file);
    formData.append('sourceLanguage', sourceLanguage);
    formData.append('targetLanguage', targetLanguage);
    formData.append('voiceStyle', voiceStyle);
    formData.append('generateCaptions', generateCaptions.toString());

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();
      if (data.success) {
        setProcessedResult(data.data);
        toast.success("Video processed successfully!");
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error("Processing failed. Please try again.");
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
            AI Video Dubbing
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Transform your videos into Indian languages with natural-sounding AI voices.
          </p>
        </div>

        <Card className="bg-zinc-800/50 border-zinc-700 p-8 max-w-4xl mx-auto backdrop-blur-sm">
          <div className="space-y-8">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center transition-colors cursor-pointer ${
                isDragActive ? 'border-blue-500 bg-blue-500/10' : 'hover:border-zinc-500'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-zinc-500" />
              <h3 className="text-lg font-medium mb-2">
                {file ? file.name : 'Upload your video'}
              </h3>
              <p className="text-sm text-zinc-400">
                {isDragActive
                  ? "Drop your video here"
                  : "Drag and drop your video here, or click to browse"}
              </p>
              <p className="text-xs text-zinc-500 mt-2">
                Supports MP4, MOV, AVI (max 500MB)
              </p>
            </div>

            {file && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>Upload progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Source Language</label>
                <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="bn">Bengali</SelectItem>
                    <SelectItem value="te">Telugu</SelectItem>
                    <SelectItem value="ta">Tamil</SelectItem>
                    <SelectItem value="mr">Marathi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Target Language</label>
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="bn">Bengali</SelectItem>
                    <SelectItem value="te">Telugu</SelectItem>
                    <SelectItem value="ta">Tamil</SelectItem>
                    <SelectItem value="mr">Marathi</SelectItem>
                    <SelectItem value="gu">Gujarati</SelectItem>
                    <SelectItem value="kn">Kannada</SelectItem>
                    <SelectItem value="ml">Malayalam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">AI Voice Style</label>
              <Select value={voiceStyle} onValueChange={setVoiceStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="natural">Natural</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="news">News Anchor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="captions"
                checked={generateCaptions}
                onCheckedChange={setGenerateCaptions}
              />
              <Label htmlFor="captions">Generate subtitles in target language</Label>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              {uploading ? "Processing..." : "Start Dubbing"}
            </Button>
          </div>
        </Card>

        {processedResult && (
          <Card className="bg-zinc-800/50 border-zinc-700 p-8 max-w-4xl mx-auto mt-8 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Processed Video</h2>
              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Video
              </Button>
            </div>
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
              <video
                ref={videoRef}
                src={processedResult.dubbedVideo}
                className="w-full h-full"
                controls
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
              >
                {isPlaying ? (
                  <Pause className="w-16 h-16 text-white" />
                ) : (
                  <Play className="w-16 h-16 text-white" />
                )}
              </button>
            </div>
            {generateCaptions && processedResult.captions && (
              <div className="mt-4 p-4 bg-zinc-900/50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Generated Captions</h3>
                <div className="space-y-2">
                  {processedResult.captions.map((caption, index) => (
                    <div key={index} className="text-sm text-zinc-300">
                      [{caption.start}s - {caption.end}s]: {caption.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="text-center p-6">
            <Globe2 className="w-12 h-12 mx-auto mb-4 text-blue-400" />
            <h3 className="text-xl font-semibold mb-2">Indian Languages</h3>
            <p className="text-zinc-400">
              Support for all major Indian languages with regional accents
            </p>
          </div>
          <div className="text-center p-6">
            <Volume2 className="w-12 h-12 mx-auto mb-4 text-teal-400" />
            <h3 className="text-xl font-semibold mb-2">Natural Voices</h3>
            <p className="text-zinc-400">
              AI-powered voices that sound incredibly human-like
            </p>
          </div>
          <div className="text-center p-6">
            <Subtitles className="w-12 h-12 mx-auto mb-4 text-blue-400" />
            <h3 className="text-xl font-semibold mb-2">Auto Captions</h3>
            <p className="text-zinc-400">
              Automatic subtitle generation in target language
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}