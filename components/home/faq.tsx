const faqs = [
  {
    id: 1,
    question: "What is the Flux AI model and how does it work?",
    answer:
      "Flux is a state-of-the-art AI image generation model developed by Black Forest Labs. It uses advanced diffusion technology to create high-quality images from text descriptions or transform existing images. Our platform integrates directly with Flux to provide you with cutting-edge image generation capabilities.",
  },
  {
    id: 2,
    question: "What image formats and sizes are supported?",
    answer:
      "Our platform supports multiple output formats including JPG, PNG, and WebP. You can choose from various aspect ratios like square (1:1), landscape (16:9), portrait (9:16), and many others. The system automatically optimizes images for quality and file size based on your selected format.",
  },
  {
    id: 3,
    question: "How do I get the best results from AI image generation?",
    answer:
      "For optimal results, be specific and descriptive in your prompts. Include details about style, lighting, composition, and mood. You can also upload reference images to guide the transformation process. Experiment with different aspect ratios and formats to find what works best for your project.",
  },
  {
    id: 4,
    question: "Can I use the generated images commercially?",
    answer:
      "Yes, images generated through our platform can be used for commercial purposes. However, we recommend reviewing the specific terms of service and ensuring your use case complies with applicable copyright and intellectual property laws. Always respect third-party rights when creating derivative works.",
  },
  {
    id: 5,
    question: "How does the credit system work?",
    answer:
      "Our platform uses a credit-based system where each image generation consumes credits. Different generation types and quality settings may use varying amounts of credits. You can purchase credit packages or subscribe to monthly plans that include credit allowances for regular use.",
  },
  {
    id: 6,
    question: "Is my uploaded content secure and private?",
    answer:
      "Yes, we take privacy and security seriously. Uploaded images are processed securely and are not stored permanently on our servers. We use industry-standard encryption and security practices to protect your content throughout the generation process.",
  },
]

export default function FAQ() {
  return (
    <div id="faq" className="bg-background">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
        <h2 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">Frequently asked questions</h2>
        <dl className="mt-20 divide-y divide-foreground/10">
          {faqs.map((faq) => (
            <div key={faq.id} className="py-8 first:pt-0 last:pb-0 lg:grid lg:grid-cols-12 lg:gap-8">
              <dt className="text-base/7 font-semibold text-foreground lg:col-span-5">{faq.question}</dt>
              <dd className="mt-4 lg:col-span-7 lg:mt-0">
                <p className="text-base/7 text-muted-foreground">{faq.answer}</p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
} 