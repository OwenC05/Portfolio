import Image from 'next/image'

/** An actual public product preview, separate from the conceptual diagram contract. */
export function TypeForgePreview() {
  return (
    <figure className="product-preview">
      <Image
        src="/art/typeforge-demo.webp"
        width={1200}
        height={833}
        sizes="(max-width: 800px) calc(100vw - 40px), 52vw"
        alt="TypeForge's public typing-practice interface, showing its practice workspace."
        loading="lazy"
      />
      <figcaption>Product preview · In development</figcaption>
    </figure>
  )
}
