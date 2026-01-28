const bookTourEl = document.getElementById('book-tour');
const stripe = Stripe(
  'pk_test_51SuTl6AC8ejlCwqE80yXkGjtBYFp8mzUTr2vqn7knQwBoQRqXOLsZITrtCiBbgwRAroSz0ZA1pT48tcyqHXYGo8I00L6VME4rc',
);
export const bookTour = async (tourId) => {
  try {
    const res = await fetch(
      `http://127.0.0.1:5500/api/v1/bookings/checkout-session/${tourId}`,
    );
    const data = await res.json();
    if (!res.ok) {
      throw data;
    }
    console.log(data.session.id);
    console.log(stripe.redirectToCheckout);
    window.location.href = data.session.url;
  } catch (err) {
    console.log(err);
    alert(err.message);
  }
};
