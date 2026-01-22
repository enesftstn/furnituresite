export function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  // If it's a placeholder, return as-is
  if (src.includes('placeholder.svg')) {
    return src
  }
  
  // If using Supabase storage, you can add transformation params
  if (src.includes('supabase.co')) {
    return `${src}?width=${width}&quality=${quality || 75}`
  }
  
  // Default return
  return src
}
