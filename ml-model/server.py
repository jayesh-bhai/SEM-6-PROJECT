import flwr as fl
import tensorflow as tf
from tensorflow import keras
import pickle
import os
import shutil

# Define a simple model for global aggregation
def get_model():
    inputs = keras.layers.Input(shape=(30,))  # Define input layer
    x = keras.layers.Dense(64, activation='relu')(inputs)
    x = keras.layers.Dense(32, activation='relu')(x)
    x = keras.layers.Dense(16, activation='relu')(x)
    outputs = keras.layers.Dense(1, activation='sigmoid')(x)

    model = keras.Model(inputs=inputs, outputs=outputs)  # Create model
    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy']  # Make sure this matches what your clients are using
    )
    return model

def save_model(strategy):
    """Save the global model after training is complete"""
    model = get_model()  # Create a model with the same architecture
    
    # For newer versions of Flower, parameters are stored in parameters_aggregated
    if hasattr(strategy, 'parameters_aggregated'):
        parameters = strategy.parameters_aggregated
        # Convert parameters to model weights format
        weights = fl.common.parameters_to_weights(parameters)
        model.set_weights(weights)
        
        try:
            # Test if model can make predictions
            test_input = tf.random.normal((1, 30))
            _ = model.predict(test_input)
            
            # Save the model files
            model.save('Trained-Model/global_model.h5')
            print("✅ Global model saved as 'global_model.h5'")
            
            with open('Trained-Model/global_model_weights.pkl', 'wb') as f:
                pickle.dump(model.get_weights(), f)
            print("✅ Global model weights saved.")
            
            with open('Trained-Model/global_model_architecture.json', 'w') as f:
                f.write(model.to_json())
            print("✅ Global model architecture saved.")
            
            return True
        except Exception as e:
            print(f"❌ Error validating model: {str(e)}")
            return False
    
    print("Failed to retrieve model parameters.")
    return False

def get_strategy():
    def weighted_average(metrics):
        if not metrics:
            return {}
            
        # Get all available metrics from first client
        weights = [num_examples for num_examples, _ in metrics]
        total_examples = sum(weights)
        
        metrics_aggregated = {}
        for metric_name in metrics[0][1].keys():
            weighted_metric = sum(
                num_examples * m[metric_name]
                for num_examples, m in metrics
            ) / total_examples
            metrics_aggregated[metric_name] = weighted_metric
            
        return metrics_aggregated

    # Create a custom strategy class that extends FedAvg
    class SaveModelStrategy(fl.server.strategy.FedAvg):
        def aggregate_fit(self, rnd, results, failures):
            # Call the parent's aggregate_fit method
            aggregated = super().aggregate_fit(rnd, results, failures)
            
            # If aggregation was successful, save the model
            if aggregated is not None:
                try:
                    # Create a directory for saving models
                    os.makedirs('Trained-Model', exist_ok=True)
                    
                    # Create a model
                    model = get_model()

                    # In Flower 1.15.2, we need to manually convert parameters
                    weights = []
                    tensors = [tf.convert_to_tensor(param) for param in aggregated]
                    for tensor in tensors:
                        weights.append(tensor.numpy())
                    
                    model.set_weights(weights)
                    
                    # Save the model for this round
                    model.save(f'Trained-Model/global_model_round_{rnd}.h5')
                    print(f"✅ Model for round {rnd} saved successfully")
                    
                    # Save weights separately
                    with open(f'Trained-Model/global_model_weights_round_{rnd}.pkl', 'wb') as f:
                        pickle.dump(model.get_weights(), f)
                        
                    # If this is the final round, save as the final model
                    if rnd == 3:  # Adjust based on your total rounds
                        model.save('Trained-Model/global_model.h5')
                        with open('Trained-Model/global_model_weights.pkl', 'wb') as f:
                            pickle.dump(model.get_weights(), f)
                        with open('Trained-Model/global_model_architecture.json', 'w') as f:
                            f.write(model.to_json())
                        print("✅ Final model saved successfully")
                        
                except Exception as e:
                    print(f"❌ Error saving model: {str(e)}")
                    
            return aggregated

    # Return an instance of our custom strategy
    return SaveModelStrategy(
        fraction_fit=0.5,
        fraction_evaluate=0.5,
        min_fit_clients=2,
        min_evaluate_clients=2,
        min_available_clients=2,
        fit_metrics_aggregation_fn=weighted_average,
        evaluate_metrics_aggregation_fn=weighted_average
    )

# Define strategy
strategy = get_strategy()

# Make sure the directory exists
os.makedirs('Trained-Model', exist_ok=True)

# Start the Flower server
fl.server.start_server(
    server_address="0.0.0.0:8080",
    config=fl.server.ServerConfig(num_rounds=3),
    strategy=strategy
)

print("✅ Server stopped.")