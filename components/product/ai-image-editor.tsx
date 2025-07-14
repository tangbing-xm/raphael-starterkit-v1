"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Upload, Wand2, Download, Loader2, ImageIcon, Settings } from "lucide-react";

interface AIImageEditorProps {
  className?: string;
}

interface GenerationResult {
  id: string;
  output: string;
  status: string;
  error?: string;
}

type OutputFormat = 'jpg' | 'png' | 'webp';
type AspectRatio = '1:1' | '16:9' | '21:9' | '3:2' | '4:3' | '9:16' | '2:3' | 'match_input_image';

const OUTPUT_FORMAT_OPTIONS: { value: OutputFormat; label: string; description: string }[] = [
  { value: 'jpg', label: 'JPG', description: 'Best for photos, smaller file size' },
  { value: 'png', label: 'PNG', description: 'Best for graphics, supports transparency' },
  { value: 'webp', label: 'WebP', description: 'Modern format, excellent compression' },
];

const ASPECT_RATIO_OPTIONS: { value: AspectRatio; label: string; description: string }[] = [
  { value: 'match_input_image', label: 'Match Input', description: 'Same as uploaded image' },
  { value: '1:1', label: 'Square (1:1)', description: 'Perfect for social media' },
  { value: '16:9', label: 'Landscape (16:9)', description: 'Widescreen format' },
  { value: '4:3', label: 'Standard (4:3)', description: 'Traditional photo format' },
  { value: '3:2', label: 'Photo (3:2)', description: 'Classic camera ratio' },
  { value: '9:16', label: 'Portrait (9:16)', description: 'Mobile/story format' },
  { value: '2:3', label: 'Portrait (2:3)', description: 'Tall portrait format' },
  { value: '21:9', label: 'Ultrawide (21:9)', description: 'Cinematic format' },
];

export function AIImageEditor({ className }: AIImageEditorProps) {
  const [prompt, setPrompt] = useState("");
  const [inputImage, setInputImage] = useState<File | null>(null);
  const [inputImageUrl, setInputImageUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // 新增的参数控制状态
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpg');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');

  // 处理文件拖拽
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // 处理文件放置
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setInputImage(file);
        const url = URL.createObjectURL(file);
        setInputImageUrl(url);
      }
    }
  }, []);

  // 处理文件选择
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setInputImage(file);
        const url = URL.createObjectURL(file);
        setInputImageUrl(url);
      }
    }
  }, []);

  // 上传图片到临时存储
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload image');
    }
    
    const data = await response.json();
    return data.url;
  };

  // 生成图片
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      let imageUrl = '';
      
      // 如果有输入图片，先上传
      if (inputImage) {
        imageUrl = await uploadImage(inputImage);
      }

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          input_image: imageUrl || undefined,
          output_format: outputFormat,
          aspect_ratio: inputImage ? 'match_input_image' : aspectRatio,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Generation error:', error);
      setResult({
        id: 'error',
        output: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 下载生成的图片
  const handleDownload = async () => {
    if (!result?.output) return;

    try {
      const response = await fetch(result.output);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-generated-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm/6 text-muted-foreground ring-1 ring-border hover:ring-ring">
              AI-Powered Image Generation{' '}
              <span className="font-semibold whitespace-nowrap text-primary">
                <span aria-hidden="true" className="absolute inset-0" />
                Powered by Flux <span aria-hidden="true">✨</span>
              </span>
            </div>
          </div>
          <h2 className="text-4xl font-semibold tracking-tight text-pretty text-foreground sm:text-5xl">
            Transform Your Images with AI
          </h2>
          <p className="mt-6 text-lg font-medium text-pretty text-muted-foreground">
            Upload an image and describe how you want to transform it, or create entirely new images from text descriptions.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Input Section */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  Create Your Image
                </CardTitle>
                <CardDescription>
                  Upload an image to transform or create from scratch with text
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="image-upload">Input Image (Optional)</Label>
                  <div
                    className={cn(
                      "relative border-2 border-dashed rounded-lg p-6 transition-colors",
                      dragActive
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                      inputImageUrl && "border-primary bg-primary/5"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {inputImageUrl ? (
                      <div className="text-center">
                        <img
                          src={inputImageUrl}
                          alt="Input preview"
                          className="mx-auto max-h-32 rounded-md object-contain"
                        />
                        <p className="mt-2 text-sm text-muted-foreground">
                          Click or drag to replace image
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-2 text-sm font-medium">
                          Drop an image here or click to upload
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, WebP up to 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Prompt Input */}
                <div className="space-y-2">
                  <Label htmlFor="prompt">Transformation Prompt</Label>
                  <textarea
                    id="prompt"
                    placeholder="e.g., Make this a 90s cartoon, Turn into a watercolor painting..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Describe how you want to transform the image or what you want to create
                  </p>
                </div>

                {/* Generation Parameters */}
                <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Generation Settings</Label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Output Format Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="output-format">Output Format</Label>
                      <Select value={outputFormat} onValueChange={(value: OutputFormat) => setOutputFormat(value)}>
                        <SelectTrigger id="output-format">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          {OUTPUT_FORMAT_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Aspect Ratio Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
                      <Select
                        value={aspectRatio}
                        onValueChange={(value: AspectRatio) => setAspectRatio(value)}
                        disabled={!!inputImage}
                      >
                        <SelectTrigger id="aspect-ratio">
                          <SelectValue placeholder="Select ratio" />
                        </SelectTrigger>
                        <SelectContent>
                          {ASPECT_RATIO_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {inputImage && (
                        <p className="text-xs text-muted-foreground">
                          Aspect ratio will match the uploaded image
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate Image
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Result Section */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Generated Result
                </CardTitle>
                <CardDescription>
                  Your AI-generated image will appear here
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isGenerating ? (
                  <div className="flex items-center justify-center h-64 border-2 border-dashed border-border rounded-lg">
                    <div className="text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Creating your image...
                      </p>
                    </div>
                  </div>
                ) : result ? (
                  <div className="space-y-4">
                    {result.status === 'succeeded' && result.output ? (
                      <>
                        <img
                          src={result.output}
                          alt="Generated result"
                          className="w-full rounded-lg object-contain max-h-64"
                        />
                        <Button
                          onClick={handleDownload}
                          variant="outline"
                          className="w-full"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download Image
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-64 border-2 border-dashed border-destructive rounded-lg">
                        <div className="text-center">
                          <p className="text-sm text-destructive">
                            {result.error || 'Generation failed'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 border-2 border-dashed border-border rounded-lg">
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Generated image will appear here
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
