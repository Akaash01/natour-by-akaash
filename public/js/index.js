import '@babel/polyfill';
import { logout } from './login';
import { login } from './login';
import { updateData } from './updateSettings';
import { bookTour } from './stripe';
const loginform = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-settings');
const bookBtn = document.getElementById('book-tour');
if (loginform) {
  loginform.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.querySelector('.email').value;
    const password = document.querySelector('.password').value;
    login(email, password);
  });
}
if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}
//
if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);
    updateData(form, 'data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    updateData({ passwordCurrent, password, passwordConfirm }, 'password');
  });
}

// console.log(bookBtn);
// console.log('hello');
if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'processing .....';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}
