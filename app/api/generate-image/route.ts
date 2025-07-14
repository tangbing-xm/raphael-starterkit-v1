import { NextRequest, NextResponse } from 'next/server';

interface ReplicateInput {
  prompt: string;
  input_image?: string;
  aspect_ratio?: string;
  output_format?: string;
  safety_tolerance?: number;
  prompt_upsampling?: boolean;
}

type OutputFormat = 'jpg' | 'png' | 'webp';
type AspectRatio = '1:1' | '16:9' | '21:9' | '3:2' | '4:3' | '9:16' | '2:3' | 'match_input_image';

// 验证输出格式
const isValidOutputFormat = (format: any): format is OutputFormat => {
  return ['jpg', 'png', 'webp'].includes(format);
};

// 验证宽高比
const isValidAspectRatio = (ratio: any): ratio is AspectRatio => {
  return ['1:1', '16:9', '21:9', '3:2', '4:3', '9:16', '2:3', 'match_input_image'].includes(ratio);
};

interface ReplicateResponse {
  id: string;
  status: string;
  output?: string;
  error?: string;
  completed_at?: string;
  created_at?: string;
  logs?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, input_image, output_format, aspect_ratio } = await request.json();

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // 验证输出格式
    const validOutputFormat: OutputFormat = output_format && isValidOutputFormat(output_format)
      ? output_format
      : 'jpg';

    // 验证宽高比
    const validAspectRatio: AspectRatio = aspect_ratio && isValidAspectRatio(aspect_ratio)
      ? aspect_ratio
      : (input_image ? 'match_input_image' : '1:1');

    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      console.error('REPLICATE_API_TOKEN is not configured');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    // 构建请求数据
    const inputData: ReplicateInput = {
      prompt: prompt.trim(),
      aspect_ratio: validAspectRatio,
      output_format: validOutputFormat,
      safety_tolerance: 2,
      prompt_upsampling: false,
    };

    // 如果有输入图片，添加到请求中
    if (input_image && typeof input_image === 'string') {
      inputData.input_image = input_image;
    }

    console.log('Sending request to Replicate:', {
      prompt: inputData.prompt,
      has_input_image: !!inputData.input_image,
      aspect_ratio: inputData.aspect_ratio,
      output_format: inputData.output_format
    });

    // 调用 Replicate API
    const response = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-kontext-pro/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait',
      },
      body: JSON.stringify({
        input: inputData
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Replicate API error:', response.status, errorText);
      
      let errorMessage = 'Failed to generate image';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.detail || errorData.error || errorMessage;
      } catch {
        // 如果无法解析错误响应，使用默认消息
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const result: ReplicateResponse = await response.json();
    
    console.log('Replicate response:', {
      id: result.id,
      status: result.status,
      has_output: !!result.output,
      output: result.output,
      error: result.error
    });

    // 检查生成是否成功
    if ((result.status === 'succeeded' || result.status === 'processing') && result.output) {
      return NextResponse.json({
        id: result.id,
        status: 'succeeded', // 如果有output，就认为成功了
        output: result.output,
        completed_at: result.completed_at,
      });
    } else if (result.status === 'failed' || result.error) {
      return NextResponse.json({
        id: result.id,
        status: 'failed',
        error: result.error || 'Generation failed',
      });
    } else {
      // 如果状态不是成功也不是失败，可能还在处理中
      return NextResponse.json({
        id: result.id,
        status: result.status || 'processing',
        error: 'Generation is still in progress. Please try again.',
      });
    }

  } catch (error) {
    console.error('Generation error:', error);
    
    let errorMessage = 'Internal server error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
