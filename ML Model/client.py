# client.py (use for client1.py, client2.py, client3.py)
import flwr as fl
import tensorflow as tf
from tensorflow import keras
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from ucimlrepo import fetch_ucirepo
import sys

def load_client_data(client_id: int, total_clients: int):
    """Load and partition data for a specific client from local CSV"""
    print(f"Loading dataset for client {client_id} from local CSV...")

    # Load CSV file
    df = pd.read_csv("Processed-Data/processed_training_dataset_30.csv")  # Ensure the correct filename
    
    # Separate features (X) and target (y)
    X = df.iloc[:, :-1].values  # All columns except the last one as features
    y = df.iloc[:, -1].values   # Last column as target (phishing or not)

    # Ensure y is binary (0 or 1)
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
    
    inputs = keras.layers.Input(shape=(30,))  # Define the input layer
    x = keras.layers.Dense(64, activation='relu')(inputs)
    x = keras.layers.Dropout(0.3)(x)
    x = keras.layers.Dense(32, activation='relu')(x)
    x = keras.layers.Dropout(0.3)(x)
    x = keras.layers.Dense(16, activation='relu')(x)
    outputs = keras.layers.Dense(1, activation='sigmoid')(x)
    
    model = keras.Model(inputs=inputs, outputs=outputs)  # Create model
    
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
            batch_size=16,
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
    
    try:
        # Initialize and start client
        client = PhishingClient(client_id, total_clients)
        print(f"Client {client_id} initialized successfully, attempting to connect to server...")
        
        fl.client.start_numpy_client(
            server_address=server_ip + ":8080",
            client=client
        )
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        sys.exit(1)
    
    # Wait for training to complete
    
    print(f"Client {client_id} finished training")
    print(f"Client {client_id} exiting...")
    sys.exit(0)  

if __name__ == "__main__":
    main()