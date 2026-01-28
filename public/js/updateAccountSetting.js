/* eslint-disable */
import axios from 'axios';
import { showAlert } from './showAlert';

// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  console.log(data);
  try {
    const url =
      type === 'password' ? '/api/v1/users/updatePassword' : '/api/v1/users/me';

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    console.log(res, 'res');
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
      window.setTimeout(() => {
        location.assign('/me');
      }, 1500);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', 'error');
  }
};
