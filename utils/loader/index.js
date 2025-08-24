
const preloader = document.getElementById('preloader');

export const showLoader = () => {
    preloader.style.display ='flex';
};

export const removeLoader = () => {
    preloader.style.display ='none';
}