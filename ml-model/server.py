import flwr as fl
import tensorflow as tf
from tensorflow import keras
import os
import joblib
from flwr.common import parameters_to_ndarrays

# Define model
def get_model():
    inputs = keras.layers.Input(shape=(30,))
    x = keras.layers.Dense(128, activation='relu')(inputs)
    x = keras.layers.Dropout(0.3)(x)  # Added Dropout
    x = keras.layers.Dense(64, activation='relu')(x)
    x = keras.layers.Dropout(0.3)(x)  # Added Dropout
    x = keras.layers.Dense(32, activation='relu')(x)
    x = keras.layers.Dropout(0.3)(x)  # Added Dropout
    x = keras.layers.Dense(16, activation='relu')(x)  # Added new Dense layer
    outputs = keras.layers.Dense(1, activation='sigmoid')(x)

    model = keras.Model(inputs=inputs, outputs=outputs)
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    return model


# Define custom strategy
class SaveModelStrategy(fl.server.strategy.FedAvg):
    def aggregate_fit(self, rnd, results, failures):
        aggregated = super().aggregate_fit(rnd, results, failures)
        if aggregated is not None:
            try:
                parameters_aggregated, _ = aggregated
                model = get_model()
                weights = parameters_to_ndarrays(parameters_aggregated)
                model.set_weights(weights)
                os.makedirs('Trained-Model', exist_ok=True)
                model.save(f'Trained-Model/global_model_round_{rnd}.h5')
                print(f"✅ Model for round {rnd} saved successfully")

                # Save final model at last round
                if rnd == 10:
                    model.save("Trained-Model/final_30_features_model.h5")
                    print("🎯 Final model saved as final_30_features_model.h5")

            except Exception as e:
                print(f"❌ Error saving model: {str(e)}")
        return aggregated

# Define weighted average metrics
def weighted_average(metrics):
    if not metrics:
        return {}

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

# Start FL server with custom strategy
strategy = SaveModelStrategy(
    fraction_fit=0.5,
    fraction_evaluate=0.5,
    min_fit_clients=2,
    min_evaluate_clients=2,
    min_available_clients=2,
    fit_metrics_aggregation_fn=weighted_average,
    evaluate_metrics_aggregation_fn=weighted_average,
)

fl.server.start_server(
    server_address="0.0.0.0:8080",
    config=fl.server.ServerConfig(num_rounds=10),
    strategy=strategy
)

print("✅ Server stopped.")
