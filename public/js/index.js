const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const leaflet = document.getElementById('map');
const bookTourEl = document.getElementById('book-tour');
const dataSetting = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

import { login, logout } from './login';
import { displayMap } from './leaflet';
import { bookTour } from './strip';
import { updateSettings } from './updateAccountSetting';
loginForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
if (leaflet) {
  const locations = JSON.parse(leaflet.dataset.locations);
  displayMap(locations);
}
console.log(logout);
logOutBtn?.addEventListener('click', logout);
bookTourEl?.addEventListener('click', (e) => {
  const tourId = e.target.dataset.tourId;
  bookTour(tourId);
});
if (dataSetting) {
  const name = document.getElementById('name');
  const nameValue = document.getElementById('name').value;
  const email = document.getElementById('email');
  const emailValue = document.getElementById('email').value;
  dataSetting?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    updateSettings(form, 'data');
  });
  if (userPasswordForm) {
    userPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      document.querySelector('.btn--save-password').textContent = 'Updating...';

      const password = document.getElementById('password-current').value;
      const newPassword = document.getElementById('password').value;
      const newPasswordConfirm =
        document.getElementById('password-confirm').value;
      await updateSettings(
        { password, newPassword, newPasswordConfirm },
        'password',
      );

      document.querySelector('.btn--save-password').textContent =
        'Save password';
      document.getElementById('password-current').value = '';
      document.getElementById('password').value = '';
      document.getElementById('password-confirm').value = '';
    });
  }
}
