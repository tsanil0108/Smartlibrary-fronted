const RAZORPAY_SCRIPT_URL =
  "https://checkout.razorpay.com/v1/checkout.js";

let sdkPromise = null;

// ==========================================
// LOAD RAZORPAY SDK
// ==========================================

export function loadRazorpayScript() {

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (sdkPromise) {
    return sdkPromise;
  }

  sdkPromise = new Promise((resolve, reject) => {

    const script = document.createElement("script");

    script.src = RAZORPAY_SCRIPT_URL;

    script.async = true;

    const timeout = setTimeout(() => {

      script.remove();

      reject(
        new Error("Payment gateway loading timed out.")
      );

    }, 15000);

    script.onload = () => {

      clearTimeout(timeout);

      if (window.Razorpay) {
        resolve(true);
      } else {
        script.remove();
        reject(
          new Error("Payment gateway is unavailable.")
        );
      }
    };

    script.onerror = () => {

      clearTimeout(timeout);

      script.remove();

      reject(
        new Error("Unable to load Razorpay Checkout.")
      );
    };

    document.head.appendChild(script);

  }).catch((error) => {

    sdkPromise = null;

    throw error;
  });

  return sdkPromise;
}

// ==========================================
// OPEN RAZORPAY CHECKOUT
// ==========================================

export async function openRazorpayCheckout(order) {

  await loadRazorpayScript();

  if (
    !order?.orderId ||
    !order?.razorpayOrderId ||
    !order?.razorpayKeyId ||
    !Number.isInteger(order.payablePaise) ||
    order.payablePaise <= 0 ||
    order.currency !== "INR"
  ) {
    throw new Error("Invalid payment order details.");
  }

  return new Promise((resolve, reject) => {

    let settled = false;

    function finish(result) {

      if (settled) return;

      settled = true;

      resolve(result);
    }

    const options = {

      key: order.razorpayKeyId,

      amount: order.payablePaise,

      currency: order.currency,

      name: "Smart Library",

      description:
        `${order.planName} - ${order.membershipDays} Days`,

      order_id: order.razorpayOrderId,

      prefill: {

        name: order.memberName || "",

        email: order.memberEmail || "",
      },

      theme: {
        color: "#6339EF",
      },

      retry: {
        enabled: true,
      },

      modal: {

        confirm_close: true,

        escape: true,

        ondismiss: function () {

          finish({
            status: "DISMISSED",
            orderId: order.orderId,
          });
        },
      },

      handler: function (response) {

        finish({

          status: "SUBMITTED",

          payload: {

            orderId: order.orderId,

            razorpayOrderId:
              response.razorpay_order_id,

            razorpayPaymentId:
              response.razorpay_payment_id,

            razorpaySignature:
              response.razorpay_signature,
          },
        });
      },
    };

    try {

      const razorpay = new window.Razorpay(options);

      razorpay.open();

    } catch (error) {

      if (!settled) {

        settled = true;

        reject(error);
      }
    }
  });
}