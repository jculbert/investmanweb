import requests
from datetime import datetime
import mysql.connector

# Import API key from local module
from api_key import API_KEY

# List of Canadian tickers you want to fetch
symbols = ["BMO.TO", "ENB.TO", "SHOP.TO", "BEP.UN.TO"]

def fetch_json_array(url):
    """
    Call an HTTP URL that returns a JSON array and iterate over it.
    
    Args:
        url (str): The HTTP URL to call
        
    Returns:
        list: The JSON array from the response, or empty list if error occurs
    """
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        # Ensure response is a list
        if isinstance(data, list):
            return data
        else:
            print(f"Warning: Expected JSON array but got {type(data).__name__}")
            return []
    except requests.exceptions.RequestException as e:
        print(f"Error fetching URL {url}: {e}")
        return []
    except ValueError as e:
        print(f"Error parsing JSON from {url}: {e}")
        return []

def process_json_array(url):
    """
    Fetch and process a JSON array from an HTTP URL.
    
    Args:
        url (str): The HTTP URL to call
    """
    items = fetch_json_array(url)
    
    if not items:
        print("No items to process")
        return
    
    for index, item in enumerate(items):
        print(f"Item {index}: {item}")

def extract_symbol_names(json_array):
    """
    Extract symbol names from a JSON array with entries containing nested symbol objects.
    
    Expects entries in the format:
    {"symbol": {"name": "SYMBOL.TO", "description": "...", ...}, "quantity": 0.0, ...}
    
    Skips entries where:
      - The symbol name contains any numeric character (0-9)
      - The quantity field is <= 0
    
    Args:
        json_array (list): The JSON array from the API response
        
    Returns:
        list: List of symbol names (strings) extracted from the array
    """
    symbol_names = []
    
    for entry in json_array:
        try:
            # Navigate to symbol.name and quantity
            if isinstance(entry, dict) and "symbol" in entry:
                symbol_obj = entry["symbol"]
                if isinstance(symbol_obj, dict) and "name" in symbol_obj:
                    symbol_name = symbol_obj["name"]
                    
                    # Skip if name contains any numeric character
                    if symbol_name and any(c.isdigit() for c in symbol_name):
                        print(f"Skipping {symbol_name}: contains numeric character")
                        continue
                    
                    # Check quantity field
                    quantity = entry.get("quantity", 0)
                    try:
                        quantity = float(quantity)
                    except (ValueError, TypeError):
                        quantity = 0
                    
                    # Skip if quantity <= 0
                    if quantity <= 0:
                        print(f"Skipping {symbol_name}: quantity is {quantity}")
                        continue
                    
                    if symbol_name:
                        symbol_names.append(symbol_name)
        except (KeyError, TypeError) as e:
            print(f"Warning: Could not extract symbol from entry: {e}")
            continue
    
    return symbol_names

def fetch_symbol_names_from_url(url):
    """
    Fetch a JSON array from a URL and extract all symbol names.
    
    Args:
        url (str): The HTTP URL to call
        
    Returns:
        list: List of symbol names (strings)
    """
    items = fetch_json_array(url)
    return extract_symbol_names(items)

def fetch_stock_prices(symbol_list):
    """
    Query latest stock prices for a list of Canadian stock symbols using Marketstack.
    Returns: dict {symbol: (price, timestamp)}
    """
    base_url = "http://api.marketstack.com/v1/eod/latest"

    # API accepts comma-separated symbol list
    params = {
        "access_key": API_KEY,
        "symbols": ",".join(symbol_list)
    }

    response = requests.get(base_url, params=params)
    response.raise_for_status()
    data = response.json()

    result = {}

    # Marketstack wraps results under "data"
    for item in data.get("data", []):
        symbol = item["symbol"]
        close_price = item["close"]
        timestamp = item["date"]
        result[symbol] = (close_price, timestamp)

    return result


def _parse_date_to_date(date_str):
    """Try to parse a date/time string into a date object. Returns None on failure."""
    if not date_str:
        return None
    try:
        # Prefer ISO format parser when available
        try:
            return datetime.fromisoformat(date_str).date()
        except Exception:
            # Fallback common formats
            for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S"):
                try:
                    return datetime.strptime(date_str, fmt).date()
                except Exception:
                    continue
    except Exception:
        return None
    return None


