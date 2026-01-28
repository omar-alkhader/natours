const bookTourEl = document.getElementById('book-tour');
const stripe = Stripe(
  'pk_test_51SuTl6AC8ejlCwqE80yXkGjtBYFp8mzUTr2vqn7knQwBoQRqXOLsZITrtCiBbgwRAroSz0ZA1pT48tcyqHXYGo8I00L6VME4rc',
);
export const bookTour = async (tourId) => {
  try {
    const res = await fetch(`/api/v1/bookings/checkout-session/${tourId}`);
    const data = await res.json();
    if (!res.ok) {
      throw data;
    }
    window.location.href = data.session.url;
  } catch (err) {
    alert(err.message);
  }
};
