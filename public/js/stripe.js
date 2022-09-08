import axios from 'axios';
import Stripe from 'stripe';
import { showAlert, hideAlert } from './alert';

const stripe = Stripe(
  'pk_test_51LeCX8SAm9OnfDc1UF9u7rf2ddEjzv1eMoIIvIMu7zAlRLEGWiWy8Qr4E51I8l5DSlSmFAFotWwOFAdN9NkFBD54009nhJYLHb'
);
export const bookTour = async (tourId) => {
  try {
    const session = await axios(`/api/v1/booking/checkout-session/${tourId}`);

    // await stripe.redirectToCheckout({
    //   sessionId: session.data.session.id
    // });
    window.location.replace(session.data.session.url);
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
