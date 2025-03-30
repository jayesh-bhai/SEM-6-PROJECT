This is my SEMESTER 6 project and it is based on Machine Learning.


# **PhishNet-FL: Federated Learning for Phishing Detection**  

PhishNet-FL is a federated learning system designed to detect phishing websites while preserving user data privacy. Using **Flower** for federated learning and **TensorFlow** for deep learning, PhishNet-FL enables multiple clients to collaboratively train a phishing detection model without sharing raw data.  

This approach enhances security by distributing the learning process while still benefiting from shared knowledge.  

## **🚀 Features**  
✔ **Federated Learning (FL):** Clients train locally and only share model updates, ensuring data privacy.  
✔ **Phishing Detection Model:** A neural network trained on the UCI Phishing Websites Dataset.  
✔ **Decentralized Training:** No need to centralize sensitive data, reducing security risks.  
✔ **Scalable Architecture:** Supports multiple clients communicating with a central federated server.  
✔ **Easy Deployment:** Simple client-server setup with minimal dependencies.  

---

## **📂 Repository Structure**  
```
/PhishNet-FL
│── server.py          # Federated learning server
│── client.py          # Federated learning client
│── README.txt         # Project documentation
│── requirements.txt   # Dependencies
│── .gitignore         # Ignore unnecessary files
```

---

## **⚡ Installation**  

Before running the project, install the required dependencies:  
```bash
pip install -r requirements.txt
```

---

## **🖥 Running the Server**  

The **server** manages the federated learning process by coordinating clients and aggregating their updates.  

```bash
python server.py
```

You should see output confirming the server is running and waiting for clients to connect.  

---

## **👨‍💻 Running Clients**  

Each client trains the phishing detection model on its local dataset and communicates updates to the server.  

```bash
python client.py <client_id> <total_clients> <server_ip>
```
- `<client_id>` → Unique ID for the client (e.g., 0, 1, 2...)  
- `<total_clients>` → Total number of clients participating in training  
- `<server_ip>` → IP address of the federated learning server  

For example, if you have 3 clients and your server is running on **192.168.1.10**, start each client as follows:  

```bash
python client.py 0 3 192.168.1.10
python client.py 1 3 192.168.1.10
python client.py 2 3 192.168.1.10
```

---

## **🧪 Model Architecture**  

The phishing detection model is a deep neural network built using TensorFlow:  

- **Input Layer:** 30 features (preprocessed phishing website attributes)  
- **Hidden Layers:**  
  - Dense (64 neurons, ReLU activation)  
  - Dropout (20%)  
  - Dense (32 neurons, ReLU activation)  
  - Dropout (20%)  
  - Dense (16 neurons, ReLU activation)  
- **Output Layer:** 1 neuron (Sigmoid activation for binary classification)  

---

## **📊 How Federated Learning Works in PhishNet-FL**  

1️⃣ **Server Initialization:** The federated server starts and waits for clients to connect.  
2️⃣ **Client Training:** Each client trains a local model on its dataset without sharing raw data.  
3️⃣ **Model Updates:** Clients send model updates (weights) to the server instead of raw data.  
4️⃣ **Federated Aggregation:** The server averages the received model updates and improves the global model.  
5️⃣ **Global Model Distribution:** The updated global model is sent back to clients for the next training round.  
6️⃣ **Repeat:** The process repeats for multiple rounds until the model converges.  

This ensures privacy-preserving, decentralized machine learning across multiple devices.  

---

## **📌 Dependencies**  

- `flwr` (Flower for federated learning)  
- `tensorflow` (Deep learning framework)  
- `scikit-learn` (Data preprocessing and evaluation)  
- `ucimlrepo` (Dataset retrieval)  
- `numpy` (Numerical computations)  

---

## **📚 Future Improvements**  
🔹 Support for additional datasets and real-time phishing detection.  
🔹 Advanced privacy-preserving techniques like differential privacy.  
🔹 More efficient aggregation methods for improved performance.  

---

## **📬 Contact & Contribution**  

💡 Found a bug? Have a feature request? Feel free to open an issue or contribute!  
📧 Reach out if you have any questions or need help setting up PhishNet-FL.  

Happy training! 🚀🔐
