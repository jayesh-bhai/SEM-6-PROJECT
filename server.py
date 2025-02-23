import flwr as fl
import tensorflow as tf
from tensorflow import keras
import pickle

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

    if hasattr(strategy, 'initial_parameters'):
        parameters = strategy.initial_parameters
        if parameters is not None:
            model.set_weights(parameters)
            
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
    
    print("❌ Failed to retrieve model parameters.")
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

    return fl.server.strategy.FedAvg(
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

# Start the Flower server
fl.server.start_server(
    server_address="0.0.0.0:8080",
    config=fl.server.ServerConfig(num_rounds=3),
    strategy=strategy
)

# Save the final model using the strategy
save_model(strategy)

print("✅ Server stopped.")