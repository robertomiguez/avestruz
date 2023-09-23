export const checkImage = async (imageUrl: string, pubkey: string) => {
  if (!imageUrl) return import.meta.env.VITE_DEFAULT_IMAGE + pubkey;

  try {
    const res = await fetch('imageUrl', { method: 'HEAD' });
    if (res.ok) {
      return imageUrl;
    } else {
      return import.meta.env.VITE_DEFAULT_IMAGE + pubkey;
    }
  } catch (error) {
    console.log('error on image', error);
    return import.meta.env.VITE_DEFAULT_IMAGE + pubkey;
  }
};
