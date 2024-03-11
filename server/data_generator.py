import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

# Adjusting the dataset to reflect a mix of trends:
# - Higher sales volumes on weekends
# - Increased sales for certain product categories in specific months (e.g., Electronics in January, Home & Kitchen in March)
# - Differing popularity by location
# - Price sensitivity for certain categories


def generate_date_with_weekend_preference(start_date, end_date, n_rows):
    dates = []
    for _ in range(n_rows):
        date = start_date + timedelta(days=random.randint(0, (end_date - start_date).days))
        if date.weekday() >= 5:  # Saturday or Sunday
            if random.random() < 0.7:
                dates.append(date)
            else:
                dates.append(date - timedelta(days=random.randint(1, 2)))
        else:
            if random.random() < 0.3:
                dates.append(date)
            else:
                dates.append(date + timedelta(days=(5 - date.weekday())))
    return dates


def adjust_product_details(n_rows, dates):
    categories = []
    unit_prices = []
    for date in dates:
        month = date.month
        category = random.choice(["Electronics", "Clothing", "Home & Kitchen", "Beauty & Personal Care"])
        if month == 1:
            category = "Electronics" if random.random() < 0.5 else category
        elif month == 3:
            category = "Home & Kitchen" if random.random() < 0.5 else category
        categories.append(category)

        if category == "Electronics":
            price = round(random.uniform(50, 200), 2)
        elif category == "Home & Kitchen":
            price = round(random.uniform(30, 150), 2)
        else:
            price = round(random.uniform(10, 100), 2)
        unit_prices.append(price)
    return categories, unit_prices


# Parameters for the dataset
n_rows = 1000
start_date = datetime(2023, 1, 1)
end_date = datetime(2023, 3, 31)

# Generate the data
dates = generate_date_with_weekend_preference(start_date, end_date, n_rows)
product_categories, unit_prices = adjust_product_details(n_rows, dates)

# Other data
customer_ids = np.random.randint(1, 50, n_rows)
product_ids = np.random.randint(1, 20, n_rows)
quantities_sold = np.random.randint(1, 5, n_rows)
sales_channels = np.random.choice(["Online", "In-Store"], n_rows)
customer_locations = np.random.choice(["New York", "California", "Texas", "Florida", "Illinois"], n_rows)
revenues = (quantities_sold * unit_prices).round(2)

# Create the DataFrame
enhanced_df = pd.DataFrame({
    "Transaction_ID": np.arange(1, n_rows + 1),
    "Date": dates,
    "Customer_ID": customer_ids,
    "Product_ID": product_ids,
    "Product_Category": product_categories,
    "Quantity_Sold": quantities_sold,
    "Unit_Price": unit_prices,
    "Sales_Channel": sales_channels,
    "Customer_Location": customer_locations,
    "Revenue": revenues
})

# Sort by Date for better readability
enhanced_df.sort_values("Date", inplace=True)

# Save the dataset
file_path = "./sales_data_1000_rows.csv"  # Change this path as needed for your local environment
enhanced_df.to_csv(file_path, index=False)

print(f"Dataset saved to {file_path}")