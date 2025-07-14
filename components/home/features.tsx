'use client'

import { SparklesIcon, PhotoIcon, PaintBrushIcon, CpuChipIcon } from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Text-to-Image Generation',
    description:
      'Transform your ideas into stunning visuals with our advanced AI. Simply describe what you want to see, and watch as our Flux model creates high-quality images from your text prompts.',
    icon: SparklesIcon,
  },
  {
    name: 'Image Transformation',
    description:
      'Upload existing images and transform them with AI-powered editing. Change styles, add elements, or completely reimagine your photos with intelligent image manipulation.',
    icon: PhotoIcon,
  },
  {
    name: 'Creative Control',
    description:
      'Fine-tune your creations with customizable parameters. Choose output formats, aspect ratios, and generation settings to get exactly the results you envision.',
    icon: PaintBrushIcon,
  },
  {
    name: 'Flux AI Technology',
    description:
      'Powered by the cutting-edge Flux model from Black Forest Labs. Experience state-of-the-art image generation with exceptional quality, detail, and artistic coherence.',
    icon: CpuChipIcon,
  },
]

export default function Features() {
  return (
    <div id="features" className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base/7 font-semibold text-primary">AI-Powered Creativity</h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-foreground sm:text-5xl lg:text-balance">
            Everything you need for AI image creation
          </p>
          <p className="mt-6 text-lg/8 text-muted-foreground">
            Our platform combines cutting-edge AI technology with intuitive design to make image generation
            accessible to everyone. From concept to creation, we provide the tools to bring your visual
            ideas to life with unprecedented quality and control.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base/7 font-semibold text-foreground">
                  <div className="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg bg-primary">
                    <feature.icon aria-hidden="true" className="size-6 text-primary-foreground" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base/7 text-muted-foreground">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
