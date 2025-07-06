import { delayPrint } from './ui.js';
export function hero(heroText: HTMLElement, text: string, delay: number = 100) {
    setTimeout(() => {
        scrollTo({
            top: (window.innerHeight ? window.innerHeight : document.documentElement.clientHeight)*0.5,
            behavior: 'smooth'
        });
    }, delay * text.length + 500);
    document.querySelector('header')!.classList.add('hide');

    document.addEventListener('scroll',() => {
        const scrollPer = window.scrollY / (window.innerHeight ? window.innerHeight : document.documentElement.clientHeight);
        if(scrollPer > 0.2 && scrollPer < 0.8){
            heroText.classList.add('absolute-position');
            document.querySelector('header')!.classList.remove('hide');
        }
        else if(scrollPer < 0.8){
            document.querySelector('header')!.classList.add('hide');
            heroText.classList.remove('absolute-position');
        }
    });

    delayPrint(heroText,text,delay);
}