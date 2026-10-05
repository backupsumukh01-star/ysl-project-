export type CheckoutInput = {
  email: string;
  phone: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  quantity: number;
};

export type FieldErrors = Partial<Record<keyof CheckoutInput, string>>;

export type StoredOrder = {
  id: string;
  createdAt: string;
  quantity: number;
  amount: number | null;
  currency: string;
  shipping: number | null;
  paymentStatus: "not_collected";
  contact: {
    email: string;
    phone: string;
    name: string;
  };
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCheckout(input: CheckoutInput): FieldErrors {
  const errors: FieldErrors = {};
  if (!emailPattern.test(input.email.trim())) errors.email = "Enter a valid email.";
  if (input.phone.trim().length < 6) errors.phone = "Enter a phone number.";
  if (input.name.trim().length < 2) errors.name = "Enter the recipient name.";
  if (input.address.trim().length < 4) errors.address = "Enter a street address.";
  if (input.city.trim().length < 2) errors.city = "Enter a city.";
  if (input.state.trim().length < 2) errors.state = "Enter a state or region.";
  if (input.postcode.trim().length < 3) errors.postcode = "Enter a postcode.";
  if (input.country.trim().length < 2) errors.country = "Enter a country.";
  if (!Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > 10) {
    errors.quantity = "Choose a quantity from 1 to 10.";
  }
  return errors;
}
