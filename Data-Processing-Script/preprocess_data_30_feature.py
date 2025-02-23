import pandas as pd
import numpy as np
from urllib.parse import urlparse
import re

def extract_enhanced_features(url):
    """Extract an enhanced set of features from URL string"""
    try:
        parsed = urlparse(url)
        
        # 1-5: Basic length features
        length_url = len(url)
        length_hostname = len(parsed.netloc)
        length_path = len(parsed.path)
        length_query = len(parsed.query)
        length_fragment = len(parsed.fragment)
        
        # 6-15: Character count features
        num_dots = url.count('.')
        num_hyphens = url.count('-')
        num_underscores = url.count('_')
        num_slashes = url.count('/')
        num_equals = url.count('=')
        num_at = url.count('@')
        num_and = url.count('&')
        num_exclamation = url.count('!')
        num_space = url.count(' ')
        num_tilde = url.count('~')
        
        # 16-20: Binary features
        has_https = int(parsed.scheme == 'https')
        has_port = int(bool(parsed.port))
        has_fragment = int(bool(parsed.fragment))
        has_query = int(bool(parsed.query))
        has_digits = int(any(c.isdigit() for c in url))
        
        # 21-25: Count-based features
        num_digits = sum(c.isdigit() for c in url)
        num_letters = sum(c.isalpha() for c in url)
        num_parameters = len(parsed.query.split('&')) if parsed.query else 0
        num_fragments = len(parsed.fragment.split('#')) if parsed.fragment else 0
        num_subdirectories = len([x for x in parsed.path.split('/') if x])
        
        # 26-30: Ratio and advanced features
        digits_ratio = num_digits / length_url if length_url > 0 else 0
        letters_ratio = num_letters / length_url if length_url > 0 else 0
        special_chars_ratio = (length_url - num_letters - num_digits) / length_url if length_url > 0 else 0
        directory_length_mean = np.mean([len(x) for x in parsed.path.split('/') if x]) if parsed.path else 0
        suspicious_tld = int(parsed.netloc.split('.')[-1] in ['xyz', 'info', 'online', 'site', 'work'])
        
        return {
            'length_url': length_url,
            'length_hostname': length_hostname,
            'length_path': length_path,
            'length_query': length_query,
            'length_fragment': length_fragment,
            'num_dots': num_dots,
            'num_hyphens': num_hyphens,
            'num_underscores': num_underscores,
            'num_slashes': num_slashes,
            'num_equals': num_equals,
            'num_at': num_at,
            'num_and': num_and,
            'num_exclamation': num_exclamation,
            'num_space': num_space,
            'num_tilde': num_tilde,
            'has_https': has_https,
            'has_port': has_port,
            'has_fragment': has_fragment,
            'has_query': has_query,
            'has_digits': has_digits,
            'num_digits': num_digits,
            'num_letters': num_letters,
            'num_parameters': num_parameters,
            'num_fragments': num_fragments,
            'num_subdirectories': num_subdirectories,
            'digits_ratio': digits_ratio,
            'letters_ratio': letters_ratio,
            'special_chars_ratio': special_chars_ratio,
            'directory_length_mean': directory_length_mean,
            'suspicious_tld': suspicious_tld
        }
    except:
        return {k: 0 for k in [
            'length_url', 'length_hostname', 'length_path', 'length_query', 'length_fragment',
            'num_dots', 'num_hyphens', 'num_underscores', 'num_slashes', 'num_equals',
            'num_at', 'num_and', 'num_exclamation', 'num_space', 'num_tilde',
            'has_https', 'has_port', 'has_fragment', 'has_query', 'has_digits',
            'num_digits', 'num_letters', 'num_parameters', 'num_fragments', 'num_subdirectories',
            'digits_ratio', 'letters_ratio', 'special_chars_ratio', 'directory_length_mean',
            'suspicious_tld'
        ]}

def preprocess_dataset(input_file, output_file):
    """Preprocess the phishing dataset with enhanced features"""
    print("Loading dataset...")
    df = pd.read_csv(input_file)
    
    # Find URL column
    url_column = None
    for col in df.columns:
        if df[col].dtype == 'object' and df[col].str.contains('http', na=False).any():
            url_column = col
            break
    
    if url_column is None:
        raise ValueError("Could not find URL column in dataset")
    
    print("Extracting enhanced features from URLs...")
    url_features = pd.DataFrame([
        extract_enhanced_features(url) for url in df[url_column]
    ])
    
    # Ensure the target column is included
    if 'label' in df.columns:
        url_features['label'] = df['label']
    elif 'phishing' in df.columns:
        url_features['label'] = df['phishing']
    else:
        url_features['label'] = df.iloc[:, -1]
    
    print("Saving processed dataset...")
    url_features.to_csv(output_file, index=False)
    print(f"Preprocessing complete. Features: {url_features.columns.tolist()}")
    print(f"Dataset shape: {url_features.shape}")
    
    return url_features

if __name__ == "__main__":
    input_file = "Training-Dataset/training_dataset_1.csv"
    output_file = "Processed-Data/processed_training_dataset_30.csv"
    
    try:
        processed_df = preprocess_dataset(input_file, output_file)
        print("\nSample of processed data:")
        print(processed_df.head())
    except Exception as e:
        print(f"Error during preprocessing: {str(e)}")