import { threads, simd } from 'wasm-feature-detect';
import webpDataUrl from 'data-url:./tiny.webp';
import avifDataUrl from 'data-url:./tiny.avif';

// Give TypeScript the correct global.
declare var self: ServiceWorkerGlobalScope;

// Initial app stuff
import swUrl from 'service-worker:sw';

// The processors and codecs
// Simple stuff everyone gets:
import * as featuresWorker from 'entry-data:../features-worker';

// Decoders (some are feature detected)
import * as avifDec from 'entry-data:codecs/avif/dec/avif_dec';
import * as webpDec from 'entry-data:codecs/webp/dec/webp_dec';

// AVIF
import * as avifEncMt from 'entry-data:codecs/avif/enc/avif_enc_mt';
import * as avifEnc from 'entry-data:codecs/avif/enc/avif_enc';

// JXL
import * as jxlEncMtSimd from 'entry-data:codecs/jxl/enc/jxl_enc_mt_simd';
import * as jxlEncMt from 'entry-data:codecs/jxl/enc/jxl_enc_mt';
import * as jxlEnc from 'entry-data:codecs/jxl/enc/jxl_enc';

// OXI
import * as oxiMt from 'entry-data:codecs/oxipng/pkg-parallel/squoosh_oxipng';
import * as oxi from 'entry-data:codecs/oxipng/pkg/squoosh_oxipng';

// WebP
import * as webpEncSimd from 'entry-data:codecs/webp/enc/webp_enc_simd';
import * as webpEnc from 'entry-data:codecs/webp/enc/webp_enc';

// WP2
import * as wp2EncMtSimd from 'entry-data:codecs/wp2/enc/wp2_enc_mt_simd';
import * as wp2EncMt from 'entry-data:codecs/wp2/enc/wp2_enc_mt';
import * as wp2Enc from 'entry-data:codecs/wp2/enc/wp2_enc';

export function shouldCacheDynamically(url: string) {
  return url.startsWith('/c/demo-');
}

let initialJs = new Set([
  // Exclude features Worker itself - it's referenced from the main app,
  // but is meant to be cached lazily.
  featuresWorker.main,
  // Also exclude Service Worker itself (we're inside right now).
  swUrl,
]);

export const initial = ['/', ...initialJs];

export const theRest = (async () => {
  const [supportsThreads, supportsSimd, supportsWebP, supportsAvif] =
    await Promise.all([
      threads(),
      simd(),
      ...[webpDataUrl, avifDataUrl].map(async (dataUrl) => {
        if (!self.createImageBitmap) return false;
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        return createImageBitmap(blob).then(
          () => true,
          () => false
        );
      }),
    ]);

  const items: string[] = [];

  function addWithDeps(entry: typeof import('entry-data:*')) {
    items.push(entry.main, ...entry.deps);
  }

  addWithDeps(featuresWorker);

  if (!supportsAvif) addWithDeps(avifDec);
  if (!supportsWebP) addWithDeps(webpDec);

  // AVIF
  if (supportsThreads) {
    addWithDeps(avifEncMt);
  } else {
    addWithDeps(avifEnc);
  }

  // JXL
  if (supportsThreads && supportsSimd) {
    addWithDeps(jxlEncMtSimd);
  } else if (supportsThreads) {
    addWithDeps(jxlEncMt);
  } else {
    addWithDeps(jxlEnc);
  }

  // OXI
  if (supportsThreads) {
    addWithDeps(oxiMt);
  } else {
    addWithDeps(oxi);
  }

  // WebP
  if (supportsSimd) {
    addWithDeps(webpEncSimd);
  } else {
    addWithDeps(webpEnc);
  }

  // WP2
  if (supportsThreads && supportsSimd) {
    addWithDeps(wp2EncMtSimd);
  } else if (supportsThreads) {
    addWithDeps(wp2EncMt);
  } else {
    addWithDeps(wp2Enc);
  }

  return [...new Set(items)];
})();
