import pandas as pd
import numpy as np
from urllib.parse import urlparse
from sklearn.preprocessing import LabelEncoder
import re

def extract_url_features(url):
    """Extract features from URL string"""
    try:
        parsed = urlparse(url)
        
        # Length-based features
        length_url = len(url)
        length_hostname = len(parsed.netloc)
        length_path = len(parsed.path)
        
        # Count-based features
        num_dots = url.count('.')
        num_hyphens = url.count('-')
        num_underscores = url.count('_')
        num_slashes = url.count('/')
        num_digits = sum(c.isdigit() for c in url)
        num_parameters = len(parsed.query.split('&')) if parsed.query else 0
        
        # Boolean features
        has_https = int(parsed.scheme == 'https')
        has_port = int(bool(parsed.port))
        has_fragment = int(bool(parsed.fragment))
        
        return {
            'length_url': length_url,
            'length_hostname': length_hostname,
            'length_path': length_path,
            'num_dots': num_dots,
            'num_hyphens': num_hyphens,
            'num_underscores': num_underscores,
            'num_slashes': num_slashes,
            'num_digits': num_digits,
            'num_parameters': num_parameters,
            'has_https': has_https,
            'has_port': has_port,
            'has_fragment': has_fragment
        }
    except:
        # Return default values if URL parsing fails
        return {k: 0 for k in ['length_url', 'length_hostname', 'length_path', 
                              'num_dots', 'num_hyphens', 'num_underscores', 
                              'num_slashes', 'num_digits', 'num_parameters',
                              'has_https', 'has_port', 'has_fragment']}

def preprocess_dataset(input_file, output_file):
    """Preprocess the phishing dataset and save to new CSV"""
    print("Loading dataset...")
    df = pd.read_csv(input_file)
    
    # Drop rows with missing values
    df = df.dropna()
    
    # Drop duplicate rows
    df = df.drop_duplicates()
    
    # Drop rows with non-string data types
    df = df.select_dtypes(include=['object'])
    
    # Drop rows with non-English characters
    df = df[df['url'].apply(lambda x: isinstance(x, str) and x.isascii())]
    
    # Drop rows with invalid URLs
    df = df[df['url'].str.contains('http', na=False)]
    
    
    # Identify the URL column (assuming it's the first string column)
    url_column = None
    for col in df.columns:
        if df[col].dtype == 'object' and df[col].str.contains('http', na=False).any():
            url_column = col
            break
    
    if url_column is None:
        raise ValueError("Could not find URL column in dataset")
    
    print("Extracting features from URLs...")
    # Extract features from URLs
    url_features = pd.DataFrame([
        extract_url_features(url) for url in df[url_column]
    ])
    
    # Drop the original URL column and combine with any existing numeric features
    numeric_columns = df.select_dtypes(include=[np.number]).columns
    if len(numeric_columns) > 0:
        existing_features = df[numeric_columns]
        processed_df = pd.concat([url_features, existing_features], axis=1)
    else:
        processed_df = url_features
    
    # Ensure the target column (assuming it's the last column) is included
    if 'label' in df.columns:
        processed_df['label'] = df['label']
    elif 'phishing' in df.columns:
        processed_df['label'] = df['phishing']
    else:
        processed_df['label'] = df.iloc[:, -1]  # Assume last column is target
    
    print("Saving processed dataset...")
    processed_df.to_csv(output_file, index=False)
    print(f"Preprocessing complete. Processed features: {processed_df.columns.tolist()}")
    print(f"Dataset shape: {processed_df.shape}")
    
    return processed_df

if __name__ == "__main__":
    input_file = "Training-Dataset/training_dataset_1.csv"
    output_file = "Processed-Data/processed_training_dataset.csv"
    
    try:
        processed_df = preprocess_dataset(input_file, output_file)
        print("\nSample of processed data:")
        print(processed_df.head())
    except Exception as e:
        print(f"Error during preprocessing: {str(e)}")