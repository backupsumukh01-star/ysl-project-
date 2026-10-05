import { paymentMatchesOrder } from "../lib/payments/payment-match.mjs";

const expected = { amountMinor: 35000, currency: "USD", razorpayOrderId: "order_1", razorpayPaymentId: "pay_1" };
const captured = { id: "pay_1", order_id: "order_1", status: "captured", amount: 35000, currency: "usd" };
const failures: string[] = [];
function assert(name: string, condition: boolean) {
  if (!condition) {
    failures.push(name);
    console.error("FAIL", name);
  } else {
    console.log("PASS", name);
  }
}

assert("captured payment matches amount, currency, and ids", paymentMatchesOrder(captured, expected));
assert("wrong amount is rejected", !paymentMatchesOrder({ ...captured, amount: 100 }, expected));
assert("wrong currency is rejected", !paymentMatchesOrder({ ...captured, currency: "INR" }, expected));
assert("uncaptured payment is rejected", !paymentMatchesOrder({ ...captured, status: "authorized" }, expected));
assert("wrong payment id is rejected", !paymentMatchesOrder({ ...captured, id: "pay_other" }, expected));
assert("wrong order id is rejected", !paymentMatchesOrder({ ...captured, order_id: "order_other" }, expected));

if (failures.length) process.exit(1);
console.log("payment match checks passed");
