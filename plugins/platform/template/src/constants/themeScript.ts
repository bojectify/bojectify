/**
 * Blocking inline script that runs before React hydration to prevent
 * a flash of the wrong colour scheme or intro animation. Reads
 * persisted preferences from localStorage and sets data attributes
 * on `<html>` before the first paint.
 *
 * - `data-theme`: When 'light' or 'dark', overrides CSS `light-dark()`.
 * - `data-skip-intro`: When present, CSS hides the hero section so
 *   the intro animation never flashes before React hydrates.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var d=document.documentElement,p=localStorage.getItem('theme-preference');if(p==='light'||p==='dark'){d.setAttribute('data-theme',p)}if(localStorage.getItem('show-intro-animation')==='false'){d.setAttribute('data-skip-intro','')}}catch(e){}})()`;
