
export interface EditorState {
  image: string | null;
  logo: string | null;
  headline: string;
  archiveLabel: string;
  footerText: string;
  instagramText: string;
  tiktokText: string;
  representativeLabel: string;
  newsLabel: string;
  showArchiveLabel: boolean;
  showLogo: boolean;
  showSocialIcons: boolean;
  showFacebook: boolean;
  showInstagram: boolean;
  showTikTok: boolean;
  showRepresentativeLabel: boolean;
  showNewsLabel: boolean;
  logoScale: number;
  imageOffsetX: number;
  imageOffsetY: number;
  imageZoom: number;
  // Watermark fields
  showWatermark: boolean;
  watermarkOpacity: number;
  watermarkScale: number;
  watermarkOffsetX: number;
  watermarkOffsetY: number;
  watermarkColor: 'white' | 'black' | 'normal';
  watermarkHasOutline: boolean;
  // Locking states
  isImageLocked: boolean;
  isLogoLocked: boolean;
  isHeadlineLocked: boolean;
  isSocialsLocked: boolean;
}

export interface CanvasDimensions {
  width: number;
  height: number;
}