def update_symbol_prices_from_url(url, setup_django=True):
    """
    Fetch symbol names from `url`, request prices in batches of 20 using
    `fetch_stock_prices`, and update the `last_price` and `last_price_date`
    fields directly in the MySQL database (no Django ORM).

    Database connection parameters are read from environment variables:
      - MYSQL_HOST (default: 'localhost')
      - MYSQL_PORT (default: 3306)
      - MYSQL_USER (default: 'root')
      - MYSQL_PASSWORD (default: '')
      - MYSQL_DB (default: 'investmanweb')

    The function updates the `symbols_symbol` table which is the default
    Django table name for the `symbols.Symbol` model. If your project uses a
    different table name, change the `table_name` variable below.

    Returns a dict with counters: {'updated': int, 'skipped': int}
    """
    # Hard-coded DB connection info
    db_host = '127.0.0.1'
    db_port = 3306
    db_user = 'myuser'
    db_pass = 'mypassword'
    db_name = 'investmanweb'

    # Default Django table for Symbol model
    table_name = 'symbols_symbol'

    symbol_names = fetch_symbol_names_from_url(url)
    if not symbol_names:
        print("No symbol names found at URL")
        return {'updated': 0, 'skipped': 0}

    try:
        conn = mysql.connector.connect(
            host=db_host,
            port=db_port,
            user=db_user,
            password=db_pass,
            database=db_name,
            charset='utf8mb4'
        )
        cursor = conn.cursor()
    except Exception as e:
        print(f"Error connecting to MySQL: {e}")
        return {'updated': 0, 'skipped': len(symbol_names)}

    total_updated = 0
    total_skipped = 0

    chunk_size = 20
    update_sql = f"UPDATE {table_name} SET last_price = %s, last_price_date = %s WHERE name = %s"

    for i in range(0, len(symbol_names), chunk_size):
        chunk = symbol_names[i:i + chunk_size]
        try:
            prices = fetch_stock_prices(chunk)
        except Exception as e:
            print(f"Error fetching prices for chunk starting at {i}: {e}")
            total_skipped += len(chunk)
            continue

        params_list = []
        names_in_chunk = []
        for sym in chunk:
            if sym not in prices:
                total_skipped += 1
                print(f"Price not returned for {sym}")
                continue

            price_val, ts = prices[sym]
            # Convert price and date to DB-friendly values
            try:
                price_db = float(price_val) if price_val is not None else None
            except Exception:
                print(f"Could not convert price for {sym}: {price_val}")
                total_skipped += 1
                continue

            parsed_date = _parse_date_to_date(ts)
            date_db = parsed_date.strftime('%Y-%m-%d') if parsed_date else None

            params_list.append((price_db, date_db, sym))
            names_in_chunk.append(sym)

        # Execute updates
        if params_list:
            try:
                for params in params_list:
                    cursor.execute(update_sql, params)
                    if cursor.rowcount == 0:
                        # symbol not present in table
                        total_skipped += 1
                    else:
                        total_updated += 1
                conn.commit()
            except Exception as e:
                print(f"Error executing update statements for chunk starting at {i}: {e}")
                conn.rollback()
                total_skipped += len(params_list)

    try:
        cursor.close()
        conn.close()
    except Exception:
        pass

    print(f"Update complete: {total_updated} updated, {total_skipped} skipped")
    return {'updated': total_updated, 'skipped': total_skipped}


def main():
    # CLI entrypoint for updating symbol prices
 
    import os
    import sys

    url = "http://linux1/investmanbackend/api/v1/holdings/?account=All"

    # Hard-coded URL to fetch holdings from
    #url = 'https://api.example.com/holdings'
    #print(f"Updating symbol prices from: {url}")
    #result = update_symbol_prices_from_url(url, setup_django=False)
    #print("Result:", result)

    result = fetch_symbol_names_from_url(url)

if __name__ == '__main__':
    main()
