# client.py (use for client1.py, client2.py, client3.py)
import flwr as fl
import tensorflow as tf
from tensorflow import keras
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from ucimlrepo import fetch_ucirepo
import sys

def load_client_data(client_id: int, total_clients: int):
    """Load and partition data for specific client"""
    print(f"Fetching dataset for client {client_id}...")
    
    # Fetch dataset using ucimlrepo
    phishing_websites = fetch_ucirepo(id=327)
    
    # Get features and targets
    X = phishing_websites.data.features.values
    y = phishing_websites.data.targets.values
    
    # Ensure y is binary (0, 1)
    y = (y == 1).astype(int)
    
    # Standardize features
    scaler = StandardScaler()
    X = scaler.fit_transform(X)
    
    # Partition data for this client
    samples_per_client = len(X) // total_clients
    start_idx = client_id * samples_per_client
    end_idx = start_idx + samples_per_client if client_id < total_clients - 1 else len(X)
    
    print(f"Client {client_id} data shape: {X[start_idx:end_idx].shape}")
    return X[start_idx:end_idx], y[start_idx:end_idx]

def create_phishing_model():
    """Create and compile the model for phishing detection"""
    model = keras.Sequential([
        keras.layers.Dense(64, activation='relu', input_shape=(30,)),
        keras.layers.Dropout(0.2),
        keras.layers.Dense(32, activation='relu'),
        keras.layers.Dropout(0.2),
        keras.layers.Dense(16, activation='relu'),
        keras.layers.Dense(1, activation='sigmoid')
    ])
    
    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    return model

class PhishingClient(fl.client.NumPyClient):
    def __init__(self, client_id: int, total_clients: int):
        self.model = create_phishing_model()
        
        # Load and split data
        print(f"Initializing client {client_id}...")
        X, y = load_client_data(client_id, total_clients)
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        print(f"Client {client_id} initialized with {len(self.X_train)} training samples")
    
    def get_parameters(self, config):
        return self.model.get_weights()
    
    def fit(self, parameters, config):
        self.model.set_weights(parameters)
        history = self.model.fit(
            self.X_train, self.y_train,
            epochs=3,
            batch_size=32,
            validation_split=0.1,
            verbose=1
        )
        print(f"Training completed - Loss: {history.history['loss'][-1]:.4f}")
        return self.model.get_weights(), len(self.X_train), {
            "loss": history.history["loss"][-1]
        }
    
    def evaluate(self, parameters, config):
        self.model.set_weights(parameters)
        loss, accuracy = self.model.evaluate(self.X_test, self.y_test, verbose=0)
        print(f"Evaluation - Loss: {loss:.4f}, Accuracy: {accuracy:.4f}")
        return loss, len(self.X_test), {"accuracy": accuracy}

def main():
    # Parse command line arguments
    if len(sys.argv) != 4:
        print("Usage: python client.py <client_id> <total_clients> <server_ip>")
        sys.exit(1)
    
    client_id = int(sys.argv[1])
    total_clients = int(sys.argv[2])
    server_ip = sys.argv[3]
    
    print(f"Starting client {client_id} of {total_clients} total clients")
    print(f"Connecting to server at {server_ip}:8080")
    
    # Initialize and start client
    client = PhishingClient(client_id, total_clients)
    fl.client.start_client(
        server_address=f"{server_ip}:8080",
        client=client.to_client(),
        grpc_max_message_length=1024*1024*1024
    )

if __name__ == "__main__":
    main()