import { imageSize } from 'image-size'

// ... hero 이미지 outPath 작성 후
const { width, height } = imageSize(outPath) || {}
heroImage = {
  src: `/assets/notion/${page.id}/hero${ext}`,
  alt: props['Hero Alt']?.rich_text?.[0]?.plain_text ?? title,
  color: props['Hero Color']?.rich_text?.[0]?.plain_text,
  width,
  height
}