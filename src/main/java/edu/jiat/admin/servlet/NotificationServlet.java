package edu.jiat.admin.servlet;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.DocumentSnapshot;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

@WebServlet(name = "NotificationServlet", urlPatterns = {"/updateOrderStatus"})
public class NotificationServlet extends HttpServlet {

    @Override
    public void init() throws ServletException {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                InputStream serviceAccount = NotificationServlet.class.getResourceAsStream("/private-key.json");

                if (serviceAccount == null) {
                    throw new Exception("private-key.json not found in resources!");
                }

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();

                FirebaseApp.initializeApp(options);
            }
        } catch (Exception e) {
            System.err.println("Firebase Init Error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String orderId = request.getParameter("orderId");
        String status = request.getParameter("status");
        String userId = request.getParameter("userId");
        String totalInput = request.getParameter("total");

        String deliveryFeeStr = request.getParameter("deliveryFee");

        try {
            Firestore db = FirestoreClient.getFirestore();

            //Firestore Order Update
            Map<String, Object> orderUpdates = new HashMap<>();
            orderUpdates.put("status", status);

            if ("Approved".equals(status)) {

                if (totalInput != null && !totalInput.isEmpty()) {
                    try {
                        double totalDouble = Double.parseDouble(totalInput);
                        orderUpdates.put("total", totalDouble);
                    } catch (NumberFormatException e) {
                        System.err.println("Invalid price format: " + totalInput);
                    }
                }


                if (deliveryFeeStr != null && !deliveryFeeStr.isEmpty()) {
                    try {
                        double deliveryFee = Double.parseDouble(deliveryFeeStr);
                        orderUpdates.put("deliveryFee", deliveryFee);
                    } catch (NumberFormatException e) {
                        System.err.println("Invalid delivery fee format: " + deliveryFeeStr);
                        orderUpdates.put("deliveryFee", 0.0);
                    }
                }

                orderUpdates.put("approvedTimestamp", com.google.cloud.Timestamp.now());
            }

            db.collection("orders").document(orderId).update(orderUpdates);

            String messageBody;
            String notifTitle;

            if ("Approved".equals(status)) {
                notifTitle = "Order Approved! ✅";
                messageBody = "Your order #" + orderId + " is approved. Total: LKR " + totalInput;
            } else if ("Rejected".equals(status)) {
                notifTitle = "Order Rejected ❌";
                messageBody = "Sorry, your order #" + orderId + " was rejected.";
            } else {
                notifTitle = "Order Update 💊";
                messageBody = "Your order #" + orderId + " is now " + status;
            }

            // User FCM Token
            DocumentSnapshot userDoc = db.collection("users").document(userId).get().get();
            String fcmToken = userDoc.getString("fcmToken");

            if (fcmToken != null && !fcmToken.isEmpty()) {
                Message message = Message.builder()
                        .setNotification(Notification.builder()
                                .setTitle(notifTitle)
                                .setBody(messageBody)
                                .build())
                        .setToken(fcmToken)
                        .build();

                FirebaseMessaging.getInstance().send(message);
            }

            // History
            Map<String, Object> notificationData = new HashMap<>();
            notificationData.put("userId", userId);
            notificationData.put("orderId", orderId);
            notificationData.put("title", notifTitle);
            notificationData.put("body", messageBody);
            notificationData.put("timestamp", com.google.cloud.Timestamp.now());
            notificationData.put("isRead", false);

            db.collection("notifications").add(notificationData);

            response.getWriter().write("Success");

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Error: " + e.getMessage());
        }
    }
}