
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, Upload, Loader2, Lock, Unlock, Instagram, Music2, Eye, Facebook } from 'lucide-react';
import { EditorState } from './types';

const THEME_RED = "#a11b1b";
const FB_BLUE = "#1877F2";

const App: React.FC = () => {
  const [state, setState] = useState<EditorState>({
    image: null,
    logo: null, 
    headline: "اكتب العنوان الرئيسي هنا",
    archiveLabel: "", 
    footerText: "", 
    instagramText: "Gawany Official",
    tiktokText: "Gawany Official",
    representativeLabel: "صورة تمثيلية",
    newsLabel: "خبر",
    showArchiveLabel: false,
    showLogo: false,
    showSocialIcons: false,
    showFacebook: false,
    showInstagram: false, 
    showTikTok: false,    
    showRepresentativeLabel: true,
    showNewsLabel: true,
    logoScale: 140, 
    imageOffsetX: 0,
    imageOffsetY: 0,
    imageZoom: 100,
    showWatermark: false,
    watermarkOpacity: 25,
    watermarkScale: 150,
    watermarkOffsetX: 0,
    watermarkOffsetY: -150,
    watermarkColor: 'white',
    watermarkHasOutline: true,
    isImageLocked: false,
    isLogoLocked: true,
    isHeadlineLocked: false,
    isSocialsLocked: false,
  });

  const [isDownloading, setIsDownloading] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const mainImgRef = useRef<HTMLImageElement | null>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const instagramIconRef = useRef<HTMLImageElement | null>(null);
  const tiktokIconRef = useRef<HTMLImageElement | null>(null);

  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const lastPinchDist = useRef<number | null>(null);

  const [iconsLoaded, setIconsLoaded] = useState(false);

  useEffect(() => {
    document.fonts.ready.then(() => {
      setFontsLoaded(true);
    });

    // Load social icons
    const ig = new Image();
    ig.crossOrigin = "anonymous";
    ig.src = "https://ais-dev-ms5sm6i77sivrkz7lrtvgb-410071741857.europe-west2.run.app/api/images/1";
    
    const tt = new Image();
    tt.crossOrigin = "anonymous";
    tt.src = "https://ais-dev-ms5sm6i77sivrkz7lrtvgb-410071741857.europe-west2.run.app/api/images/0";

    let loadedCount = 0;
    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount === 2) {
        instagramIconRef.current = ig;
        tiktokIconRef.current = tt;
        setIconsLoaded(true);
      }
    };

    ig.onload = checkLoaded;
    tt.onload = checkLoaded;
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (state.isImageLocked) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
            mainImgRef.current = img;
            setState(prev => ({ 
              ...prev, 
              image: event.target?.result as string,
              imageOffsetX: 0,
              imageOffsetY: 0,
              imageZoom: 100
            }));
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
            logoImgRef.current = img;
            setState(prev => ({ 
              ...prev, 
              logo: event.target?.result as string,
              showLogo: true
            }));
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const getLines = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    if (!text) return [];
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0] || "";

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const drawCanvas = useCallback(() => {
    if (!fontsLoaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const W = 1080;
    const H = 1350;
    canvas.width = W;
    canvas.height = H;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    if (mainImgRef.current) {
      const mainImg = mainImgRef.current;
      const aspect = mainImg.width / mainImg.height;
      const targetAspect = W / H;
      let drawW, drawH;

      if (aspect > targetAspect) {
        drawH = H;
        drawW = H * aspect;
      } else {
        drawW = W;
        drawH = W / aspect;
      }

      const zoom = state.imageZoom / 100;
      drawW *= zoom;
      drawH *= zoom;

      const drawX = (W - drawW) / 2 + state.imageOffsetX;
      const drawY = (H - drawH) / 2 + state.imageOffsetY;
      ctx.drawImage(mainImg, drawX, drawY, drawW, drawH);

      // Maroon tint overlay (10% opacity)
      ctx.fillStyle = 'rgba(93, 14, 29, 0.1)';
      ctx.fillRect(0, 0, W, H);
    }

    // Gradient bar at the bottom (#5D0E1D) - Solid at bottom/text, fades at top
    const barHeight = 580;
    const grad = ctx.createLinearGradient(0, H - barHeight, 0, H);
    grad.addColorStop(0, 'rgba(93, 14, 29, 0)');   // Start transparent
    grad.addColorStop(0.3, 'rgba(93, 14, 29, 0.7)'); // Gradual fade
    grad.addColorStop(0.5, 'rgba(93, 14, 29, 1)');   // Become fully solid
    grad.addColorStop(1, 'rgba(93, 14, 29, 1)');     // Stay solid to bottom
    ctx.fillStyle = grad;
    ctx.fillRect(0, H - barHeight, W, barHeight);

    // Draw Logo (Top Right)
    if (state.showLogo && logoImgRef.current) {
      const logo = logoImgRef.current;
      const scale = state.logoScale / 100;
      const targetW = 200 * scale;
      const targetH = (logo.height / logo.width) * targetW;
      
      const padding = 40;
      const logoX = W - targetW - padding;
      const logoY = padding;

      const getColoredCanvas = (color: string, w: number, h: number) => {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = w;
        offCanvas.height = h;
        const offCtx = offCanvas.getContext('2d');
        if (offCtx) {
          offCtx.drawImage(logo, 0, 0, w, h);
          offCtx.globalCompositeOperation = 'source-in';
          offCtx.fillStyle = color;
          offCtx.fillRect(0, 0, w, h);
        }
        return offCanvas;
      };

      const maroonLogo = getColoredCanvas('rgb(93, 14, 29)', targetW, targetH);
      const whiteLogo = getColoredCanvas('#FFFFFF', targetW, targetH);

      // Draw Maroon Outline (Outer - Thicker)
      const outerStroke = 12;
      for (let i = 0; i < 360; i += 22.5) {
        const rad = (i * Math.PI) / 180;
        ctx.drawImage(maroonLogo, logoX + Math.cos(rad) * outerStroke, logoY + Math.sin(rad) * outerStroke);
      }

      // Draw White Outline (Inner - Subtle)
      const innerStroke = 4;
      for (let i = 0; i < 360; i += 45) {
        const rad = (i * Math.PI) / 180;
        ctx.drawImage(whiteLogo, logoX + Math.cos(rad) * innerStroke, logoY + Math.sin(rad) * innerStroke);
      }
      
      ctx.drawImage(logo, logoX, logoY, targetW, targetH);
    }

    if (state.headline) {
      const maxWidth = W - 140; // Increased width to allow more words
      ctx.font = 'bold 52px Almarai';
      
      const words = state.headline.split(' ');
      const lines: string[][] = [];
      const wordsPerLine = 5;
      
      for (let i = 0; i < words.length; i += wordsPerLine) {
        lines.push(words.slice(i, i + wordsPerLine));
      }

      const lineHeight = 70;
      const headlineTotalHeight = lines.length * lineHeight;
      
      // Draw Headline (Centered)
      ctx.save();
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 0; // Perfectly centered shadow
      ctx.shadowOffsetY = 4;
      ctx.textBaseline = 'middle';
      
      // Position text inside the solid part of the bar
      const startY = H - (barHeight * 0.38) - (headlineTotalHeight / 2);

      // Draw News Label (Text with Vertical Line)
      if (state.showNewsLabel && state.newsLabel) {
        ctx.save();
        ctx.font = 'bold 45px Almarai';
        
        // Position
        const textX = W - 120; // Right aligned with padding
        const textY = startY - 180; 
        
        // Draw Vertical Yellow Line at the beginning (right side for RTL)
        ctx.fillStyle = '#FFFF00';
        const vLineHeight = 55;
        const vLineWidth = 10;
        ctx.fillRect(textX + 20, textY - vLineHeight/2, vLineWidth, vLineHeight);
        
        // Draw Text
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 3;
        ctx.fillText(state.newsLabel, textX, textY + 5);
        
        ctx.restore();
      }
      
      let globalWordIndex = 0;
      lines.forEach((lineWords, i) => {
        ctx.font = 'bold 52px Almarai';
        
        // Calculate total width by summing individual words and spaces for absolute precision
        let totalLineWidth = 0;
        const wordWidths = lineWords.map(w => ctx.measureText(w).width);
        const spaceWidth = ctx.measureText(' ').width;
        
        wordWidths.forEach((w, idx) => {
          totalLineWidth += w;
          if (idx < lineWords.length - 1) totalLineWidth += spaceWidth;
        });

        // Align the right edge of the line slightly to the right (W - 80)
        const lineRightEdge = W - 80;
        let currentX = lineRightEdge;
        
        // Draw words from right to left for Arabic
        lineWords.forEach((word, idx) => {
          ctx.font = 'bold 52px Almarai'; 
          const wordWidth = wordWidths[idx];
          
          // Custom color pattern: 1st white, 2nd-3rd yellow, 4th-5th white, 6th yellow, 7th-9th white, 10th-12th yellow, 13th+ white
          let isYellow = false;
          if (globalWordIndex === 0) isYellow = false;
          else if (globalWordIndex === 1 || globalWordIndex === 2) isYellow = true;
          else if (globalWordIndex === 3 || globalWordIndex === 4) isYellow = false;
          else if (globalWordIndex === 5) isYellow = true;
          else if (globalWordIndex >= 6 && globalWordIndex <= 8) isYellow = false;
          else if (globalWordIndex >= 9 && globalWordIndex <= 11) isYellow = true;
          else isYellow = false;
          
          ctx.fillStyle = isYellow ? '#FFFF00' : '#FFFFFF';
          
          ctx.textAlign = 'right';
          ctx.fillText(word, Math.round(currentX), Math.round(startY + (i * lineHeight)));
          
          currentX -= (wordWidth + spaceWidth);
          globalWordIndex++;
        });
      });
      ctx.restore();

    }

  }, [state, fontsLoaded, iconsLoaded]);

  useEffect(() => {
    const frameId = requestAnimationFrame(drawCanvas);
    return () => cancelAnimationFrame(frameId);
  }, [drawCanvas]);

  const handleStart = (x: number, y: number) => {
    if (state.isImageLocked) return;
    isDragging.current = true;
    lastPos.current = { x, y };
  };

  const handleMove = (x: number, y: number) => {
    if (!isDragging.current || !canvasRef.current || state.isImageLocked) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const sx = 1080 / rect.width;
    const sy = 1350 / rect.height;
    const dx = (x - lastPos.current.x) * sx;
    const dy = (y - lastPos.current.y) * sy;
    
    setState(p => ({
      ...p,
      imageOffsetX: p.imageOffsetX + dx,
      imageOffsetY: p.imageOffsetY + dy
    }));
    lastPos.current = { x, y };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (state.isImageLocked) return;
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
      lastPinchDist.current = null;
    } else if (e.touches.length === 2) {
      isDragging.current = true;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.sqrt(Math.pow(t2.clientX - t1.clientX, 2) + Math.pow(t2.clientY - t1.clientY, 2));
      lastPinchDist.current = dist;
      // Midpoint for panning while pinching
      lastPos.current = { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (state.isImageLocked || !isDragging.current) return;
    
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    } else if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.sqrt(Math.pow(t2.clientX - t1.clientX, 2) + Math.pow(t2.clientY - t1.clientY, 2));
      
      const midX = (t1.clientX + t2.clientX) / 2;
      const midY = (t1.clientY + t2.clientY) / 2;

      // Handle Zoom
      if (lastPinchDist.current !== null) {
        const delta = dist - lastPinchDist.current;
        setState(p => ({
          ...p,
          imageZoom: Math.max(20, Math.min(600, p.imageZoom + delta * 0.5))
        }));
      }

      // Handle Pan while pinching
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const sx = 1080 / rect.width;
        const sy = 1350 / rect.height;
        const dx = (midX - lastPos.current.x) * sx;
        const dy = (midY - lastPos.current.y) * sy;
        setState(p => ({
          ...p,
          imageOffsetX: p.imageOffsetX + dx,
          imageOffsetY: p.imageOffsetY + dy
        }));
      }

      lastPinchDist.current = dist;
      lastPos.current = { x: midX, y: midY };
    }
  };

  const handleEnd = () => {
    isDragging.current = false;
    lastPinchDist.current = null;
  };

  const downloadImage = () => {
    if (!canvasRef.current || isDownloading) return;
    setIsDownloading(true);
    canvasRef.current.toBlob(b => {
      if (b) {
        const u = URL.createObjectURL(b);
        const l = document.createElement('a');
        l.download = `SohagNews-${Date.now()}.png`;
        l.href = u;
        l.click();
        setTimeout(() => { URL.revokeObjectURL(u); setIsDownloading(false); }, 1000);
      }
    }, 'image/png', 1.0);
  };

  const toggleLock = (k: keyof EditorState) => setState(p => ({ ...p, [k]: !p[k] }));

  return (
    <div className="min-h-screen flex flex-col-reverse md:flex-row bg-[#0d0d0d]">
      <div className="w-full md:w-96 p-6 bg-[#161616] border-t md:border-t-0 md:border-l border-white/5 overflow-y-auto custom-scrollbar md:h-screen">
        <div className="mb-8 text-center hidden md:block border-b border-white/5 pb-6">
            <h1 className="text-xl font-black text-white mb-1">مصمم الصور الإخبارية</h1>
            <p className="text-red-500 text-[10px] font-bold tracking-widest uppercase">Editor V2.0</p>
        </div>

        <div className="space-y-6 pb-20 md:pb-0">
          <section className="bg-[#1f1f1f] p-4 rounded-xl border border-white/5 space-y-4">
             <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">صورة الخبر</label>
                <button onClick={() => toggleLock('isImageLocked')} className={`p-1.5 rounded-lg ${state.isImageLocked ? 'bg-red-500/20 text-red-500' : 'bg-white/5'}`}>{state.isImageLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}</button>
             </div>
             <div onClick={() => !state.isImageLocked && fileInputRef.current?.click()} className="group h-24 border-2 border-dashed border-white/10 bg-white/5 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all hover:border-white/30">
                <Upload className="w-5 h-5 text-gray-600 mb-1" />
                <span className="text-[10px] text-gray-500 font-bold">رفع الصورة</span>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
             </div>
             {state.image && <input type="range" min="20" max="600" value={state.imageZoom} onChange={e => setState(p => ({...p, imageZoom: parseInt(e.target.value)}))} className="w-full accent-red-600 h-1 bg-black" />}
          </section>

          <section className="bg-[#1f1f1f] p-4 rounded-xl border border-white/5 space-y-4">
             <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">شعار القناة (اللوجو)</label>
                <div className="flex gap-2">
                  <button onClick={() => setState(p => ({...p, showLogo: !p.showLogo}))} className={`p-1.5 rounded-lg ${state.showLogo ? 'bg-blue-500/20 text-blue-500' : 'bg-white/5'}`}><Eye className="w-4 h-4" /></button>
                </div>
             </div>
             <div onClick={() => document.getElementById('logo-upload')?.click()} className="group h-24 border-2 border-dashed border-white/10 bg-white/5 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all hover:border-white/30">
                <Upload className="w-5 h-5 text-gray-600 mb-1" />
                <span className="text-[10px] text-gray-500 font-bold">رفع اللوجو</span>
                <input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
             </div>
             {state.logo && (
               <div className="space-y-2">
                 <div className="flex justify-between text-[10px] text-gray-400">
                   <span>حجم اللوجو (مثبت)</span>
                   <span>140%</span>
                 </div>
                 <input 
                   type="range" 
                   min="10" 
                   max="500" 
                   value={140} 
                   readOnly
                   className="w-full accent-gray-600 h-1 bg-black opacity-50 cursor-not-allowed"
                   disabled
                 />
               </div>
             )}
          </section>

          <section className="bg-[#1f1f1f] p-4 rounded-xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">محتوى الخبر</label>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-red-500 uppercase">خانة الخبر (نبيتي)</span>
                  <button onClick={() => setState(p => ({...p, showNewsLabel: !p.showNewsLabel}))} className={`p-1 ${state.showNewsLabel ? 'text-blue-500' : 'text-gray-600'}`}><Eye className="w-3.5 h-3.5" /></button>
                </div>
                {state.showNewsLabel && <input type="text" value={state.newsLabel} onChange={e => setState(p => ({...p, newsLabel: e.target.value}))} className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-center font-bold text-xs" dir="rtl" />}
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-gray-400">العنوان الرئيسي (أبيض)</span>
                <textarea value={state.headline} onChange={e => setState(p => ({...p, headline: e.target.value}))} className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-center font-bold text-lg min-h-[120px]" dir="rtl" />
              </div>
            </div>
          </section>

          <button onClick={downloadImage} disabled={!state.image || isDownloading} className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-800 text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl">
            {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            <span>حفظ الصورة</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-10 flex flex-col items-center justify-center bg-[#0d0d0d] relative overflow-hidden">
        <div className="max-w-full relative shadow-2xl rounded-sm overflow-hidden border border-white/5 bg-[#111] touch-none">
            <canvas 
              ref={canvasRef} 
              className="max-h-[70vh] w-auto block cursor-move" 
              style={{ aspectRatio: '1080 / 1350' }} 
              onMouseDown={e => handleStart(e.clientX, e.clientY)}
              onMouseMove={e => handleMove(e.clientX, e.clientY)}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleEnd}
            />
        </div>
        {!state.image && (
          <div className="mt-8 text-center text-gray-700 font-bold text-sm border border-dashed border-gray-800 px-6 py-4 rounded-xl">
            <p>تحكم كامل: حرك بإصبع واحد للتحريك، واستخدم إصبعين للتكبير والتصغير</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
