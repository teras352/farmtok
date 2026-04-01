const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();

exports.sendPushOnAccept = onDocumentUpdated(
  "orders/{orderId}",
  async (event) => {
    try {
      const before = event.data.before.data();
      const after = event.data.after.data();

      if (before.status === "pending" && after.status === "accepted") {

        const db = getFirestore();

        const userDoc = await db
          .collection("users")
          .doc(after.buyerId)
          .get();

        const userData = userDoc.data();

        if (!userData || !userData.pushToken) return;

        await getMessaging().send({
          notification: {
            title: "📦 Η παραγγελία σου έγινε αποδεκτή!",
            body: after.productName || "Δες την παραγγελία σου"
          },
          token: userData.pushToken
        });

        console.log("Push sent!");
      }
    } catch (error) {
      console.error(error);
    }
  }
);