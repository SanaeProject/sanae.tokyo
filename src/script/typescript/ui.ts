/*#################################################################################
   ####     ####    ##  ##    ####    ######   #####    #####      #### 
 ###   #   ## ##    ##  ##   ## ##    ##       ##  ##   ##  ##      ##  
 ##        ## ##    ### ##   ## ##    ##       ##  ##   ##  ##      ##  
  ######   ######  #### ##   ######  ######   ######   ######      ##   
      ##  ##   ##  ## ###   ##   ##  ##       ##       ####        ##   
 ##  ##   ##   ##  ##  ##   ##   ##  ##       ##       ## ##    #  ##   
  ####    ##   ##  ##  ##   ##   ##  #####    ##       ##  ###  ####    

  * Copyright 2024 SanaePRJ. All Rights Reserved.
#################################################################################*/

import { throttle } from "./util.js";

let writingElements: Array<HTMLElement> = [];
/**
 * A function that simulates typing effect on a given HTML element.
 * It prints the provided text character by character with a delay between each character.
 * If the element is already being written to, the function waits until it finishes.
 *
 * @param eleOrSel - The HTML element or its selector to write the text to.
 * @param text     - The text to be printed.
 * @param interval - The delay between each character in milliseconds.
 * @param add      - If true, the text will be appended to the existing content of the element.
 *                   If false, the element's content will be replaced with the text.
 *                   Default value is false.
 *
 * @returns A Promise that resolves when the text has been fully printed.
 *
 * @example
 * ```typescript
 * const element = document.getElementById('myElement');
 * delayPrint(element, 'Hello, World!', 100);
 * ```
 */
export async function delayPrint(
    eleOrSel : HTMLElement | string,
    text     : string,
    interval : number,
    add      : boolean = false
): Promise<void> {
    const element: HTMLElement = typeof eleOrSel === "string" ? document.querySelector(eleOrSel) as HTMLElement : eleOrSel;
    const is_existing = (): boolean => {
        return writingElements.includes(element);
    };

    // Wait until it finishes
    while (is_existing())
        await new Promise((resolve) => setTimeout(resolve, interval));

    // lock to write element
    writingElements.push(element);

    let writeContent: string;
    if (add)
        writeContent = (element.textContent ?? '') + text;
    else
        writeContent = text;

    let writeCount: number = add ? (element.textContent?.length ?? 0) : 0;

    const printInterval = setInterval(() => {
        if (writeCount < writeContent.length) {
            element.innerHTML = writeContent.substring(0, writeCount + 1) + '_';
            writeCount++;
        } else {
            element.innerHTML = writeContent;
            clearInterval(printInterval);

            writingElements = writingElements.filter(
                (elements) => elements !== element,
            );
        }
    }, interval);
}

/**
 * Toggles the visibility of HTML elements based on their position in the viewport.
 * 
 * @param elements       - An array of HTML elements to observe for visibility changes.
 * @param visibleStyle   - A callback function that applies styles or performs actions when an element becomes visible.
 *                          It receives an IntersectionObserverEntry object as its parameter.
 * @param invisibleStyle - A callback function that applies styles or performs actions when an element becomes invisible.
 *                          It receives an IntersectionObserverEntry object as its parameter.
 * 
 * @returns void
 */
export function toggleVisibilityOnScroll(
    elements      : HTMLElement[],
    visibleStyle  : (entry: IntersectionObserverEntry) => void,
    invisibleStyle: (entry: IntersectionObserverEntry) => void
) {
    const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) 
                visibleStyle(entry);
            else 
                invisibleStyle(entry);
        });
    });

    elements.forEach(element => {obs.observe(element);});
}


let lastScroll = scrollY;
/**
 * Toggles CSS classes on specified elements based on scroll direction.
 * 
 * @param elements - An array of HTMLElements to apply the style changes to.
 * @param duration - The minimum scroll distance required to trigger the style change.
 * @param className - A tuple containing two class names: [upClassName, downClassName].
 *                    upClassName is applied when scrolling up, downClassName when scrolling down.
 * 
 * @returns void
 * 
 * @remarks
 * This function adds a scroll event listener to the document. On each scroll event,
 * it compares the current scroll position with the last recorded position.
 * If the scroll distance exceeds the specified duration, it removes both classes
 * from all elements and then adds the appropriate class based on scroll direction.
 */
export function toggleStyleOnScroll(
    elements : HTMLElement[],
    duration : number,
    className: [upClassName:string,downClassName:string]
){
    document.addEventListener("scroll",throttle(()=>{
        let nowScroll = window.scrollY;

        if(Math.abs(nowScroll - lastScroll) < duration)
            return;

        // remove className by classList
        className.forEach((classes) =>{
            elements.forEach(element=>element.classList.remove(classes));
        });

        // up
        if(nowScroll < lastScroll)
            elements.forEach(element=>element.classList.add(className[0]));
        // down
        else
            elements.forEach(element=>element.classList.add(className[1]));

        // update lastScroll
        lastScroll = nowScroll;
    },100));
}
document.addEventListener("DOMContentLoaded", () => { 
    const elements = Array.from(document.querySelectorAll<HTMLElement>("section")); 
    toggleVisibilityOnScroll( elements, (entry) => {
            if(!entry.target.classList.contains("visited"))
                entry.target.classList.add("visited");
            
            entry.target.classList.add("visible");
        }, (entry) => {
            entry.target.classList.remove("visible");
        }
    ); 
});

/**
 * Reads the content of a selected file and returns it as a string, ArrayBuffer, or null.
 *
 * @param element - The HTML input element representing the file input field.
 * 
 * @returns A Promise that resolves with the file content as a string, ArrayBuffer, or null.
 *          If the file content type is not supported, the Promise will reject with an error.
 *
 * @throws Will throw an error if the element type is not 'file'.
 * @throws Will throw an error if no file is selected.
 *
 * @example
 * ```typescript
 * const fileInput = document.getElementById('file-input') as HTMLInputElement;
 * readSelectedFileContent(fileInput)
 *   .then((content) => {
 *     console.log(content);
 *   })
 *   .catch((error) => {
 *     console.error(error);
 *   });
 * ```
 */
export async function readSelectedFileContent(
    element: HTMLInputElement,
): Promise<string | ArrayBuffer | null> {
    if (element.type !== 'file') 
        throw new Error('element type must file');

    const file = element.files![0];
    if (!file) 
        throw new Error('not selected file');

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            resolve(event.target!.result);
        };
        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsText(file);
    });
}

/**
 * Asynchronously reads the content of a file from a given URL.
 *
 * @param url - The URL of the file to be read.
 * @returns A Promise that resolves with the content of the file as a string.
 * @throws Will throw an Error if the HTTP request fails, including the status code in the error message.
 */
export async function readFile(url: URL): Promise<string> {
    let file = await fetch(url);
    if (!file.ok)
        throw new Error(`HTTP error! status: ${file.status}`);

    return await file.text();
}

/**
 * Saves the current scroll position to local storage.
 */
export function saveScrollPosition() {
    const scrollPosition = window.scrollY;
    localStorage.setItem('scrollPosition', scrollPosition.toString());
}

/**
 * Restores the scroll position from local storage.
 * If a scroll position is found, it scrolls to that position and removes it from local storage.
 */
export function restoreScrollPosition() {
    const scrollPosition = localStorage.getItem('scrollPosition');
    if (scrollPosition) {
        window.scrollTo(0, parseInt(scrollPosition));
        localStorage.removeItem('scrollPosition');
    }
}
