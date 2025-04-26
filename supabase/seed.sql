-- Seed models table
INSERT INTO public.models (name, description, type, tier, provider, model_id, is_active)
VALUES
  ('Gemini Pro', 'Google''s multimodal AI model that can understand and generate text, code, and more.', 'text', 'premium', 'Google', 'gemini-pro', true),
  ('Mixtral 8x7B', 'Mixture of experts model with strong performance across various tasks.', 'text', 'free', 'Groq', 'mixtral-8x7b-32768', true),
  ('Llama 3 70B', 'Meta''s large language model with strong reasoning capabilities.', 'text', 'premium', 'Groq', 'llama3-70b-8192', true),
  ('Claude 3 Opus', 'Advanced AI assistant with strong reasoning and conversation capabilities.', 'text', 'ultra-premium', 'Anthropic', 'claude-3-opus-20240229', true),
  ('DALL-E 3', 'Create realistic images and art from natural language descriptions.', 'image', 'premium', 'OpenAI', 'dall-e-3', true),
  ('Stable Diffusion XL', 'Open-source image generation model with high-quality outputs.', 'image', 'free', 'Stability AI', 'sdxl', true),
  ('Midjourney', 'Create detailed and artistic images from text descriptions.', 'image', 'premium', 'Midjourney', 'midjourney-v5', true),
  ('Sora', 'Create realistic videos from text descriptions with spatial and temporal consistency.', 'video', 'ultra-premium', 'OpenAI', 'sora-1.0', true),
  ('Gen-2', 'Generate videos from text or image inputs with high quality.', 'video', 'premium', 'Runway', 'gen-2', true);
